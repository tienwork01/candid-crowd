"use client";

import { useCallback, useRef } from "react";
import { APIError, publicClient } from "@/lib/api-client";
import {
  getPendingUploads,
  removePendingUpload,
  savePendingUpload,
  updatePendingUpload,
  type PendingUploadItem,
} from "@/features/pwa/lib";
import { optimizeImageForUpload } from "../lib/optimize-image-for-upload";

type GuestSessionResponse = { guest_session_token: string };
type UploadTargetResponse = {
  media_id: string;
  upload_url: string;
  expires_at: string;
  required_headers: Record<string, string>;
};

async function sha256(file: Blob): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error("sha256_unavailable");

  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    await file.arrayBuffer(),
  );

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export type UploadedGuestMedia = { id: string; url: string; mimeType: string };
export type RestoredGuestUpload = PendingUploadItem & { file: File };
type UploadFileOptions = { id: string; onProgress?: (percent: number) => void };

function sessionStorageKey(slug: string): string {
  return `candidcrowd.guest-session.${slug}`;
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
    Object.entries(target.required_headers).forEach(([name, value]) =>
      request.setRequestHeader(name, value),
    );

    request.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0)
        onProgress?.(Math.round((event.loaded / event.total) * 100));
    };

    request.onerror = () => reject(new Error("direct_upload_network_error"));
    request.onabort = () => reject(new Error("direct_upload_aborted"));
    request.onload = () =>
      request.status >= 200 && request.status < 300
        ? resolve()
        : reject(new Error(`direct_upload_failed_${request.status}`));
    request.send(file);
  });
}

function isInvalidSession(error: unknown): boolean {
  return error instanceof APIError && error.code === "invalid_guest_session";
}

/** Durable browser → R2 upload. It stores the Blob before networking starts. */
export function useGuestUpload(slug: string) {
  const tokenRef = useRef<string | null>(null);

  const getSessionToken = useCallback(
    async (persistedToken?: string) => {
      if (tokenRef.current) return tokenRef.current;

      let stored: string | null = persistedToken || null;

      try {
        stored ||= window.sessionStorage.getItem(sessionStorageKey(slug));
      } catch {
        /* memory fallback */
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
        window.sessionStorage.setItem(
          sessionStorageKey(slug),
          tokenRef.current,
        );
      } catch {
        /* queue is fallback */
      }

      return tokenRef.current;
    },
    [slug],
  );

  const restorePendingUploads = useCallback(async (): Promise<
    RestoredGuestUpload[]
  > => {
    const items = await getPendingUploads(slug);

    return items.map((item) => ({
      ...item,
      file: new File([item.fileBlob], item.fileName, { type: item.mimeType }),
    }));
  }, [slug]);

  const uploadFile = useCallback(
    async (
      file: File,
      options: UploadFileOptions,
    ): Promise<UploadedGuestMedia> => {
      const queueID = options.id;
      const persisted = (await getPendingUploads(slug)).find(
        (item) => item.id === queueID,
      );

      if (!persisted) {
        try {
          await savePendingUpload({
            id: queueID,
            slug,
            fileBlob: file,
            fileName: file.name,
            mimeType: file.type,
            size: file.size,
          });
        } catch {
          // Private/embedded browsers can deny IndexedDB. Keep the foreground
          // upload usable even though it cannot be restored after a reload.
        }
      }

      try {
        const optimized = await optimizeImageForUpload(file);
        const checksumSHA256 = await sha256(optimized);
        let token = await getSessionToken(persisted?.guestSessionToken);

        await updatePendingUpload(queueID, {
          status: "uploading",
          guestSessionToken: token,
        });

        let target: UploadTargetResponse | null = null;

        for (let attempt = 0; attempt < 2 && !target; attempt += 1) {
          try {
            const response = await publicClient.post<UploadTargetResponse>(
              `/api/v1/public/events/${encodeURIComponent(slug)}/uploads`,
              {
                filename: file.name,
                mime_type: optimized.type,
                size: optimized.size,
                checksum_sha256: checksumSHA256,
                client_upload_id: queueID,
                guest_session_token: token,
              },
            );

            target = response.data;
            await updatePendingUpload(queueID, {
              mediaId: target.media_id,
              guestSessionToken: token,
              status: "uploading",
            });
          } catch (error) {
            if (!isInvalidSession(error) || attempt > 0) throw error;
            tokenRef.current = null;
            token = await getSessionToken();
          }
        }

        if (!target) throw new Error("upload_target_unavailable");
        await putToPresignedURL(target, optimized, options.onProgress);

        let completeError: unknown;

        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            await publicClient.post(
              `/api/v1/public/events/${encodeURIComponent(slug)}/uploads/${target.media_id}/complete`,
              { guest_session_token: token },
            );
            await removePendingUpload(queueID);

            return {
              id: target.media_id,
              url: publicClient.getUri({
                url: `/api/v1/public/events/${encodeURIComponent(slug)}/media/${target.media_id}/content`,
              }),
              mimeType: optimized.type,
            };
          } catch (error) {
            completeError = error;
            if (isInvalidSession(error)) break;
          }
        }

        throw completeError instanceof Error
          ? completeError
          : new Error("upload_complete_failed");
      } catch (error) {
        await updatePendingUpload(queueID, {
          status: "failed",
          lastError:
            error instanceof Error ? error.message : "guest_upload_failed",
        });
        throw error;
      }
    },
    [getSessionToken, slug],
  );

  return { uploadFile, restorePendingUploads };
}
