import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
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
  const prefix = marketingHref(marketingLocale);
  const navigation = [
    { label: t("navigation.howItWorks"), href: `${prefix}/#how-it-works` },
    { label: t("navigation.demo"), href: `${prefix}/#demo` },
    { label: t("navigation.pricing"), href: `${prefix}/#pricing` },
  ];

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Brand />
        <nav className="site-header__nav" aria-label={t("navigation.main")}>
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>
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
          <Link
            href="/register?next=/events/new"
            className="button button--small site-header__cta hidden md:inline-flex"
          >
            {t("header.createEvent")}
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <MobileNav navigation={navigation} />
      </div>
    </header>
  );
}
