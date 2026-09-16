const DEFAULT_AUTH_REDIRECT = "/events/new";

/**
 * Returns an internal path that is safe to use after authentication.
 *
 * Never pass an unvalidated callback URL to the router or an OAuth provider:
 * protocol-relative values such as `//example.com` are external URLs too.
 */
export function getSafeAuthRedirect(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u001F]/.test(decodePath(value))
  ) {
    return DEFAULT_AUTH_REDIRECT;
  }

  try {
    const target = new URL(value, "https://candidcrowd.local");

    return target.origin === "https://candidcrowd.local"
      ? `${target.pathname}${target.search}${target.hash}`
      : DEFAULT_AUTH_REDIRECT;
  } catch {
    return DEFAULT_AUTH_REDIRECT;
  }
}

function decodePath(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function withAuthRedirect(
  path: "/login" | "/register" | "/forgot-password" | "/reset-password",
  nextPath?: string,
): string {
  const safeNextPath = getSafeAuthRedirect(nextPath);

  return safeNextPath === DEFAULT_AUTH_REDIRECT
    ? path
    : `${path}?next=${encodeURIComponent(safeNextPath)}`;
}

export function getCurrentRelativePath(): string {
  if (typeof window === "undefined") return DEFAULT_AUTH_REDIRECT;

  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export { DEFAULT_AUTH_REDIRECT };
