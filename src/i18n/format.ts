import type { AppLocale } from "./locales";

/** Locale-aware presentation helpers for server and client UI. */
export function formatDate(
  value: Date | number | string,
  locale: AppLocale,
  options: Intl.DateTimeFormatOptions = { dateStyle: "long" },
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(value));
}

export function formatNumber(
  value: number,
  locale: AppLocale,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatCurrency(
  value: number,
  currency: string,
  locale: AppLocale,
): string {
  return formatNumber(value, locale, { style: "currency", currency });
}
