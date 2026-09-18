import Link from "next/link";
import { Brand } from "@/components/shared";
import { LanguageSwitcher } from "@/components/shared";
import { getLocale, getTranslations } from "next-intl/server";
import { marketingHref } from "@/i18n/marketing";
import type { AppLocale } from "@/i18n/locales";
import { MobileNav } from "./mobile-nav";

export async function Header() {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("marketing"),
  ]);
  const marketingLocale = locale as AppLocale;
  const navigation = [
    { label: t("navigation.howItWorks"), href: "#how-it-works" },
    { label: t("navigation.demo"), href: "#demo" },
    { label: t("navigation.pricing"), href: "#pricing" },
  ];

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Brand />
        <nav className="site-header__nav" aria-label={t("navigation.main")}>
          {navigation.map((item) => (
            <Link
              href={`${marketingHref(marketingLocale)}${item.href}`}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="site-header__actions">
          <LanguageSwitcher />
          <Link
            href="/login"
            className="site-header__login inline-flex h-8.5 items-center justify-center rounded-full border border-border bg-card px-4 text-xs font-semibold text-foreground transition-colors hover:bg-secondary hover:border-foreground/40 focus-visible:outline-2 focus-visible:outline-primary"
          >
            {t("header.login")}
          </Link>
        </div>
        <MobileNav navigation={navigation} />
      </div>
    </header>
  );
}
