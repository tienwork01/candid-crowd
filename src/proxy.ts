import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { auth } from "@/lib/auth";

/**
 * Validates the Better Auth session before rendering the host workspace.
 * API/backend authorization remains mandatory for every private operation.
 */
export async function proxy(request: NextRequest) {
  // Better Auth uses a `__Secure-` prefix for production HTTPS cookies.
  const sessionCookie = getSessionCookie(request.headers);

  if (sessionCookie && (await hasValidSession(request))) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  loginUrl.searchParams.set("next", nextPath);

  return NextResponse.redirect(loginUrl);
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
      query: { disableCookieCache: true, disableRefresh: true },
    });

    return Boolean(session?.session && session.user);
  } catch {
    return false;
  }
}

// Next.js statically analyzes matcher values, so keep these literal rather
// than assigning them through a variable.
export const config = {
  matcher: ["/create", "/events/:path*", "/profile", "/billing"],
};
