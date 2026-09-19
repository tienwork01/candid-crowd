import Link from "next/link";
import { Brand } from "@/components/shared";
import { getLocale, getTranslations } from "next-intl/server";
import { marketingHref } from "@/i18n/marketing";
import type { AppLocale } from "@/i18n/locales";
import { HeaderActions } from "./header-actions";
import { MobileNav } from "./mobile-nav";

export async function Header({ locale }: { locale?: AppLocale } = {}) {
  const marketingLocale = locale ?? ((await getLocale()) as AppLocale);
  const t = await getTranslations({
    locale: marketingLocale,
    namespace: "marketing",
  });
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
        <HeaderActions />
        <MobileNav navigation={navigation} />
      </div>
    </header>
  );
}
