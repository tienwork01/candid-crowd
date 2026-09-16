import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Brand } from "@/components/shared";
import { marketingHref } from "@/i18n/marketing";
import type { AppLocale } from "@/i18n/locales";

export async function Footer() {
  const [locale, tFooter, tNav, tEvents] = await Promise.all([
    getLocale(),
    getTranslations("marketing.footer"),
    getTranslations("marketing.navigation"),
    getTranslations("marketing.eventTypesSection.items"),
  ]);

  const prefix = marketingHref(locale as AppLocale);

  const navigation = [
    { label: tNav("howItWorks"), href: `${prefix}/#how-it-works` },
    { label: tNav("demo"), href: `${prefix}/#demo` },
    { label: tNav("pricing"), href: `${prefix}/#pricing` },
  ];

  const eventLinks = [
    { label: tEvents("weddings.label"), href: `${prefix}/#weddings` },
    { label: tEvents("birthdays.label"), href: `${prefix}/#birthdays` },
    { label: tEvents("graduations.label"), href: `${prefix}/#graduations` },
    {
      label: tEvents("company-events.label"),
      href: `${prefix}/#company-events`,
    },
  ];

  return (
    <footer className="site-footer container">
      <div className="site-footer__brand">
        <Brand />
        <p>{tFooter("brandTagline")}</p>
        <span>{tFooter("brandSub")}</span>
      </div>
      <nav aria-label={tNav("main")}>
        <h2>{tFooter("productTitle")}</h2>
        {navigation.map((item) => (
          <Link className="site-footer__link" key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <nav aria-label={tFooter("eventsTitle")}>
        <h2>{tFooter("eventsTitle")}</h2>
        {eventLinks.map((item) => (
          <Link className="site-footer__link" href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <nav aria-label={tFooter("essentialsTitle")}>
        <h2>{tFooter("essentialsTitle")}</h2>
        <Link className="site-footer__link" href={`${prefix}/privacy`}>
          {tFooter("privacyPolicy")}
        </Link>
        <Link className="site-footer__link" href={`${prefix}/terms`}>
          {tFooter("termsOfService")}
        </Link>
        <span className="site-footer__preview-label">
          {tFooter("previewLabel")}
        </span>
      </nav>
      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} CandidCrowd</span>
        <span>{tFooter("bottomNote")}</span>
      </div>
    </footer>
  );
}
