"use client";

import { CaretDown, Check, Globe } from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { localeLabels, locales, type AppLocale } from "@/i18n/locales";

function setLocaleCookie(locale: AppLocale) {
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;samesite=lax`;
}

function localePath(locale: AppLocale, pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length > 0 && locales.includes(segments[0] as AppLocale)) {
    segments.shift();
  }

  const marketingPath = `/${segments.join("/")}`.replace(/\/$/, "") || "/";

  return `/${locale}${marketingPath === "/" ? "" : marketingPath}`;
}

export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("marketing.languageSwitcher");

  function handleSelect(nextLocale: AppLocale) {
    if (nextLocale === locale) {
      return;
    }

    setLocaleCookie(nextLocale);

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
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("label")}
        className="group inline-flex h-9.5 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer select-none"
      >
        <Globe size={15} aria-hidden="true" />
        <span>{localeLabels[locale]}</span>
        <CaretDown
          size={12}
          className="text-muted-foreground transition-transform duration-200 group-data-[popup-open]:rotate-180 group-hover:text-foreground"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="min-w-40 p-1">
        {locales.map((supportedLocale) => {
          const isSelected = supportedLocale === locale;

          return (
            <DropdownMenuItem
              key={supportedLocale}
              onClick={() => handleSelect(supportedLocale)}
              className="flex items-center justify-between text-xs cursor-pointer"
            >
              <span className={isSelected ? "font-semibold text-primary" : ""}>
                {localeLabels[supportedLocale]}
              </span>
              {isSelected && (
                <Check size={13} weight="bold" className="text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
