"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  DownloadSimple,
  FilePdf,
  FilePng,
  Printer,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { formatDate } from "@/i18n/format";
import type { AppLocale } from "@/i18n/locales";
import { Button } from "@/components/ui";
import type { CandidEvent } from "../../types/event";
import { getEventPublicCode } from "../../types/event";
import {
  PRINT_DIMENSIONS,
  type PrintFormat,
  type PrintSignConfig,
  type PrintSize,
  type PrintTheme,
} from "./print-template-types";
import { renderPrintTemplateCanvas } from "./print-template-renderer";
import { downloadPrintableSign } from "./print-pdf-generator";

type EventPrintModalProps = {
  event: CandidEvent;
  qrDataUrl?: string;
  isOpen: boolean;
  onClose: () => void;
};

const THEME_OPTIONS: Array<{
  theme: PrintTheme;
  labelKey:
    | "printSign.themeWedding"
    | "printSign.themeEditorial"
    | "printSign.themeMinimal"
    | "printSign.themeRomantic"
    | "printSign.themeBotanical"
    | "printSign.themeModern";
}> = [
  { theme: "wedding", labelKey: "printSign.themeWedding" },
  { theme: "editorial", labelKey: "printSign.themeEditorial" },
  { theme: "romantic", labelKey: "printSign.themeRomantic" },
  { theme: "botanical", labelKey: "printSign.themeBotanical" },
  { theme: "modern", labelKey: "printSign.themeModern" },
  { theme: "minimal", labelKey: "printSign.themeMinimal" },
];

const SIZE_OPTIONS: Array<{
  size: PrintSize;
  labelKey: "printSign.size5x7" | "printSign.sizeA5" | "printSign.sizeA4";
}> = [
  { size: "5x7", labelKey: "printSign.size5x7" },
  { size: "a5", labelKey: "printSign.sizeA5" },
  { size: "a4", labelKey: "printSign.sizeA4" },
];

const FORMAT_OPTIONS: Array<{
  format: PrintFormat;
  labelKey: "printSign.formatPdf" | "printSign.formatPng";
}> = [
  { format: "pdf", labelKey: "printSign.formatPdf" },
  { format: "png", labelKey: "printSign.formatPng" },
];

export function EventPrintModal({
  event,
  qrDataUrl,
  isOpen,
  onClose,
}: EventPrintModalProps) {
  const t = useTranslations("event");
  const tCommon = useTranslations("common");
  const locale = useLocale() as AppLocale;

  const [theme, setTheme] = useState<PrintTheme>(
    event.event_type === "Wedding" ? "wedding" : "editorial",
  );
  const [size, setSize] = useState<PrintSize>("5x7");
  const [format, setFormat] = useState<PrintFormat>("pdf");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isRenderingPreview, setIsRenderingPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Derived formatted date
  const formattedDate = useMemo(() => {
    if (!event.event_date) return null;

    try {
      return formatDate(event.event_date, locale, { dateStyle: "long" });
    } catch {
      return null;
    }
  }, [event.event_date, locale]);

  // Public short URL
  const publicCode = useMemo(() => getEventPublicCode(event), [event]);

  const shortUrl = `candidcrowd.life/e/${publicCode}`;

  const [highResQrUrl, setHighResQrUrl] = useState<string>("");

  // Generate high-resolution supersampled QR code (1400px, ECC H) for crisp print rendering
  useEffect(() => {
    if (!isOpen) return;

    let active = true;

    void import("qrcode")
      .then((qr) =>
        qr.toDataURL(`https://${shortUrl}`, {
          width: 1400,
          margin: 1.5,
          color: { dark: "#181e17", light: "#ffffff" },
          errorCorrectionLevel: "H",
        }),
      )
      .then((url) => {
        if (active) {
          setHighResQrUrl(url);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [isOpen, shortUrl]);

  // Theme-specific headline text
  const headlineText = useMemo(() => {
    switch (theme) {
      case "wedding":
        return t("printSign.headlineWedding");
      case "romantic":
        return t("printSign.headlineRomantic");
      case "botanical":
        return t("printSign.headlineBotanical");
      case "modern":
        return t("printSign.headlineModern");
      case "editorial":
      case "minimal":
      default:
        return t("printSign.headlineDefault");
    }
  }, [theme, t]);

  const instructionText = useMemo(() => {
    if (theme === "wedding") {
      return t("printSign.instructionWedding");
    }

    return t("printSign.instruction");
  }, [theme, t]);

  const eyebrowText = useMemo(() => {
    if (theme === "wedding") {
      return t("printSign.eyebrowWedding");
    }

    return undefined;
  }, [theme, t]);

  const effectiveQr = highResQrUrl || qrDataUrl || "";

  // Unified configuration object
  const printConfig: PrintSignConfig = useMemo(
    () => ({
      eventName: event.name,
      eventDate: event.event_date,
      formattedDate,
      theme,
      size,
      format,
      qrDataUrl: effectiveQr,
      shortUrl,
      headlineText,
      eyebrowText,
      instructionText,
      reassuranceText: t("printSign.reassurance"),
      poweredByText: t("printSign.poweredBy"),
      showBranding: true,
    }),
    [
      event.name,
      event.event_date,
      formattedDate,
      theme,
      size,
      format,
      effectiveQr,
      shortUrl,
      headlineText,
      eyebrowText,
      instructionText,
      t,
    ],
  );

  // Update live preview when configuration changes
  useEffect(() => {
    if (!isOpen || !effectiveQr) return;

    let active = true;

    const rafId = requestAnimationFrame(() => {
      if (active) {
        setIsRenderingPreview(true);
      }
    });

    renderPrintTemplateCanvas(printConfig)
      .then((canvas) => {
        if (!active) return;
        setPreviewUrl(canvas.toDataURL("image/png"));
      })
      .catch((err) => {
        console.error("Preview render failed:", err);
      })
      .finally(() => {
        if (active) {
          setIsRenderingPreview(false);
        }
      });

    return () => {
      active = false;
      cancelAnimationFrame(rafId);
    };
  }, [isOpen, effectiveQr, printConfig]);

  const handleDownload = async () => {
    if (isDownloading || !effectiveQr) return;

    try {
      setIsDownloading(true);
      await downloadPrintableSign(printConfig);
      toast.success(
        `${t("printSign.downloadAction")} (${format.toUpperCase()})`,
      );
    } catch (err) {
      console.error("Download failed:", err);
      toast.error(t("common.errors.UNKNOWN"));
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  const currentSpec = PRINT_DIMENSIONS[size];
  const aspectRatio = currentSpec.widthMm / currentSpec.heightMm;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-dialog-title"
      className="event-print-modal"
      onClick={onClose}
    >
      <div
        className="event-print-modal__card"
        style={{ backgroundColor: "var(--surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="event-print-modal__header">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Printer size={18} weight="duotone" />
            </div>
            <div>
              <h2 id="print-dialog-title" className="event-print-modal__title">
                {t("printSign.modalTitle")}
              </h2>
              <p className="event-print-modal__subtitle">
                {t("printSign.modalSubtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="event-print-modal__close-btn"
            aria-label={tCommon("actions.close")}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body (Preview + Controls) */}
        <div className="event-print-modal__body">
          {/* Left: Live Aspect-Ratio Preview */}
          <div className="event-print-modal__preview-pane">
            <div className="event-print-modal__preview-frame">
              <div
                className="event-print-modal__preview-canvas-wrapper"
                style={{ aspectRatio: `${aspectRatio}` }}
              >
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt={`${event.name} print preview`}
                    className="event-print-modal__preview-img"
                  />
                ) : (
                  <div className="event-print-modal__preview-placeholder">
                    <Sparkle size={24} className="animate-spin text-muted" />
                  </div>
                )}

                {isRenderingPreview && (
                  <div className="event-print-modal__preview-overlay">
                    <span className="text-xs font-medium text-ink bg-surface/80 px-2.5 py-1 rounded-full shadow-subtle backdrop-blur-xs">
                      {t("printSign.preview")}...
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Controls & Selectors */}
          <div className="event-print-modal__controls-pane">
            {/* 1. Theme Selector */}
            <div className="event-print-modal__control-group">
              <label className="event-print-modal__control-label">
                {t("printSign.selectTheme")}
              </label>
              <div className="event-print-modal__theme-grid">
                {THEME_OPTIONS.map(({ theme: th, labelKey }) => {
                  const isSelected = theme === th;

                  return (
                    <button
                      key={th}
                      type="button"
                      onClick={() => setTheme(th)}
                      className={`event-print-modal__theme-chip ${
                        isSelected
                          ? "event-print-modal__theme-chip--active"
                          : ""
                      }`}
                    >
                      <span className="capitalize">{t(labelKey)}</span>
                      {isSelected && (
                        <Check size={14} weight="bold" className="shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Size Selector */}
            <div className="event-print-modal__control-group">
              <label className="event-print-modal__control-label">
                {t("printSign.selectSize")}
              </label>
              <div className="event-print-modal__size-row">
                {SIZE_OPTIONS.map(({ size: sz, labelKey }) => {
                  const isSelected = size === sz;

                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSize(sz)}
                      className={`event-print-modal__size-chip ${
                        isSelected ? "event-print-modal__size-chip--active" : ""
                      }`}
                    >
                      <span>{t(labelKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Format Selector */}
            <div className="event-print-modal__control-group">
              <label className="event-print-modal__control-label">
                {t("printSign.selectFormat")}
              </label>
              <div className="event-print-modal__format-row">
                {FORMAT_OPTIONS.map(({ format: fmt, labelKey }) => {
                  const isSelected = format === fmt;

                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setFormat(fmt)}
                      className={`event-print-modal__format-chip ${
                        isSelected
                          ? "event-print-modal__format-chip--active"
                          : ""
                      }`}
                    >
                      {fmt === "pdf" ? (
                        <FilePdf size={16} weight="duotone" />
                      ) : (
                        <FilePng size={16} weight="duotone" />
                      )}
                      <span>{t(labelKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="event-print-modal__actions">
              <Button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="button button--primary w-full h-11 text-sm font-semibold flex items-center justify-center gap-2"
              >
                {isDownloading ? (
                  <>
                    <Sparkle size={16} className="animate-spin" />
                    <span>{t("printSign.downloading")}</span>
                  </>
                ) : (
                  <>
                    <DownloadSimple size={16} weight="bold" />
                    <span>
                      {t("printSign.downloadAction")} ({format.toUpperCase()})
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
