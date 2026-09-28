import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header, Footer } from "@/features/marketing/components";
import {
  TableOfContents,
  BackToTop,
  TermsBodyEn,
  TermsBodyVi,
  type TocItem,
} from "@/features/legal/components";
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

  const t = await getTranslations({ locale, namespace: "legal.terms" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (isAppLocale(locale)) {
    setRequestLocale(locale);
  }

  const t = await getTranslations({ locale, namespace: "legal.terms" });
  const tToc = await getTranslations({ locale, namespace: "legal.toc" });

  const termsToc: TocItem[] = [
    { id: "about", number: "1", title: t("sections.about") },
    { id: "eligibility", number: "2", title: t("sections.eligibility") },
    { id: "accounts", number: "3", title: t("sections.accounts") },
    {
      id: "events-and-guests",
      number: "4",
      title: t("sections.eventsAndGuests"),
    },
    { id: "user-content", number: "5", title: t("sections.userContent") },
    { id: "responsibility", number: "6", title: t("sections.responsibility") },
    {
      id: "host-responsibilities",
      number: "7",
      title: t("sections.hostResponsibilities"),
    },
    { id: "moderation", number: "8", title: t("sections.moderation") },
    { id: "storage", number: "9", title: t("sections.storage") },
    { id: "availability", number: "10", title: t("sections.availability") },
    { id: "payments", number: "11", title: t("sections.payments") },
    { id: "refund-policy", number: "12", title: t("sections.refundPolicy") },
    { id: "free-services", number: "13", title: t("sections.freeServices") },
    {
      id: "service-changes",
      number: "14",
      title: t("sections.serviceChanges"),
    },
    {
      id: "intellectual-property",
      number: "15",
      title: t("sections.intellectualProperty"),
    },
    { id: "prohibited-use", number: "16", title: t("sections.prohibitedUse") },
    { id: "third-party", number: "17", title: t("sections.thirdParty") },
    { id: "suspension", number: "18", title: t("sections.suspension") },
    { id: "deletion", number: "19", title: t("sections.deletion") },
    { id: "disclaimer", number: "20", title: t("sections.disclaimer") },
    { id: "liability", number: "21", title: t("sections.liability") },
    { id: "indemnity", number: "22", title: t("sections.indemnity") },
    { id: "governing-law", number: "23", title: t("sections.governingLaw") },
    { id: "changes", number: "24", title: t("sections.changes") },
    { id: "contact", number: "25", title: t("sections.contact") },
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
            <span>{t("effective")}</span>
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
            <TableOfContents items={termsToc} title={t("tocTitle")} />
          </aside>

          {/* Main Document Content */}
          <main className="legal-page__content" id="terms-content">
            {/* Quick Summary Card */}
            <div className="legal-callout">
              <div className="legal-callout__header">
                <ShieldCheck
                  className="legal-callout__icon"
                  aria-hidden="true"
                />
                <h2 className="legal-callout__title">{t("calloutTitle")}</h2>
              </div>
              <div className="legal-callout__body">
                <p>{t("calloutLead")}</p>
              </div>
              <div className="legal-callout__grid">
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">
                    {t("calloutItems.ownershipLabel")}
                  </span>
                  <span className="legal-callout__item-value">
                    {t("calloutItems.ownershipValue")}
                  </span>
                </div>
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">
                    {t("calloutItems.guestFrictionLabel")}
                  </span>
                  <span className="legal-callout__item-value">
                    {t("calloutItems.guestFrictionValue")}
                  </span>
                </div>
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">
                    {t("calloutItems.freeStorageLabel")}
                  </span>
                  <span className="legal-callout__item-value">
                    {t("calloutItems.freeStorageValue")}
                  </span>
                </div>
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">
                    {t("calloutItems.paidStorageLabel")}
                  </span>
                  <span className="legal-callout__item-value">
                    {t("calloutItems.paidStorageValue")}
                  </span>
                </div>
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">
                    {t("calloutItems.refundPolicyLabel")}
                  </span>
                  <span className="legal-callout__item-value">
                    {t("calloutItems.refundPolicyValue")}
                  </span>
                </div>
                <div className="legal-callout__item">
                  <span className="legal-callout__item-label">
                    {t("calloutItems.governingLawLabel")}
                  </span>
                  <span className="legal-callout__item-value">
                    {t("calloutItems.governingLawValue")}
                  </span>
                </div>
              </div>
            </div>

            {/* Bilingual Body Rendering: Vietnamese for 'vi', English fallback for all other locales */}
            {locale === "vi" ? <TermsBodyVi t={t} /> : <TermsBodyEn t={t} />}

            {/* Footer Navigation within Document */}
            <div className="legal-page__footer-nav">
              <div
                style={{ display: "flex", gap: "16px", alignItems: "center" }}
              >
                <Link
                  href={
                    isAppLocale(locale)
                      ? marketingHref(locale as AppLocale, "/privacy")
                      : "/privacy"
                  }
                  className="legal-section__link"
                >
                  {t("viewPrivacy")}
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
