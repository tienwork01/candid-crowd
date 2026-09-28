import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "@phosphor-icons/react/dist/ssr";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header, Footer } from "@/features/marketing/components";
import {
  TableOfContents,
  BackToTop,
  PrivacyBodyEn,
  PrivacyBodyVi,
  type TocItem,
} from "@/features/legal/components";
import { siteConfig } from "@/lib/config";
import { isAppLocale, type AppLocale } from "@/i18n/locales";
import { marketingHref } from "@/i18n/marketing";
import "@/features/legal/components/legal.css";

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

  const t = await getTranslations({ locale, namespace: "legal.privacy" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (isAppLocale(locale)) {
    setRequestLocale(locale);
  }

  const t = await getTranslations({ locale, namespace: "legal.privacy" });
  const tToc = await getTranslations({ locale, namespace: "legal.toc" });

  const privacyToc: TocItem[] = [
    { id: "who-we-are", number: "1", title: t("sections.whoWeAre") },
    {
      id: "information-collected",
      number: "2",
      title: t("sections.informationCollected"),
    },
    { id: "how-we-use", number: "3", title: t("sections.howWeUse") },
    { id: "legal-bases", number: "4", title: t("sections.legalBases") },
    { id: "other-people", number: "5", title: t("sections.otherPeople") },
    {
      id: "facial-recognition",
      number: "6",
      title: t("sections.facialRecognition"),
    },
    { id: "how-we-share", number: "7", title: t("sections.howWeShare") },
    {
      id: "hosts-and-guests",
      number: "8",
      title: t("sections.hostsAndGuests"),
    },
    { id: "international", number: "9", title: t("sections.international") },
    { id: "retention", number: "10", title: t("sections.retention") },
    { id: "security", number: "11", title: t("sections.security") },
    { id: "cookies", number: "12", title: t("sections.cookies") },
    { id: "analytics", number: "13", title: t("sections.analytics") },
    { id: "ai-processing", number: "14", title: t("sections.aiProcessing") },
    { id: "privacy-rights", number: "15", title: t("sections.privacyRights") },
    { id: "removing-media", number: "16", title: t("sections.removingMedia") },
    {
      id: "california-rights",
      number: "17",
      title: t("sections.californiaRights"),
    },
    { id: "children", number: "18", title: t("sections.children") },
    { id: "deletion", number: "19", title: t("sections.deletion") },
    { id: "breaches", number: "20", title: t("sections.breaches") },
    {
      id: "third-party-links",
      number: "21",
      title: t("sections.thirdPartyLinks"),
    },
    { id: "changes", number: "22", title: t("sections.changes") },
    { id: "complaints", number: "23", title: t("sections.complaints") },
    { id: "contact", number: "24", title: t("sections.contact") },
  ];

  return (
    <div className="legal-page">
      <Header />

      <header className="legal-page__hero">
        <div className="legal-page__container legal-page__hero-inner">
          <div className="legal-page__badge">
            <span className="legal-page__badge-dot" aria-hidden="true" />
            <span>{t("heroBadge")}</span>
          </div>
          <h1 className="legal-page__title">{t("heroTitle")}</h1>
          <div className="legal-page__meta">
            <span>{t("lastUpdated")}</span>
            <span className="legal-page__meta-divider" aria-hidden="true" />
            <span>{t("location")}</span>
            <span className="legal-page__meta-divider" aria-hidden="true" />
            <span>{t("compliance")}</span>
          </div>
          <p className="legal-page__lead">{t("heroLead")}</p>
        </div>
      </header>

      <div className="legal-page__container">
        <div className="legal-page__layout">
          {/* Desktop Sticky Sidebar */}
          <aside
            className="legal-page__sidebar"
            aria-label={tToc("sidebarAria")}
          >
            <TableOfContents items={privacyToc} title={t("tocTitle")} />
          </aside>

          {/* Main Document Content */}
          <main className="legal-page__content" id="privacy-content">
            {/* Quick Summary Card */}
            <div className="legal-callout">
              <div className="legal-callout__header">
                <Lock className="legal-callout__icon" aria-hidden="true" />
                <h2 className="legal-callout__title">{t("calloutTitle")}</h2>
              </div>
              <div className="legal-callout__body">
                <p>{t("calloutLead")}</p>
              </div>
              <div className="legal-callout__grid">
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">
                    {t("calloutItems.biometricsLabel")}
                  </span>
                  <span className="legal-callout__item-value">
                    {t("calloutItems.biometricsValue")}
                  </span>
                </div>
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">
                    {t("calloutItems.guestPrivacyLabel")}
                  </span>
                  <span className="legal-callout__item-value">
                    {t("calloutItems.guestPrivacyValue")}
                  </span>
                </div>
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">
                    {t("calloutItems.storageSecurityLabel")}
                  </span>
                  <span className="legal-callout__item-value">
                    {t("calloutItems.storageSecurityValue")}
                  </span>
                </div>
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">
                    {t("calloutItems.aiTrainingLabel")}
                  </span>
                  <span className="legal-callout__item-value">
                    {t("calloutItems.aiTrainingValue")}
                  </span>
                </div>
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">
                    {t("calloutItems.dataSalesLabel")}
                  </span>
                  <span className="legal-callout__item-value">
                    {t("calloutItems.dataSalesValue")}
                  </span>
                </div>
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">
                    {t("calloutItems.privacyContactLabel")}
                  </span>
                  <span className="legal-callout__item-value">
                    {siteConfig.privacyEmail}
                  </span>
                </div>
              </div>
            </div>

            {/* Bilingual Body Rendering: Vietnamese for 'vi', English fallback for all other locales */}
            {locale === "vi" ? (
              <PrivacyBodyVi t={t} />
            ) : (
              <PrivacyBodyEn t={t} />
            )}

            {/* Footer Navigation within Document */}
            <div className="legal-page__footer-nav">
              <div
                style={{ display: "flex", gap: "16px", alignItems: "center" }}
              >
                <Link
                  href={
                    isAppLocale(locale)
                      ? marketingHref(locale as AppLocale, "/terms")
                      : "/terms"
                  }
                  className="legal-section__link"
                >
                  {t("viewTerms")}
                </Link>
              </div>
              <BackToTop />
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
