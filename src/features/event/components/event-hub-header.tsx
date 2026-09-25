"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDots,
  DotsThree,
  Eye,
  Gear,
  PaintBrush,
  Presentation,
  Printer,
  QrCode,
  ShareNetwork,
  Sparkle,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import type { CandidEvent, EventLifecycleStatus } from "../types/event";
import { getEventLifecycleStatus } from "../types/event";
import { formatDate } from "@/i18n/format";
import type { AppLocale } from "@/i18n/locales";
import {
  Button,
  buttonVariants,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";

type EventHubHeaderProps = {
  event: CandidEvent;
  onOpenShare: () => void;
  onOpenEdit: () => void;
  onLaunchLiveWall: () => void;
  onOpenPrint?: () => void;
  onOpenCustomizeTheme?: () => void;
  onOpenCustomizeQr?: () => void;
};

const lifecycleColors: Record<EventLifecycleStatus, string> = {
  upcoming: "event-hub__lifecycle-badge--upcoming",
  live: "event-hub__lifecycle-badge--live",
  ended: "event-hub__lifecycle-badge--ended",
};

export function EventHubHeader({
  event,
  onOpenShare,
  onOpenEdit,
  onLaunchLiveWall,
  onOpenPrint,
  onOpenCustomizeTheme,
  onOpenCustomizeQr,
}: EventHubHeaderProps) {
  const t = useTranslations("event");
  const locale = useLocale() as AppLocale;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicPath = event.public_url || `/e/${event.slug}`;
  const fullGuestUrl = event.guest_url || `${origin}${publicPath}`;

  const status = getEventLifecycleStatus(event);

  const formattedDate = event.event_date
    ? formatDate(event.event_date, locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : t("ready.noDate");

  const lifecycleLabel = t(
    `overview.lifecycle${status.charAt(0).toUpperCase()}${status.slice(1)}` as
      | "overview.lifecycleUpcoming"
      | "overview.lifecycleLive"
      | "overview.lifecycleEnded",
  );

  return (
    <header className="event-hub__header">
      <div className="event-hub__headline">
        {/* Context Bar: Back + Metadata */}
        <div className="event-hub__context-bar">
          <nav aria-label={t("overview.breadcrumb")}>
            <Link href="/events" className="event-hub__breadcrumb">
              <ArrowLeft size={13} aria-hidden="true" />
              <span>{t("overview.breadcrumb")}</span>
            </Link>
          </nav>

          <span className="event-hub__badge-sep" aria-hidden="true">
            •
          </span>

          <div className="event-hub__meta-row">
            <span className="event-hub__type-badge">
              <Sparkle size={12} weight="fill" className="text-primary" />
              <span>{t(`types.${event.event_type}`)}</span>
            </span>

            <span className="event-hub__date">
              <CalendarDots size={14} aria-hidden="true" />
              <span>{formattedDate}</span>
            </span>

            <span
              className={`event-hub__lifecycle-badge ${lifecycleColors[status]}`}
            >
              {status === "live" && (
                <span className="event-hub__lifecycle-dot" aria-hidden="true" />
              )}
              <span>{lifecycleLabel}</span>
            </span>
          </div>
        </div>

        {/* Compact Title */}
        <h1 className="event-hub__title">{event.name}</h1>
      </div>

      {/* Header Actions — Compact */}
      <div className="event-hub__actions">
        {/* Share (opens share popover) */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenShare}
          className="text-xs h-9"
          title={t("hub.shareBtn")}
        >
          <ShareNetwork size={15} aria-hidden="true" />
          <span>{t("hub.shareBtn")}</span>
        </Button>

        {/* Live Wall */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onLaunchLiveWall}
          className="text-xs h-9 inline-flex items-center gap-1.5"
          title={t("hub.liveWallBtn")}
        >
          <Presentation size={16} aria-hidden="true" />
          <span className="hidden sm:inline">{t("hub.liveWallBtn")}</span>
        </Button>

        {/* View as Guest */}
        <a
          href={fullGuestUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "outline", size: "sm" })}
          title={t("ready.previewAsGuest")}
        >
          <Eye size={15} weight="bold" aria-hidden="true" />
          <span className="hidden sm:inline">{t("ready.previewAsGuest")}</span>
        </a>

        {/* More Menu — Host Quick Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer"
            aria-label={t("hub.moreBtn")}
            title={t("hub.moreBtn")}
          >
            <DotsThree size={20} weight="bold" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={6}
            className="min-w-[210px] sm:min-w-[220px] w-auto p-1.5 shadow-xl"
          >
            {/* Quick Action 1: Edit Event */}
            <DropdownMenuItem
              onClick={onOpenEdit}
              className="gap-2.5 px-3 py-2 cursor-pointer"
            >
              <Gear
                size={16}
                aria-hidden="true"
                className="shrink-0 text-muted-foreground group-hover/dropdown-menu-item:text-foreground transition-colors"
              />
              <span className="font-medium text-foreground">
                {t("hub.editEventBtn")}
              </span>
            </DropdownMenuItem>

            {/* Quick Action 2: Customize QR Card */}
            {onOpenCustomizeQr && (
              <DropdownMenuItem
                onClick={onOpenCustomizeQr}
                className="gap-2.5 px-3 py-2 cursor-pointer"
              >
                <QrCode
                  size={16}
                  aria-hidden="true"
                  className="shrink-0 text-muted-foreground group-hover/dropdown-menu-item:text-foreground transition-colors"
                />
                <span className="font-medium text-foreground">
                  {t("checklist.itemCustomizeQr")}
                </span>
              </DropdownMenuItem>
            )}

            {/* Quick Action 3: Customize Guest Page */}
            {onOpenCustomizeTheme && (
              <DropdownMenuItem
                onClick={onOpenCustomizeTheme}
                className="gap-2.5 px-3 py-2 cursor-pointer"
              >
                <PaintBrush
                  size={16}
                  aria-hidden="true"
                  className="shrink-0 text-muted-foreground group-hover/dropdown-menu-item:text-foreground transition-colors"
                />
                <span className="font-medium text-foreground">
                  {t("settings.customizeGuestPageBtn")}
                </span>
              </DropdownMenuItem>
            )}

            {/* Quick Action 4: Print QR Signs */}
            {onOpenPrint && (
              <DropdownMenuItem
                onClick={onOpenPrint}
                className="gap-2.5 px-3 py-2 cursor-pointer"
              >
                <Printer
                  size={16}
                  aria-hidden="true"
                  className="shrink-0 text-muted-foreground group-hover/dropdown-menu-item:text-foreground transition-colors"
                />
                <span className="font-medium text-foreground">
                  {t("hub.printSignsBtn")}
                </span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
