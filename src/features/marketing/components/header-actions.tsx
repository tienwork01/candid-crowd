"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/shared";

export function HeaderActions() {
  const t = useTranslations("marketing.header");

  return (
    <div className="site-header__actions">
      <LanguageSwitcher />
      <Link href="/login" className="site-header__login">
        {t("login")}
      </Link>
    </div>
  );
}
