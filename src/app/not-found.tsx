import type { Metadata } from "next";
import { getMessages, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { Header } from "@/features/marketing/components";
import { NotFoundView } from "@/features/not-found/components";
import { defaultLocale } from "@/i18n/locales";

/**
 * Next renders the root not-found boundary as part of every route that sits
 * under the root layout, so anything ambient in here leaks into those routes.
 * Resolving the locale from headers/cookies made `headers()` run during the
 * prerender of `/[locale]`, which silently demoted the marketing home page to
 * dynamic rendering. This page is the 404 for URLs that carry no locale at all,
 * so it renders in the default locale and stays fully static; localized 404s
 * are still handled by `[locale]/not-found.tsx`.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({
    locale: defaultLocale,
    namespace: "notFound",
  });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function RootNotFound() {
  const [messages, tCommon] = await Promise.all([
    getMessages({ locale: defaultLocale }),
    getTranslations({ locale: defaultLocale, namespace: "common" }),
  ]);

  return (
    <NextIntlClientProvider locale={defaultLocale} messages={messages}>
      <a className="skip-link" href="#main">
        {tCommon("skipToContent")}
      </a>
      <div className="not-found-page">
        <Header locale={defaultLocale} />
        <NotFoundView locale={defaultLocale} />
      </div>
    </NextIntlClientProvider>
  );
}
