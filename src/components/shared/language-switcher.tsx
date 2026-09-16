"use client";

import { Globe } from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { localeLabels, locales, type AppLocale } from "@/i18n/locales";

function localePath(locale: AppLocale, pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length > 0 && locales.includes(segments[0] as AppLocale)) {
    segments.shift();
  }

  const marketingPath = `/${segments.join("/")}`.replace(/\/$/, "") || "/";

  return `/${locale}${marketingPath === "/" ? "" : marketingPath}`;
}

/** Accessible native select: keyboard-friendly and compact on mobile. */
export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("marketing.languageSwitcher");

  return (
    <label className="language-switcher">
      <Globe size={17} aria-hidden="true" />
      <span className="sr-only">{t("label")}</span>
      <select
        aria-label={t("label")}
        value={locale}
        onChange={(event) => {
          const nextLocale = event.target.value as AppLocale;

          document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000;samesite=lax`;

          // Marketing has canonical locale URLs. Product/guest routes remain neutral.
          const path = window.location.pathname;
          const isMarketing =
            path === "/" ||
            path === "/privacy" ||
            path === "/terms" ||
            locales.some((supported) =>
              ["", "/privacy", "/terms"].includes(
                path.slice(supported.length + 1) || "",
              ),
            );

          window.location.assign(
            isMarketing
              ? localePath(nextLocale, path)
              : `${path}${window.location.search}`,
          );
        }}
      >
        {locales.map((supportedLocale) => (
          <option key={supportedLocale} value={supportedLocale}>
            {localeLabels[supportedLocale]}
          </option>
        ))}
      </select>
    </label>
  );
}
