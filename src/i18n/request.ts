import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import {
  defaultLocale,
  localeCookieName,
  normalizeLocale,
  resolveAcceptLanguage,
} from "./locales";

const messageLoaders = {
  en: () => import("../../messages/en.json"),
  vi: () => import("../../messages/vi.json"),
  es: () => import("../../messages/es.json"),
  fr: () => import("../../messages/fr.json"),
  de: () => import("../../messages/de.json"),
  it: () => import("../../messages/it.json"),
  "pt-BR": () => import("../../messages/pt-BR.json"),
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = normalizeLocale(await requestLocale);

  if (requested) {
    const messages = (await messageLoaders[requested]()).default;

    return { locale: requested, messages, defaultLocale };
  }

  const requestHeaders = await headers();
  const requestCookies = await cookies();
  const locale =
    normalizeLocale(requestHeaders.get("x-candidcrowd-locale")) ??
    normalizeLocale(requestCookies.get(localeCookieName)?.value) ??
    resolveAcceptLanguage(requestHeaders.get("accept-language")) ??
    defaultLocale;
  const messages = (await messageLoaders[locale]()).default;

  return { locale, messages, defaultLocale };
});
