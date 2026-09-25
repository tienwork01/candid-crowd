import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { isAppLocale, locales } from "@/i18n/locales";
import { siteConfig } from "@/lib/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * Only the seven supported locales are valid first segments. Without this, a
 * one-segment URL like `/whatever` still matched `/[locale]` and had to render
 * this statically prerendered route on demand just to throw `notFound()`, which
 * Next rejects as "changed from static to dynamic at runtime". Unknown segments
 * now fall through to the global 404 instead.
 */
export const dynamicParams = false;

const openGraphLocaleMap: Record<string, string> = {
  en: "en_US",
  vi: "vi_VN",
  es: "es_ES",
  fr: "fr_FR",
  de: "de_DE",
  it: "it_IT",
  "pt-BR": "pt_BR",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!isAppLocale(locale)) {
    return {};
  }

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "metadata" });
  const baseUrl = siteConfig.marketingUrl.replace(/\/$/, "");
  const canonical = `${baseUrl}/${locale}`;

  const currentOgLocale = openGraphLocaleMap[locale] || "en_US";
  const alternateOgLocales = Object.values(openGraphLocaleMap).filter(
    (l) => l !== currentOgLocale,
  );

  return {
    metadataBase: new URL(baseUrl),
    title: t("homeTitle"),
    description: t("homeDescription"),
    applicationName: "CandidCrowd",
    authors: [{ name: "CandidCrowd Team", url: baseUrl }],
    creator: "CandidCrowd",
    publisher: "CandidCrowd",
    keywords: [
      "event photo sharing",
      "wedding photo qr code",
      "guest photo upload",
      "chia sẻ ảnh sự kiện",
      "mã qr ảnh cưới",
      "qr code photo sharing",
      "live event wall",
      "wedding guest gallery",
      "shared memory album",
    ],
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical,
      languages: {
        en: `${baseUrl}/en`,
        vi: `${baseUrl}/vi`,
        es: `${baseUrl}/es`,
        fr: `${baseUrl}/fr`,
        de: `${baseUrl}/de`,
        it: `${baseUrl}/it`,
        "pt-BR": `${baseUrl}/pt-BR`,
        "x-default": `${baseUrl}/en`,
      },
    },
    openGraph: {
      type: "website",
      locale: currentOgLocale,
      alternateLocale: alternateOgLocales,
      url: canonical,
      siteName: "CandidCrowd",
      title: t("homeTitle"),
      description: t("homeDescription"),
      images: [
        {
          url: `${baseUrl}/images/wedding-sunset.webp`,
          width: 1200,
          height: 630,
          alt: "CandidCrowd — Shared memories for every event",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("homeTitle"),
      description: t("homeDescription"),
      creator: "@candidcrowd",
      images: [`${baseUrl}/images/wedding-sunset.webp`],
    },
    other: {
      "geo.region": "VN-HN",
      "geo.placename": "Hanoi, Vietnam",
      "geo.position": "21.0285;105.8542",
      ICBM: "21.0285, 105.8542",
    },
  };
}

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isAppLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const [messages, tCommon] = await Promise.all([
    getMessages(),
    getTranslations({ locale, namespace: "common" }),
  ]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <a className="skip-link" href="#main">
        {tCommon("skipToContent")}
      </a>
      {children}
    </NextIntlClientProvider>
  );
}
