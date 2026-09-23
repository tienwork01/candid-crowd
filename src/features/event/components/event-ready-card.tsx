"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowSquareOut,
  Check,
  Copy,
  DownloadSimple,
  Printer,
  QrCode,
  ShareNetwork,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { CandidEvent } from "../types/event";
import { Button } from "@/components/ui";
import { QRStyledPreview, type QRCustomizeState } from "./qr-customize";
import { loadQRConfig } from "../lib/qr-customize-storage";

type EventReadyCardProps = {
  event: CandidEvent;
  qrDataUrl?: string;
  config?: QRCustomizeState | null;
  onOpenPrintModal?: () => void;
  configVersion?: number;
  onDownloadReady?: (fn: (ext: "png" | "svg") => Promise<void>) => void;
};

export function EventReadyCard({
  event,
  qrDataUrl: initialQrDataUrl,
  config: propConfig,
  onOpenPrintModal,
  configVersion,
  onDownloadReady,
}: EventReadyCardProps) {
  const t = useTranslations("event");

  const [localQrDataUrl, setLocalQrDataUrl] = useState<string>(
    initialQrDataUrl || "",
  );
  const [copied, setCopied] = useState(false);
  const [customConfig, setCustomConfig] = useState<QRCustomizeState | null>(
    () => propConfig || loadQRConfig(event.id),
  );
  const [prevEventKey, setPrevEventKey] = useState(
    () => `${event.id}-${configVersion ?? 0}`,
  );
  const styledDownloadFnRef = useRef<
    ((ext: "png" | "svg") => Promise<void>) | null
  >(null);

  const currentEventKey = `${event.id}-${configVersion ?? 0}`;

  if (propConfig) {
    if (customConfig !== propConfig) {
      setCustomConfig(propConfig);
    }
  } else if (currentEventKey !== prevEventKey) {
    setPrevEventKey(currentEventKey);
    setCustomConfig(loadQRConfig(event.id));
  }

  const canShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  // Compute guest URLs
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicPath = event.public_url || `/e/${event.slug}`;
  const fullGuestUrl = event.guest_url || `${origin}${publicPath}`;

  // Display-friendly short URL
  const displayUrl = fullGuestUrl.replace(/^https?:\/\//, "");

  // Generate QR if not passed from parent
  useEffect(() => {
    if (initialQrDataUrl) {
      return;
    }

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
        if (active) setLocalQrDataUrl(dataUrl);
      })
      .catch(() => {
        // Handled via fallback icon
      });

    return () => {
      active = false;
    };
  }, [fullGuestUrl, initialQrDataUrl]);

  const qrDataUrl = initialQrDataUrl || localQrDataUrl;

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

  const handleNativeShare = async () => {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share({
          title: event.name,
          text: `${event.name} - ${t("ready.heroSubtitle")}`,
          url: fullGuestUrl,
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          void handleCopyLink();
        }
      }
    } else {
      void handleCopyLink();
    }
  };

  const handleDownloadQr = () => {
    if (customConfig && styledDownloadFnRef.current) {
      void styledDownloadFnRef.current("png");
      toast.success(t("ready.downloadQr"));

      return;
    }

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

  return (
    <section
      className="event-ready-card bg-surface border border-line rounded-2xl p-5 sm:p-6 shadow-card"
      aria-labelledby="ready-qr-heading"
    >
      {/* Card Header */}
      <div className="event-ready-card__header flex items-center justify-between pb-3.5 mb-4 border-b border-line/60">
        <div className="flex items-center gap-2">
          <QrCode
            size={18}
            className="text-primary"
            weight="bold"
            aria-hidden="true"
          />
          <h2
            id="ready-qr-heading"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {t("checklist.itemQrReady")}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            {t("ready.heroBadge")}
          </span>
        </div>
      </div>

      {/* Main QR Code Visual Frame */}
      {customConfig ? (
        <div className="mx-auto flex justify-center">
          <QRStyledPreview
            url={fullGuestUrl}
            config={customConfig}
            eventName={event.name}
            size={200}
            className="w-full max-w-[280px]"
            onDownloadReady={(fn) => {
              styledDownloadFnRef.current = fn;
              onDownloadReady?.(fn);
            }}
          />
        </div>
      ) : (
        <>
          <div className="event-ready-card__qr-frame mx-auto w-52 h-52 sm:w-60 sm:h-60 p-3 bg-white rounded-xl border border-line shadow-subtle flex items-center justify-center">
            {qrDataUrl ? (
              <Image
                src={qrDataUrl}
                alt={event.name}
                width={240}
                height={240}
                className="w-full h-full object-contain rounded-lg"
                unoptimized
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <QrCode size={48} aria-hidden="true" />
                <span className="text-xs">{t("checklist.itemQrReady")}</span>
              </div>
            )}
          </div>

          {/* CTA & Trust note */}
          <div className="event-ready-card__labels text-center mt-3.5">
            <p className="text-sm font-semibold text-ink">{t("ready.qrCta")}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("ready.noAppNeeded")}
            </p>
          </div>
        </>
      )}

      {/* Short Guest URL Bar - Full container click-to-copy */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleCopyLink}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            void handleCopyLink();
          }
        }}
        className={`event-ready-card__guest-link mt-4 h-11 px-3 bg-background border rounded-lg flex items-center justify-between gap-2 cursor-pointer transition-all duration-200 select-none group ${
          copied
            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
            : "border-line hover:border-line-hover hover:bg-surface-raised"
        }`}
        title={t("ready.copyLink")}
        aria-label={t("ready.copyLink")}
      >
        <span className="text-xs font-mono text-muted-foreground group-hover:text-ink truncate transition-colors">
          {displayUrl}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-primary font-medium flex items-center gap-1 p-1">
            {copied ? (
              <Check size={14} className="text-primary" weight="bold" />
            ) : (
              <Copy size={14} />
            )}
            <span>{copied ? t("share.copied") : t("ready.copyLink")}</span>
          </span>

          {canShare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void handleNativeShare();
              }}
              className="text-xs text-muted-foreground hover:text-ink font-medium flex items-center gap-1 p-1 rounded hover:bg-surface border border-line/60 transition-colors"
              title={t("share.title")}
              aria-label={t("share.title")}
            >
              <ShareNetwork size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Action Buttons (Download QR + Print Sign) */}
      <div className="event-ready-card__actions mt-3 grid grid-cols-2 gap-2.5">
        <Button
          type="button"
          variant="outline"
          onClick={handleDownloadQr}
          className="w-full text-xs sm:text-sm h-10 flex items-center justify-center gap-1.5"
        >
          <DownloadSimple size={16} aria-hidden="true" />
          <span>{t("ready.downloadQr")}</span>
        </Button>

        {onOpenPrintModal ? (
          <Button
            type="button"
            variant="outline"
            onClick={onOpenPrintModal}
            className="w-full text-xs sm:text-sm h-10 flex items-center justify-center gap-1.5"
          >
            <Printer size={16} aria-hidden="true" />
            <span>{t("share.downloadPrintTemplate")}</span>
          </Button>
        ) : (
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
        )}
      </div>

      {/* Direct guest page link */}
      <div className="event-ready-card__direct-link mt-4 pt-3.5 border-t border-line/60 text-center">
        <a
          href={fullGuestUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-ink inline-flex items-center gap-1 underline underline-offset-4 transition-colors"
        >
          <span>{t("ready.openGuestPage")}</span>
          <ArrowSquareOut size={13} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
