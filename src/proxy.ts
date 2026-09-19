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

  if (isAuthPath(request.nextUrl.pathname)) {
    const sessionCookie = getSessionCookie(request.headers);

    if (sessionCookie && (await hasValidSession(request))) {
      const nextParam = request.nextUrl.searchParams.get("next");
      const target =
        nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
          ? nextParam
          : "/profile";

      return NextResponse.redirect(new URL(target, request.url));
    }

    return NextResponse.next();
  }

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

function isAuthPath(pathname: string): boolean {
  return (
    pathname === "/login" || pathname === "/register" || pathname === "/signup"
  );
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

    const isDeleted = Boolean(
      (session?.user as { deletedAt?: unknown } | undefined)?.deletedAt,
    );

    return Boolean(session?.session && session.user && !isDeleted);
  } catch (err) {
    console.error(
      "[AUTH_SESSION_ERROR]",
      err instanceof Error ? err.message : err,
    );

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
 * language-neutral. Localized marketing URLs now map directly to `[locale]` routes.
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

    // Sync cookie if different, but let Next.js serve the static [locale] route directly
    if (request.cookies.get(localeCookieName)?.value !== firstSegment) {
      const response = NextResponse.next();

      response.cookies.set(localeCookieName, firstSegment, {
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });

      return response;
    }

    return undefined;
  }

  if (!marketingPaths.has(pathname)) return undefined;

  const selectedLocale =
    request.cookies.get(localeCookieName)?.value ??
    resolveAcceptLanguage(request.headers.get("accept-language"));
  const redirectUrl = request.nextUrl.clone();

  redirectUrl.pathname = `/${selectedLocale}${pathname === "/" ? "" : pathname}`;

  return NextResponse.redirect(redirectUrl);
}
