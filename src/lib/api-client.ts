import { authClient } from "@/lib/auth-client";

const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class APIError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

async function accessToken(): Promise<string> {
  const { data, error } = await authClient.token({
    fetchOptions: { cache: "no-store" },
  });

  if (error || !data?.token) {
    throw new APIError(
      401,
      "unauthenticated",
      "Your session has expired. Please sign in again.",
    );
  }

  return data.token;
}

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
  let response = await authorizedFetch(url, init, await accessToken());

  if (response.status === 401) {
    response = await authorizedFetch(url, init, await accessToken());
  }

  if (!response.ok) {
    const body = (await response
      .clone()
      .json()
      .catch(() => null)) as {
      error?: { code?: string; message?: string };
    } | null;

    throw new APIError(
      response.status,
      body?.error?.code || "request_failed",
      body?.error?.message || "The request could not be completed.",
    );
  }

  return response;
}
