import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { auth } from "@/lib/auth";
import {
  isAppLocale,
  localeCookieName,
  resolveAcceptLanguage,
} from "@/i18n/locales";

const marketingPaths = new Set(["/", "/privacy", "/terms"]);

/**
 * Validates the Better Auth session before rendering the host workspace.
 * API/backend authorization remains mandatory for every private operation.
 */
export async function proxy(request: NextRequest) {
  const localeResponse = resolveMarketingLocale(request);

  if (localeResponse) return localeResponse;

  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

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

function isProtectedPath(pathname: string): boolean {
  return (
    pathname === "/create" ||
    pathname === "/billing" ||
    pathname === "/profile" ||
    pathname === "/events" ||
    pathname.startsWith("/events/")
  );
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
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

/**
 * Marketing URLs are localized for SEO, while app and QR URLs intentionally stay
 * language-neutral. A rewrite lets existing route files continue to serve them.
 */
function resolveMarketingLocale(
  request: NextRequest,
): NextResponse | undefined {
  const { pathname } = request.nextUrl;
  const [, firstSegment, ...remainingSegments] = pathname.split("/");

  if (isAppLocale(firstSegment)) {
    const destinationPath =
      `/${remainingSegments.join("/")}`.replace(/\/$/, "") || "/";

    if (!marketingPaths.has(destinationPath)) return undefined;

    const rewriteUrl = request.nextUrl.clone();

    rewriteUrl.pathname = destinationPath;

    const requestHeaders = new Headers(request.headers);

    requestHeaders.set("x-candidcrowd-locale", firstSegment);

    const response = NextResponse.rewrite(rewriteUrl, {
      request: { headers: requestHeaders },
    });

    response.cookies.set(localeCookieName, firstSegment, {
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  }

  if (!marketingPaths.has(pathname)) return undefined;

  const selectedLocale =
    request.cookies.get(localeCookieName)?.value ??
    resolveAcceptLanguage(request.headers.get("accept-language"));
  const redirectUrl = request.nextUrl.clone();

  redirectUrl.pathname = `/${selectedLocale}${pathname === "/" ? "" : pathname}`;

  return NextResponse.redirect(redirectUrl);
}
