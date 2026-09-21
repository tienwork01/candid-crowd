"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowSquareOut,
  Cardholder,
  Check,
  Copy,
  DownloadSimple,
  QrCode,
  ShareNetwork,
  X,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { CandidEvent } from "../types/event";
import { getEventPublicCode } from "../types/event";
import { Button } from "@/components/ui";
import { EventPrintModal } from "./print";

type EventSharePopoverProps = {
  event: CandidEvent;
  isOpen: boolean;
  onClose: () => void;
};

export function EventSharePopover({
  event,
  isOpen,
  onClose,
}: EventSharePopoverProps) {
  const t = useTranslations("event");
  const tCommon = useTranslations("common");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Clean public URL formatting: candidcrowd.life/e/CB0449
  const publicCode = getEventPublicCode(event);
  const displayUrl = `candidcrowd.life/e/${publicCode}`;
  const publicGuestUrl = `https://${displayUrl}`;

  // Local/app preview URL for host testing in preview mode
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicPath = event.public_url || `/e/${publicCode}`;
  const testGuestUrl = `${event.guest_url || `${origin}${publicPath}`}?is_test=true`;

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Generate QR code encoding the permanent public URL
  useEffect(() => {
    if (!isOpen) return;

    let active = true;

    void import("qrcode")
      .then((qr) =>
        qr.toDataURL(publicGuestUrl, {
          width: 400,
          margin: 1.5,
          color: { dark: "#181e17", light: "#ffffff" },
          errorCorrectionLevel: "H",
        }),
      )
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [isOpen, publicGuestUrl]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicGuestUrl);
      setCopied(true);
      toast.success(t("share.linkCopied"));
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error(t("share.copyLink"));
    }
  };

  // Export 1: QR-only image
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
    toast.success(t("share.downloadQr"));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-popover-title"
      className="event-share-popover"
      onClick={onClose}
    >
      <div
        className="event-share-popover__card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title and Close Button */}
        <div className="event-share-popover__header">
          <h3 id="share-popover-title" className="event-share-popover__title">
            <ShareNetwork
              size={17}
              className="text-primary"
              aria-hidden="true"
            />
            <span>{t("share.title")}</span>
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="event-share-popover__close-btn"
            aria-label={tCommon("actions.close")}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* 1. Large QR (Main visual element) */}
        <div className="event-share-popover__qr">
          {qrDataUrl ? (
            <Image
              src={qrDataUrl}
              alt={event.name}
              width={176}
              height={176}
              className="w-full h-full object-contain rounded-lg"
              unoptimized
            />
          ) : (
            <QrCode size={52} className="text-muted-foreground" />
          )}
        </div>

        {/* 2. Concise QR Caption */}
        <p className="event-share-popover__caption">{t("share.qrCta")}</p>

        {/* 3. Short Public URL Box */}
        <div className="event-share-popover__url-box">
          <span className="text-xs font-mono text-muted-foreground truncate select-all">
            {displayUrl}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="event-share-popover__copy-btn"
            aria-label={copied ? t("share.copied") : t("share.copyLink")}
          >
            {copied ? (
              <Check size={15} weight="bold" className="text-primary" />
            ) : (
              <Copy size={15} />
            )}
          </button>
        </div>

        {/* 4. Action Buttons with Clear Hierarchy */}
        <div className="event-share-popover__actions">
          {/* Primary Action: Copy Link (temporarily shows ✓ Copied / ✓ Đã sao chép for 1-2s) */}
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleCopy}
            className="w-full h-10 text-xs font-semibold gap-1.5 shadow-subtle"
          >
            {copied ? (
              <>
                <Check size={16} weight="bold" aria-hidden="true" />
                <span>{t("share.copied")}</span>
              </>
            ) : (
              <>
                <Copy size={16} aria-hidden="true" />
                <span>{t("share.copyLink")}</span>
              </>
            )}
          </Button>

          {/* Secondary Action: Download QR */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadQr}
            className="w-full h-9 text-xs gap-1.5"
          >
            <DownloadSimple size={15} aria-hidden="true" />
            <span>{t("share.downloadQr")}</span>
          </Button>

          {/* Secondary Full-width: Download Print Template (Tải mẫu in) */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPrintModalOpen(true)}
            className="w-full h-9 text-xs gap-1.5"
          >
            <Cardholder size={15} aria-hidden="true" />
            <span>{t("share.downloadPrintTemplate")}</span>
          </Button>
        </div>

        {/* 5. Subtle Informational Note below download actions */}
        <p className="event-share-popover__note">{t("share.permanentNote")}</p>

        {/* 6. Quiet Footer Action: View as Guest */}
        <div className="event-share-popover__footer">
          <a
            href={testGuestUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="event-share-popover__footer-link"
          >
            <span>{t("share.viewAsGuest")}</span>
            <ArrowSquareOut size={13} aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Print Sign Studio Dialog */}
      <EventPrintModal
        event={event}
        qrDataUrl={qrDataUrl}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
}
