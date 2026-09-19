"use client";

import { CaretDown, Check, CircleNotch, Globe } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { localeLabels, locales } from "@/i18n/locales";
import { useLocaleSwitcher } from "@/i18n/use-locale-switcher";

export function LanguageSwitcher() {
  const t = useTranslations("marketing.languageSwitcher");
  const { currentLocale, switchLocale, isPending, pendingLocale } =
    useLocaleSwitcher();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("label")}
        disabled={isPending}
        className="group inline-flex h-9.5 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer select-none disabled:opacity-70"
      >
        {isPending ? (
          <CircleNotch
            size={15}
            className="animate-spin text-primary"
            aria-hidden="true"
          />
        ) : (
          <Globe size={15} aria-hidden="true" />
        )}
        <span>{localeLabels[currentLocale]}</span>
        <CaretDown
          size={12}
          className="text-muted-foreground transition-transform duration-200 group-data-[popup-open]:rotate-180 group-hover:text-foreground"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="min-w-40 p-1">
        {locales.map((supportedLocale) => {
          const isSelected = supportedLocale === currentLocale;
          const isTargetPending =
            isPending && pendingLocale === supportedLocale;

          return (
            <DropdownMenuItem
              key={supportedLocale}
              disabled={isPending}
              onClick={() => switchLocale(supportedLocale)}
              className="flex items-center justify-between text-xs cursor-pointer"
            >
              <span className={isSelected ? "font-semibold text-primary" : ""}>
                {localeLabels[supportedLocale]}
              </span>
              {isTargetPending ? (
                <CircleNotch size={13} className="animate-spin text-primary" />
              ) : isSelected ? (
                <Check size={13} weight="bold" className="text-primary" />
              ) : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
