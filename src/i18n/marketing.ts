import type { AppLocale } from "./locales";

/** Produces SEO-friendly marketing URLs without changing host or guest URLs. */
export function marketingHref(locale: AppLocale, path = "/"): string {
  const normalizedPath = path === "/" ? "" : path;

  return `/${locale}${normalizedPath}`;
}
