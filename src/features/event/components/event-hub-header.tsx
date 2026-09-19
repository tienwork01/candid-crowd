"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDots,
  Check,
  Copy,
  Eye,
  Gear,
  Presentation,
  QrCode,
  Sparkle,
  Users,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import type { CandidEvent } from "../types/event";
import { formatDate } from "@/i18n/format";
import type { AppLocale } from "@/i18n/locales";
import { Button } from "@/components/ui";

type EventHubHeaderProps = {
  event: CandidEvent;
  onOpenQr: () => void;
  onOpenEdit: () => void;
  onLaunchLiveWall: () => void;
};

export function EventHubHeader({
  event,
  onOpenQr,
  onOpenEdit,
  onLaunchLiveWall,
}: EventHubHeaderProps) {
  const t = useTranslations("event");
  const locale = useLocale() as AppLocale;
  const [copiedLink, setCopiedLink] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicPath = event.public_url || `/e/${event.slug}`;
  const fullGuestUrl = event.guest_url || `${origin}${publicPath}`;
  const testGuestUrl = `${fullGuestUrl}?is_test=true`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullGuestUrl);
      setCopiedLink(true);
      toast.success(t("ready.linkCopied"));
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      toast.error(t("ready.copyLink"));
    }
  };

  const formattedDate = event.event_date
    ? formatDate(event.event_date, locale, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : t("ready.noDate");

  let daysRemaining: number | null = null;

  if (event.event_date) {
    const target = new Date(event.event_date).getTime();
    const now = new Date().getTime();

    daysRemaining = Math.max(
      0,
      Math.ceil((target - now) / (1000 * 60 * 60 * 24)),
    );
  }

  return (
    <header className="event-hub__header">
      <div className="event-hub__headline">
        {/* Top Breadcrumb */}
        <nav aria-label={t("overview.breadcrumb")} className="mb-3">
          <Link
            href="/events"
            className="text-xs text-muted-foreground hover:text-ink inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft size={13} aria-hidden="true" />
            <span>{t("overview.breadcrumb")}</span>
          </Link>
        </nav>

        {/* Metadata Badges */}
        <div className="event-hub__meta-row">
          <span className="event-hub__type-badge">
            <Sparkle size={12} weight="fill" className="text-primary" />
            <span>{t(`types.${event.event_type}`)}</span>
          </span>

          <span className="event-hub__date">
            <CalendarDots size={14} aria-hidden="true" />
            <span>{formattedDate}</span>
          </span>

          {daysRemaining !== null && (
            <span className="event-hub__days-badge">
              {t("overview.daysUntil", { count: daysRemaining })}
            </span>
          )}

          {Boolean(event.expected_guest_count) && (
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1 font-medium">
              <Users size={14} aria-hidden="true" />
              <span>
                {event.expected_guest_count}{" "}
                {t("checklist.itemGuestCount").toLowerCase()}
              </span>
            </span>
          )}
        </div>

        {/* Big Editorial Title */}
        <h1 className="event-hub__title">{event.name}</h1>
      </div>

      {/* Header Quick Actions */}
      <div className="event-hub__actions">
        {/* Copy Guest Link */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="text-xs h-9"
          title={t("ready.copyLink")}
        >
          {copiedLink ? (
            <Check size={14} className="text-primary" aria-hidden="true" />
          ) : (
            <Copy size={14} aria-hidden="true" />
          )}
          <span>
            {copiedLink ? t("ready.linkCopied") : t("ready.copyLink")}
          </span>
        </Button>

        {/* View / Download QR */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenQr}
          className="text-xs h-9"
          title={t("ready.downloadQr")}
        >
          <QrCode size={16} aria-hidden="true" />
          <span>{t("hub.qrCodeBtn")}</span>
        </Button>

        {/* Live Wall Presenter */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onLaunchLiveWall}
          className="text-xs h-9 inline-flex items-center gap-1.5"
          title={t("hub.liveWallBtn")}
        >
          <Presentation size={16} aria-hidden="true" />
          <span>{t("hub.liveWallBtn")}</span>
        </Button>

        {/* Preview as Guest */}
        <a
          href={testGuestUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="button button--secondary text-xs h-9 inline-flex items-center gap-1.5 px-3 rounded-md cursor-pointer"
          title={t("ready.previewAsGuest")}
        >
          <Eye size={15} weight="bold" aria-hidden="true" />
          <span>{t("ready.previewAsGuest")}</span>
        </a>

        {/* Edit Event Settings */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onOpenEdit}
          className="h-9 w-9 text-muted-foreground hover:text-ink"
          aria-label={t("hub.editEventBtn")}
          title={t("hub.editEventBtn")}
        >
          <Gear size={17} aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}
