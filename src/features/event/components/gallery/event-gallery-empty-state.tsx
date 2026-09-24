"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Camera, Eye, Printer, QrCode, Sparkle } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui";

type EventGalleryEmptyStateProps = {
  eventName?: string;
  publicCode?: string;
  guestUrl?: string;
  onOpenShare?: () => void;
  onOpenPrint?: () => void;
};

export function EventGalleryEmptyState({
  eventName,
  publicCode,
  guestUrl,
  onOpenShare,
  onOpenPrint,
}: EventGalleryEmptyStateProps) {
  const t = useTranslations("event");
  const [emptyQrUrl, setEmptyQrUrl] = useState<string>("");

  // Dynamically generate real scannable event QR code for empty state showcase
  useEffect(() => {
    let active = true;
    const qrTargetUrl = guestUrl || (publicCode ? `/e/${publicCode}` : "");

    if (!qrTargetUrl) return;

    void import("qrcode")
      .then((qr) =>
        qr.toDataURL(qrTargetUrl, {
          width: 360,
          margin: 1.5,
          color: { dark: "#181e17", light: "#ffffff" },
          errorCorrectionLevel: "H",
        }),
      )
      .then((url) => {
        if (active) setEmptyQrUrl(url);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [publicCode, guestUrl]);

  return (
    <div className="event-gallery__hero-empty">
      {/* Visual Stage: 3-card Editorial Cluster (Polaroids + Center Live Mini QR Standee) */}
      <div className="event-gallery__empty-stage">
        {/* Left Polaroid: Authentic Cocktail / Gathering Candid */}
        <div className="event-gallery__polaroid event-gallery__polaroid--left">
          <div
            className="event-gallery__washi-tape event-gallery__washi-tape--left"
            aria-hidden="true"
          />
          <div className="event-gallery__polaroid-media">
            <Image
              src="/images/moment.jpg"
              alt="Sample candid moment"
              fill
              sizes="160px"
              className="object-cover"
            />
          </div>
          <p className="event-gallery__polaroid-caption">
            {t("gallery.sampleMoment1")}
          </p>
        </div>

        {/* Center Hero: Interactive Live Mini QR Standee */}
        <div className="event-gallery__qr-standee">
          <div className="event-gallery__qr-standee-header">
            <Sparkle
              size={14}
              weight="fill"
              className="text-amber-500 shrink-0"
              aria-hidden="true"
            />
            <span className="event-gallery__qr-standee-title truncate">
              {eventName || "CandidCrowd"}
            </span>
          </div>

          <div className="event-gallery__qr-standee-code-box">
            {emptyQrUrl ? (
              <div className="event-gallery__qr-standee-img-wrap">
                <Image
                  src={emptyQrUrl}
                  alt="Event QR code"
                  width={132}
                  height={132}
                  className="event-gallery__qr-standee-img"
                />
                <div
                  className="event-gallery__qr-standee-logo-pin"
                  aria-hidden="true"
                >
                  <Camera size={13} weight="fill" />
                </div>
              </div>
            ) : (
              <div className="event-gallery__qr-standee-placeholder animate-pulse">
                <QrCode size={40} className="text-muted-foreground/40" />
              </div>
            )}
          </div>

          {publicCode && (
            <div className="event-gallery__qr-standee-url">
              <span>candidcrowd.life/e/{publicCode}</span>
            </div>
          )}

          <div className="event-gallery__qr-standee-badge">
            <span className="event-gallery__pulse-dot" aria-hidden="true" />
            <span>{t("gallery.scanToTryPrompt")}</span>
          </div>
        </div>

        {/* Right Polaroid: Dance Floor / Celebration Candid */}
        <div className="event-gallery__polaroid event-gallery__polaroid--right">
          <div
            className="event-gallery__washi-tape event-gallery__washi-tape--right"
            aria-hidden="true"
          />
          <div className="event-gallery__polaroid-media">
            <Image
              src="/images/table.jpg"
              alt="Sample celebratory moment"
              fill
              sizes="160px"
              className="object-cover"
            />
          </div>
          <p className="event-gallery__polaroid-caption">
            {t("gallery.sampleMoment2")}
          </p>
        </div>
      </div>

      {/* Copywriting & Emotional Narrative */}
      <div className="event-gallery__hero-empty-copy">
        <h3 className="event-gallery__hero-empty-title font-heading">
          {t("gallery.emptyTitle")}
        </h3>
        <p className="event-gallery__hero-empty-desc">
          {t("gallery.emptyDesc")}
        </p>
      </div>

      {/* Action CTAs */}
      <div className="event-gallery__hero-empty-actions">
        {onOpenShare && (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onOpenShare}
            className="gap-2 font-medium"
          >
            <QrCode size={15} weight="bold" aria-hidden="true" />
            <span>{t("gallery.shareQr")}</span>
          </Button>
        )}

        {guestUrl && (
          <a
            href={guestUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Eye size={15} weight="bold" aria-hidden="true" />
            <span>{t("gallery.viewAsGuest")}</span>
          </a>
        )}

        {onOpenPrint && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onOpenPrint}
            className="gap-1.5 text-muted-foreground hover:text-ink"
          >
            <Printer size={15} aria-hidden="true" />
            <span>{t("gallery.downloadPrintCard")}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
