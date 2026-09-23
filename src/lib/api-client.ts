import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/errors";

// Keep browser requests same-origin. Next rewrites /api/v1 to API_UPSTREAM_URL
// server-side, so HTTPS guest pages never make insecure HTTP API requests.
const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL || undefined;

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export function clearAuthTokenCache(): void {
  cachedToken = null;
  tokenExpiresAt = 0;
}

export class APIError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message?: string,
    public readonly raw?: unknown,
  ) {
    super(message || getErrorMessage(code));
    this.name = "APIError";
  }
}

/**
 * Normalizes an Axios error into a standardized APIError with user-friendly messages.
 */
function normalizeAxiosError(
  error: AxiosError<{
    error?: { code?: string; message?: string };
    code?: string;
    message?: string;
  }>,
): APIError {
  const status = error.response?.status || (error.request ? 0 : 500);
  const data = error.response?.data;
  const code =
    data?.error?.code ||
    data?.code ||
    (status === 401
      ? "unauthenticated"
      : status === 403
        ? "forbidden"
        : status === 404
          ? "event_not_found"
          : status === 0
            ? "network_error"
            : "request_failed");

  const message =
    data?.error?.message || data?.message || getErrorMessage(code);

  return new APIError(status, code, message, data);
}

/**
 * Retrieves the current session's JWT token via Better Auth.
 * Returns null if not authenticated.
 * Caches token in-memory for up to 5 minutes to avoid repeated roundtrips.
 */
export async function getAuthToken(
  forceRefresh = false,
): Promise<string | null> {
  const now = Date.now();

  if (!forceRefresh && cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  try {
    const { data, error } = await authClient.token({
      fetchOptions: { cache: "no-store" },
    });

    if (error || !data?.token) {
      cachedToken = null;
      tokenExpiresAt = 0;

      return null;
    }

    cachedToken = data.token;
    tokenExpiresAt = now + 5 * 60 * 1000;

    return cachedToken;
  } catch {
    cachedToken = null;
    tokenExpiresAt = 0;

    return null;
  }
}

/**
 * Public Axios client:
 * Used for endpoints that do NOT require authentication:
 * - Guest event views (/api/v1/public/events/:slug)
 * - Guest anonymous sessions & uploads
 * - Public marketing or static content
 */
export const publicClient = axios.create({
  baseURL: apiBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

publicClient.interceptors.response.use(
  (response) => response,
  (
    error: AxiosError<{
      error?: { code?: string; message?: string };
      code?: string;
      message?: string;
    }>,
  ) => {
    return Promise.reject(normalizeAxiosError(error));
  },
);

/**
 * Private Axios client:
 * Used for authenticated Host endpoints:
 * - Event management (/api/v1/events)
 * - Host media moderation and downloads
 * - Account settings and analytics
 *
 * Automatically attaches JWT Bearer token and retries once on 401.
 */
export const privateClient = axios.create({
  baseURL: apiBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

privateClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!config.headers.Authorization) {
      const token = await getAuthToken();

      if (!token) {
        throw new APIError(
          401,
          "unauthenticated",
          getErrorMessage("unauthenticated"),
        );
      }

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

privateClient.interceptors.response.use(
  (response) => response,
  async (
    error: AxiosError<{
      error?: { code?: string; message?: string };
      code?: string;
      message?: string;
    }>,
  ) => {
    const originalRequest = error.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // Retry once on 401 Unauthorized with fresh token
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      clearAuthTokenCache();

      const freshToken = await getAuthToken(true);

      if (freshToken) {
        originalRequest.headers.Authorization = `Bearer ${freshToken}`;

        return privateClient(originalRequest);
      }
    }

    const normalizedError = normalizeAxiosError(error);

    return Promise.reject(normalizedError);
  },
);

/**
 * Backward-compatible fetch wrapper using Better Auth token.
 */
async function authorizedFetch(
  url: URL,
  init: RequestInit,
  token: string,
): Promise<Response> {
  const headers = new Headers(init.headers);

  headers.set("Authorization", `Bearer ${token}`);

  return fetch(url, { ...init, headers });
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  if (!apiBaseURL) throw new Error("NEXT_PUBLIC_API_BASE_URL is required");

  const url = new URL(path, apiBaseURL);
  const token = await getAuthToken();

  if (!token) {
    throw new APIError(
      401,
      "unauthenticated",
      getErrorMessage("unauthenticated"),
    );
  }

  let response = await authorizedFetch(url, init, token);

  if (response.status === 401) {
    clearAuthTokenCache();

    const refreshedToken = await getAuthToken(true);

    if (refreshedToken) {
      response = await authorizedFetch(url, init, refreshedToken);
    }
  }

  if (!response.ok) {
    const body = (await response
      .clone()
      .json()
      .catch(() => null)) as {
      error?: { code?: string; message?: string };
      code?: string;
    } | null;

    const code = body?.error?.code || body?.code || "request_failed";

    throw new APIError(response.status, code, getErrorMessage(code));
  }

  return response;
}

/**
 * Internal Next.js App / BFF client:
 * Used for calling same-origin Next.js Route Handlers (/api/v1/*, /api/*)
 * that authenticate via HTTP-only session cookies rather than external JWT.
 * Automatically handles JSON serialization, error normalization, and types.
 */
export async function appFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...init,
    headers,
  });

  const body = (await response.json().catch(() => ({}))) as {
    error?: string | { code?: string; message?: string };
    code?: string;
    message?: string;
  };

  if (!response.ok || body.error) {
    const rawCode =
      typeof body.error === "string"
        ? body.error
        : body.error?.code || body.code || "REQUEST_FAILED";
    const message =
      typeof body.error === "object" && body.error?.message
        ? body.error.message
        : body.message || getErrorMessage(rawCode);

    throw new APIError(response.status, rawCode, message, body);
  }

  return body as T;
}
