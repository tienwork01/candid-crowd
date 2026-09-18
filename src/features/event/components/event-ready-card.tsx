"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowSquareOut,
  Check,
  Copy,
  DownloadSimple,
  Eye,
  QrCode,
  Sparkle,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import type { CandidEvent } from "../types/event";
import { formatDate } from "@/i18n/format";
import type { AppLocale } from "@/i18n/locales";
import { Button } from "@/components/ui";

type EventReadyCardProps = {
  event: CandidEvent;
  onPreviewOpened?: () => void;
};

export function EventReadyCard({
  event,
  onPreviewOpened,
}: EventReadyCardProps) {
  const t = useTranslations("event");
  const locale = useLocale() as AppLocale;

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Compute guest URLs
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicPath = event.public_url || `/e/${event.slug}`;
  const fullGuestUrl = event.guest_url || `${origin}${publicPath}`;
  const testGuestUrl = `${fullGuestUrl}?is_test=true`;

  // Display-friendly short URL
  const displayUrl = fullGuestUrl.replace(/^https?:\/\//, "");

  useEffect(() => {
    let active = true;

    void import("qrcode")
      .then((qr) =>
        qr.toDataURL(fullGuestUrl, {
          width: 512,
          margin: 1.5,
          color: {
            dark: "#181e17",
            light: "#ffffff",
          },
          errorCorrectionLevel: "H",
        }),
      )
      .then((dataUrl) => {
        if (active) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        // Handled via fallback icon
      });

    return () => {
      active = false;
    };
  }, [fullGuestUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullGuestUrl);
      setCopied(true);
      toast.success(t("ready.linkCopied"));
      setTimeout(() => setCopied(false), 2400);
    } catch {
      toast.error(t("ready.copyLink"));
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    const safeName = event.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    link.download = `${safeName || "candidcrowd"}-qr.png`;
    link.href = qrDataUrl;
    link.click();
    toast.success(t("ready.downloadQr"));
  };

  const handlePreview = () => {
    onPreviewOpened?.();
    window.open(testGuestUrl, "_blank", "noopener,noreferrer");
  };

  const formattedDate = event.event_date
    ? formatDate(event.event_date, locale, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : t("ready.noDate");

  return (
    <section className="event-ready-card" aria-labelledby="ready-title">
      {/* Hero / Success Header */}
      <div className="event-ready-card__hero text-center">
        <div className="event-ready-card__badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3">
          <Sparkle size={13} weight="fill" aria-hidden="true" />
          <span>{t("ready.heroBadge")}</span>
        </div>
        <h1 id="ready-title" className="event-ready-card__title">
          {t("ready.heroTitle")}
        </h1>
        <p className="event-ready-card__subtitle text-muted-foreground mt-2 max-w-lg mx-auto">
          {t("ready.heroSubtitle")}
        </p>

        {/* Event Meta Pills */}
        <div className="event-ready-card__meta mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="event-ready-card__meta-item px-3 py-1 bg-surface border border-line rounded-md text-sm font-medium text-ink">
            {event.name}
          </span>
          <span className="event-ready-card__meta-item px-3 py-1 bg-surface border border-line rounded-md text-sm text-muted-foreground">
            {t(`types.${event.event_type}`)}
          </span>
          <span className="event-ready-card__meta-item px-3 py-1 bg-surface border border-line rounded-md text-sm text-muted-foreground">
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Main QR Card */}
      <div className="event-ready-card__qr-box mt-8 mx-auto max-w-md bg-surface border border-line rounded-2xl p-6 sm:p-8 shadow-card text-center">
        <div className="event-ready-card__qr-image mx-auto w-64 h-64 sm:w-72 sm:h-72 p-3 bg-white rounded-xl border border-line flex items-center justify-center shadow-subtle">
          {qrDataUrl ? (
            <Image
              src={qrDataUrl}
              alt={event.name}
              width={260}
              height={260}
              className="w-full h-full object-contain rounded-lg"
              unoptimized
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <QrCode size={64} aria-hidden="true" />
              <span className="text-xs">{t("checklist.itemQrReady")}</span>
            </div>
          )}
        </div>

        <h2 className="event-ready-card__qr-event-name font-heading text-xl text-ink mt-5">
          {event.name}
        </h2>

        <p className="event-ready-card__qr-cta text-sm font-medium text-primary mt-1">
          {t("ready.qrCta")}
        </p>

        <p className="event-ready-card__qr-trust text-xs text-subtle mt-1">
          {t("ready.noAppNeeded")}
        </p>

        {/* Short guest URL */}
        <div className="event-ready-card__guest-link mt-4 p-2.5 bg-background border border-line rounded-lg flex items-center justify-between gap-2">
          <span className="text-xs font-mono text-muted-foreground truncate select-all">
            {displayUrl}
          </span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="text-xs text-primary hover:text-primary-hover font-medium flex items-center gap-1 shrink-0 p-1"
            aria-label={t("ready.copyLink")}
          >
            {copied ? (
              <Check size={14} className="text-primary" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="event-ready-card__qr-actions mt-5 grid grid-cols-2 gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleDownloadQr}
            className="w-full text-xs sm:text-sm h-10 flex items-center justify-center gap-1.5"
          >
            <DownloadSimple size={16} aria-hidden="true" />
            <span>{t("ready.downloadQr")}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleCopyLink}
            className="w-full text-xs sm:text-sm h-10 flex items-center justify-center gap-1.5"
          >
            {copied ? (
              <Check size={16} aria-hidden="true" className="text-primary" />
            ) : (
              <Copy size={16} aria-hidden="true" />
            )}
            <span>{t("ready.copyLink")}</span>
          </Button>
        </div>

        {/* Open guest page link */}
        <div className="mt-3">
          <a
            href={fullGuestUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-ink inline-flex items-center gap-1 underline underline-offset-4"
          >
            <span>{t("ready.openGuestPage")}</span>
            <ArrowSquareOut size={13} aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Primary Action: Preview as guest */}
      <div className="event-ready-card__preview-section mt-6 mx-auto max-w-md text-center">
        <Button
          type="button"
          onClick={handlePreview}
          className="button button--primary w-full h-13 text-base font-semibold shadow-raised flex items-center justify-center gap-2"
        >
          <Eye size={20} weight="bold" aria-hidden="true" />
          <span>{t("ready.previewAsGuest")}</span>
        </Button>
        <p className="text-xs text-subtle mt-2">{t("ready.previewNotice")}</p>
      </div>

      {/* Overview Shortcut */}
      <div className="event-ready-card__overview-link mt-4 text-center">
        <Link
          href={`/events/${encodeURIComponent(event.id)}`}
          className="text-button text-sm font-medium text-ink hover:text-primary inline-flex items-center gap-1"
        >
          <span>{t("ready.goToOverview")}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
