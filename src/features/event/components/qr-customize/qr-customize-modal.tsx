"use client";

import { useEffect, useState } from "react";
import {
  ArrowCounterClockwise,
  ArrowSquareOut,
  Check,
  PaintBrush,
  X,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import type { CandidEvent } from "../../types/event";
import {
  DEFAULT_QR_CUSTOMIZE_STATE,
  type QRCustomizeState,
} from "./qr-customize-types";
import { QRStyledPreview } from "./qr-styled-preview";
import { QRColorPresets } from "./qr-color-presets";
import { QRStyleSelector } from "./qr-style-selector";
import { QRLogoUpload } from "./qr-logo-upload";
import { loadQRConfig, saveQRConfig } from "../../lib/qr-customize-storage";

interface QRCustomizeModalProps {
  event: CandidEvent;
  guestUrl: string;
  formattedDate?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onApplied?: (config: QRCustomizeState) => void;
}

export function QRCustomizeModal({
  event,
  guestUrl,
  formattedDate,
  isOpen,
  onClose,
  onApplied,
}: QRCustomizeModalProps) {
  const t = useTranslations("event.qrCustomize");
  const tCommon = useTranslations("common");

  const [config, setConfig] = useState<QRCustomizeState>(() => {
    return loadQRConfig(event.id) || DEFAULT_QR_CUSTOMIZE_STATE;
  });

  // Keyboard close listener
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

  if (!isOpen) return null;

  const handleReset = () => {
    setConfig(DEFAULT_QR_CUSTOMIZE_STATE);
    toast.success(t("resetSuccess"));
  };

  const handleApply = () => {
    if (!config.logoDataUrl) {
      toast.warning(t("noLogoWarning"));
    }

    saveQRConfig(event.id, config);
    onApplied?.(config);
    toast.success(t("applied"));
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-customizer-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-surface border border-line rounded-3xl shadow-raised overflow-hidden my-auto flex flex-col max-h-[92vh]"
        style={{ backgroundColor: "var(--surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-line shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <PaintBrush size={18} weight="bold" />
            </div>
            <div>
              <h2
                id="qr-customizer-title"
                className="font-heading text-base sm:text-lg font-semibold text-ink leading-tight"
              >
                {t("title")}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-ink hover:bg-surface-raised transition-colors"
            aria-label={tCommon("actions.close")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: Split 2-Column Grid */}
        {/* Modal Body: Split 2-Column Grid */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Focused Live Preview (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-3 lg:sticky lg:top-0">
            <div className="w-full flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("previewLabel")}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {t("vectorBadge")}
              </span>
            </div>

            {/* Dedicated Stage for QR & Logo Preview */}
            <div className="w-full flex justify-center p-3 sm:p-4 rounded-3xl bg-background/60 border border-line/60">
              <QRStyledPreview
                url={guestUrl}
                config={config}
                eventName={event.name}
                formattedDate={formattedDate}
                size={260}
                className="w-full max-w-[320px]"
              />
            </div>

            {!config.logoDataUrl && (
              <p className="text-[11px] text-amber-700 dark:text-amber-400 text-center max-w-[280px]">
                {t("noLogoWarning")}
              </p>
            )}

            {/* Direct Guest Link Info Box */}
            {guestUrl && (
              <div className="w-full p-3 bg-soft border border-line/60 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <ArrowSquareOut
                    size={14}
                    className="text-primary shrink-0"
                    aria-hidden="true"
                  />
                  <span>{t("destinationLabel")}</span>
                </div>
                <p className="text-[11px] font-mono text-muted-foreground truncate select-all">
                  {guestUrl}
                </p>
                <p className="text-[11px] text-muted-foreground pt-0.5">
                  {t("destinationHint")}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Prominent Interactive Customization Controls (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Step 1: Logo Upload (Hero Interactive Card) */}
            <section
              aria-labelledby="heading-logo-upload"
              className="p-4 sm:p-5 bg-surface border-2 border-primary/25 rounded-2xl shadow-xs"
            >
              <QRLogoUpload
                logoDataUrl={config.logoDataUrl}
                logoSize={config.logoSize}
                onChange={({ logoDataUrl, logoSize }) =>
                  setConfig((prev) => ({
                    ...prev,
                    logoDataUrl,
                    logoSize: logoSize !== undefined ? logoSize : prev.logoSize,
                  }))
                }
              />
            </section>

            {/* Step 2: Color Palette Presets */}
            <section
              aria-labelledby="heading-color-presets"
              className="p-4 sm:p-5 bg-surface border border-line rounded-2xl shadow-xs"
            >
              <QRColorPresets
                fgColor={config.fgColor}
                bgColor={config.bgColor}
                cardBgColor={config.cardBgColor}
                onChange={({ fgColor, bgColor, cardBgColor }) =>
                  setConfig((prev) => ({
                    ...prev,
                    fgColor,
                    bgColor,
                    cardBgColor,
                  }))
                }
              />
            </section>

            {/* Step 3: QR Module & Corner Styles */}
            <section
              aria-labelledby="heading-qr-styles"
              className="p-4 sm:p-5 bg-surface border border-line rounded-2xl shadow-xs"
            >
              <QRStyleSelector
                dotType={config.dotType}
                cornerSquareType={config.cornerSquareType}
                cornerDotType={config.cornerDotType}
                onChange={(updates) =>
                  setConfig((prev) => ({
                    ...prev,
                    ...updates,
                  }))
                }
              />
            </section>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-line bg-surface flex flex-wrap items-center justify-between gap-3 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-ink gap-1.5"
          >
            <ArrowCounterClockwise size={14} />
            <span>{t("resetDefaults")}</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs"
            >
              <span>{tCommon("actions.cancel")}</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="h-8 text-xs font-semibold px-4 gap-1.5 shadow-raised"
            >
              <Check size={14} weight="bold" />
              <span>{t("apply")}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
