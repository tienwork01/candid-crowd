"use client";

import { useCallback, useTransition, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { setUserLocale } from "./actions";
import {
  isAppLocale,
  localeCookieName,
  locales,
  type AppLocale,
} from "./locales";

export function isMarketingPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    locales.some((supported) =>
      ["", "/privacy", "/terms"].includes(
        pathname.slice(supported.length + 1) || "",
      ),
    )
  );
}

export function getLocalizedMarketingPath(
  locale: AppLocale,
  pathname: string,
): string {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length > 0 && locales.includes(segments[0] as AppLocale)) {
    segments.shift();
  }

  const marketingPath = `/${segments.join("/")}`.replace(/\/$/, "") || "/";

  return `/${locale}${marketingPath === "/" ? "" : marketingPath}`;
}

export function useLocaleSwitcher() {
  const currentLocale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [pendingLocale, setPendingLocale] = useState<AppLocale | null>(null);

  const switchLocale = useCallback(
    (nextLocale: AppLocale) => {
      if (
        !isAppLocale(nextLocale) ||
        nextLocale === currentLocale ||
        isPending
      ) {
        return;
      }

      setPendingLocale(nextLocale);

      // 1. Immediately update DOM lang attribute for accessibility and CSS
      if (typeof document !== "undefined") {
        document.documentElement.lang = nextLocale;
        document.cookie = `${localeCookieName}=${nextLocale};path=/;max-age=31536000;samesite=lax`;
      }

      startTransition(async () => {
        try {
          // 2. Persist cookie on the server via Server Action
          await setUserLocale(nextLocale);

          // 3. Client navigation without hard reloading the browser
          const currentPath =
            pathname ||
            (typeof window !== "undefined" ? window.location.pathname : "/");
          const searchAndHash =
            typeof window !== "undefined"
              ? `${window.location.search}${window.location.hash}`
              : "";

          if (isMarketingPath(currentPath)) {
            const nextPath = getLocalizedMarketingPath(nextLocale, currentPath);

            router.replace(`${nextPath}${searchAndHash}`);
            router.refresh();
          } else {
            router.refresh();
          }
        } finally {
          setPendingLocale(null);
        }
      });
    },
    [currentLocale, isPending, pathname, router],
  );

  return {
    currentLocale,
    switchLocale,
    isPending,
    pendingLocale,
  };
}
