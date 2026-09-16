export const locales = ["en", "vi", "es", "fr", "de", "it", "pt-BR"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";
export const localeCookieName = "NEXT_LOCALE";

export const localeLabels: Record<AppLocale, string> = {
  en: "English",
  vi: "Tiếng Việt",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  "pt-BR": "Português",
};

const localeAliases: Record<string, AppLocale> = {
  en: "en",
  "en-us": "en",
  "en-gb": "en",
  vi: "vi",
  "vi-vn": "vi",
  es: "es",
  "es-es": "es",
  "es-mx": "es",
  fr: "fr",
  "fr-fr": "fr",
  "fr-ca": "fr",
  de: "de",
  "de-de": "de",
  it: "it",
  "it-it": "it",
  pt: "pt-BR",
  "pt-br": "pt-BR",
  "pt-pt": "pt-BR",
};

export function isAppLocale(
  value: string | null | undefined,
): value is AppLocale {
  return Boolean(value && locales.includes(value as AppLocale));
}

/** Maps browser tags (e.g. `vi-VN`) to one supported product locale. */
export function normalizeLocale(
  value: string | null | undefined,
): AppLocale | undefined {
  if (!value) return undefined;

  return localeAliases[value.trim().replaceAll("_", "-").toLowerCase()];
}

export function resolveAcceptLanguage(
  acceptLanguage: string | null | undefined,
): AppLocale {
  return resolveSupportedAcceptLanguage(acceptLanguage) ?? defaultLocale;
}

/** Returns undefined for an unsupported browser preference. */
export function resolveSupportedAcceptLanguage(
  acceptLanguage: string | null | undefined,
): AppLocale | undefined {
  if (!acceptLanguage) return undefined;

  const candidates = acceptLanguage
    .split(",")
    .map((entry, index) => {
      const [tag, ...parameters] = entry.trim().split(";");
      const quality = parameters.find((parameter) =>
        parameter.trim().startsWith("q="),
      );

      return {
        tag,
        index,
        quality: quality ? Number(quality.trim().slice(2)) : 1,
      };
    })
    .filter(
      ({ tag, quality }) => tag && Number.isFinite(quality) && quality > 0,
    )
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  for (const { tag } of candidates) {
    const normalized = normalizeLocale(tag);

    if (normalized) return normalized;
  }

  return undefined;
}

export function resolveLocale(input: {
  explicitLocale?: string | null;
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
  eventDefaultLocale?: string | null;
}): AppLocale {
  return (
    normalizeLocale(input.explicitLocale) ??
    normalizeLocale(input.cookieLocale) ??
    resolveSupportedAcceptLanguage(input.acceptLanguage) ??
    normalizeLocale(input.eventDefaultLocale) ??
    defaultLocale
  );
}
