"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowSquareOut,
  Check,
  Copy,
  DownloadSimple,
  QrCode,
  X,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { CandidEvent } from "../types/event";
import { Button } from "@/components/ui";

type EventQrDialogProps = {
  event: CandidEvent;
  isOpen: boolean;
  onClose: () => void;
};

export function EventQrDialog({ event, isOpen, onClose }: EventQrDialogProps) {
  const t = useTranslations("event");
  const tCommon = useTranslations("common");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicPath = event.public_url || `/e/${event.slug}`;
  const fullGuestUrl = event.guest_url || `${origin}${publicPath}`;
  const displayUrl = fullGuestUrl.replace(/^https?:\/\//, "");

  useEffect(() => {
    if (!isOpen) return;

    let active = true;

    void import("qrcode")
      .then((qr) =>
        qr.toDataURL(fullGuestUrl, {
          width: 512,
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
  }, [isOpen, fullGuestUrl]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullGuestUrl);
      setCopied(true);
      toast.success(t("ready.linkCopied"));
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error(t("ready.copyLink"));
    }
  };

  const handleDownload = () => {
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-dialog-title"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-surface border border-line rounded-2xl shadow-raised overflow-hidden p-6 text-center"
        style={{ backgroundColor: "var(--surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-line">
          <h2
            id="qr-dialog-title"
            className="font-heading text-lg text-ink font-medium"
          >
            {event.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-ink transition-colors"
            aria-label={tCommon("actions.close")}
          >
            <X size={16} />
          </button>
        </div>

        {/* QR image */}
        <div className="mx-auto w-56 h-56 p-2 bg-white rounded-xl border border-line flex items-center justify-center shadow-subtle mb-4">
          {qrDataUrl ? (
            <Image
              src={qrDataUrl}
              alt={event.name}
              width={220}
              height={220}
              className="w-full h-full object-contain rounded-lg"
              unoptimized
            />
          ) : (
            <QrCode size={56} className="text-muted-foreground" />
          )}
        </div>

        <p className="text-xs font-semibold text-primary mb-1">
          {t("ready.qrCta")}
        </p>
        <p className="text-[11px] text-muted-foreground mb-4">
          {t("ready.noAppNeeded")}
        </p>

        {/* Short URL copy box */}
        <div className="h-10 px-3 bg-background border border-line rounded-lg flex items-center justify-between gap-2 mb-4">
          <span className="text-xs font-mono text-muted-foreground truncate select-all">
            {displayUrl}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs text-primary font-medium flex items-center gap-1 shrink-0 p-1"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="h-10 text-xs gap-1.5"
          >
            <DownloadSimple size={15} />
            <span>{t("ready.downloadQr")}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-10 text-xs gap-1.5"
          >
            {copied ? (
              <Check size={15} className="text-primary" />
            ) : (
              <Copy size={15} />
            )}
            <span>{t("ready.copyLink")}</span>
          </Button>
        </div>

        <div className="mt-4 pt-3 border-t border-line">
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
    </div>
  );
}
