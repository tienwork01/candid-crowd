"use client";

import { useCallback, useRef } from "react";
import { APIError, publicClient } from "@/lib/api-client";
import { optimizeImageForUpload } from "../lib/optimize-image-for-upload";

type GuestSessionResponse = {
  guest_session_token: string;
};

type UploadTargetResponse = {
  media_id: string;
  upload_url: string;
  expires_at: string;
  required_headers: Record<string, string>;
};

export type UploadedGuestMedia = {
  id: string;
  url: string;
  mimeType: string;
};

type UploadFileOptions = {
  onProgress?: (percent: number) => void;
};

function sessionStorageKey(slug: string): string {
  return `candidcrowd.guest-session.${slug}`;
}

function clearSessionToken(
  slug: string,
  tokenRef: { current: string | null },
): void {
  tokenRef.current = null;

  try {
    window.sessionStorage.removeItem(sessionStorageKey(slug));
  } catch {
    // Private browsing and embedded browsers can deny storage access. A fresh
    // in-memory token is still enough to complete this upload.
  }
}

function putToPresignedURL(
  target: UploadTargetResponse,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("PUT", target.upload_url, true);
    request.withCredentials = false;

    Object.entries(target.required_headers).forEach(([name, value]) => {
      request.setRequestHeader(name, value);
    });

    request.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onerror = () => reject(new Error("direct_upload_network_error"));
    request.onabort = () => reject(new Error("direct_upload_aborted"));

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();

        return;
      }

      reject(new Error(`direct_upload_failed_${request.status}`));
    };

    request.send(file);
  });
}

/**
 * Owns the guest session and performs a browser → R2 direct PUT. Provider URLs
 * are never persisted; completed media is addressed through a stable API route.
 */
export function useGuestUpload(slug: string) {
  const tokenRef = useRef<string | null>(null);

  const getSessionToken = useCallback(async () => {
    if (tokenRef.current) return tokenRef.current;

    const storageKey = sessionStorageKey(slug);
    let stored: string | null = null;

    try {
      stored = window.sessionStorage.getItem(storageKey);
    } catch {
      // Continue without persistence when browser storage is unavailable.
    }

    if (stored) {
      tokenRef.current = stored;

      return stored;
    }

    const response = await publicClient.post<GuestSessionResponse>(
      `/api/v1/public/events/${encodeURIComponent(slug)}/sessions`,
    );

    tokenRef.current = response.data.guest_session_token;

    try {
      window.sessionStorage.setItem(storageKey, tokenRef.current);
    } catch {
      // Persistence is an optimization; it must not block a guest upload.
    }

    return tokenRef.current;
  }, [slug]);

  const uploadFile = useCallback(
    async (
      file: File,
      options: UploadFileOptions = {},
    ): Promise<UploadedGuestMedia> => {
      const uploadFile = await optimizeImageForUpload(file);
      let token = await getSessionToken();
      let lastError: unknown;

      // A fresh target is required for retry because signed URLs can expire.
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const targetResponse = await publicClient.post<UploadTargetResponse>(
            `/api/v1/public/events/${encodeURIComponent(slug)}/uploads`,
            {
              filename: file.name,
              mime_type: uploadFile.type,
              size: uploadFile.size,
              guest_session_token: token,
            },
          );
          const target = targetResponse.data;

          await putToPresignedURL(target, uploadFile, options.onProgress);
          await publicClient.post(
            `/api/v1/public/events/${encodeURIComponent(slug)}/uploads/${target.media_id}/complete`,
            { guest_session_token: token },
          );

          const contentPath = `/api/v1/public/events/${encodeURIComponent(slug)}/media/${target.media_id}/content`;

          return {
            id: target.media_id,
            url: publicClient.getUri({ url: contentPath }),
            mimeType: uploadFile.type,
          };
        } catch (error) {
          lastError = error;

          if (
            error instanceof APIError &&
            error.code === "invalid_guest_session"
          ) {
            clearSessionToken(slug, tokenRef);
            token = await getSessionToken();
          }
        }
      }

      throw lastError instanceof Error
        ? lastError
        : new Error("guest_upload_failed");
    },
    [getSessionToken, slug],
  );

  return { uploadFile };
}
