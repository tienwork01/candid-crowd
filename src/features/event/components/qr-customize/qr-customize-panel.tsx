"use client";

import { useRef } from "react";
import {
  ArrowCounterClockwise,
  ArrowSquareOut,
  Check,
  Sparkle,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import { QRLogoUpload } from "./qr-logo-upload";
import { QRColorPresets } from "./qr-color-presets";
import { QRStyleSelector } from "./qr-style-selector";
import type { QRCustomizeState } from "./qr-customize-types";

type QRCustomizePanelProps = {
  config: QRCustomizeState;
  onChange: (config: QRCustomizeState) => void;
  onReset: () => void;
  guestUrl?: string;
  className?: string;
};

export function QRCustomizePanel({
  config,
  onChange,
  onReset,
  guestUrl,
  className = "",
}: QRCustomizePanelProps) {
  const t = useTranslations("event.qrCustomize");
  const panelRef = useRef<HTMLDivElement>(null);

  const handleReset = () => {
    onReset();
    toast.success(t("resetSuccess"));
  };

  return (
    <div
      ref={panelRef}
      id="qr-studio-panel"
      className={`qr-customize-panel bg-surface border border-line rounded-2xl p-5 sm:p-6 shadow-card space-y-5 ${className}`}
      aria-label={t("title")}
    >
      {/* Panel Header */}
      <div className="qr-customize-panel__header pb-4 border-b border-line/60">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-heading font-semibold text-ink">
                {t("title")}
              </h2>
              <span className="inline-flex items-center gap-1 font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full text-[11px]">
                <Sparkle size={11} weight="fill" aria-hidden="true" />
                <span>{t("vectorBadge")}</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Center Logo (Hero Interactive Card) */}
      <section
        aria-labelledby="heading-logo-upload"
        className="p-4 sm:p-5 bg-surface border-2 border-primary/25 rounded-2xl shadow-xs transition-all hover:border-primary/40"
      >
        <QRLogoUpload
          logoDataUrl={config.logoDataUrl}
          logoSize={config.logoSize}
          onChange={({ logoDataUrl, logoSize }) =>
            onChange({
              ...config,
              logoDataUrl,
              logoSize: logoSize !== undefined ? logoSize : config.logoSize,
            })
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
            onChange({
              ...config,
              fgColor,
              bgColor,
              cardBgColor,
            })
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
            onChange({
              ...config,
              ...updates,
            })
          }
        />
      </section>

      {/* Direct Guest Link Destination Info */}
      {guestUrl && (
        <div className="p-3 bg-soft border border-line/60 rounded-xl space-y-1">
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

      {/* Bottom Action Bar */}
      <div className="pt-3 border-t border-line/60 flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-xs text-muted-foreground hover:text-ink gap-1.5 h-8 px-2.5"
        >
          <ArrowCounterClockwise size={14} />
          <span>{t("resetDefaults")}</span>
        </Button>

        <span className="text-xs font-semibold text-primary inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10">
          <Check size={13} weight="bold" />
          <span>{t("applied")}</span>
        </span>
      </div>
    </div>
  );
}
