import type { Metadata } from "next";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { Header } from "@/features/marketing/components";
import { NotFoundView } from "@/features/not-found/components";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("notFound");

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
  const [locale, messages, tCommon] = await Promise.all([
    getLocale(),
    getMessages(),
    getTranslations("common"),
  ]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <a className="skip-link" href="#main">
        {tCommon("skipToContent")}
      </a>
      <div className="not-found-page">
        <Header />
        <NotFoundView />
      </div>
    </NextIntlClientProvider>
  );
}
