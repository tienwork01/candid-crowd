"use client";

import { useState } from "react";
import { Check, Faders } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { type QRColorPreset, QR_COLOR_PRESETS } from "./qr-customize-types";

interface QRColorPresetsProps {
  fgColor: string;
  bgColor: string;
  cardBgColor: string;
  onChange: (updates: {
    fgColor: string;
    bgColor: string;
    cardBgColor: string;
  }) => void;
}

export function QRColorPresets({
  fgColor,
  bgColor,
  cardBgColor,
  onChange,
}: QRColorPresetsProps) {
  const t = useTranslations("event.qrCustomize");
  const [showCustom, setShowCustom] = useState(false);

  const activePreset = QR_COLOR_PRESETS.find(
    (p) =>
      p.fg.toLowerCase() === fgColor.toLowerCase() &&
      p.bg.toLowerCase() === bgColor.toLowerCase(),
  );

  const handleSelectPreset = (preset: QRColorPreset) => {
    onChange({
      fgColor: preset.fg,
      bgColor: preset.bg,
      cardBgColor: preset.cardBg,
    });
  };

  return (
    <div className="qr-color-presets space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
          {t("colorScheme")}
        </label>
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          className={`text-xs flex items-center gap-1 font-medium transition-colors ${
            showCustom ? "text-primary" : "text-muted-foreground hover:text-ink"
          }`}
          aria-expanded={showCustom}
        >
          <Faders size={13} aria-hidden="true" />
          <span>{t("custom")}</span>
        </button>
      </div>

      {/* Preset Swatches Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {QR_COLOR_PRESETS.map((preset) => {
          const isSelected = activePreset?.id === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`group relative flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all duration-150 ${
                isSelected
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                  : "border-line hover:border-line-hover bg-surface"
              }`}
              title={t(preset.nameKey)}
              aria-label={t(preset.nameKey)}
            >
              {/* Split circle indicator: Left = FG, Right = BG */}
              <div
                className="w-7 h-7 rounded-full border border-black/10 overflow-hidden relative shadow-2xs flex shrink-0"
                style={{ backgroundColor: preset.bg }}
              >
                <div
                  className="w-1/2 h-full"
                  style={{ backgroundColor: preset.fg }}
                />
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
                    <Check size={12} weight="bold" />
                  </div>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground truncate w-full text-center group-hover:text-ink">
                {t(preset.nameKey)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom Color Pickers Accordion */}
      {showCustom && (
        <div className="p-3 bg-surface border border-line rounded-xl grid grid-cols-2 gap-3 text-xs animate-in fade-in duration-200">
          <div>
            <label className="text-[11px] font-medium text-muted-foreground block mb-1">
              {t("customFg")}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgColor}
                onChange={(e) =>
                  onChange({ fgColor: e.target.value, bgColor, cardBgColor })
                }
                className="w-8 h-8 rounded-lg border border-line cursor-pointer p-0.5 bg-transparent"
              />
              <span className="font-mono text-xs uppercase text-ink">
                {fgColor}
              </span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-muted-foreground block mb-1">
              {t("customBg")}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) =>
                  onChange({
                    fgColor,
                    bgColor: e.target.value,
                    cardBgColor: e.target.value,
                  })
                }
                className="w-8 h-8 rounded-lg border border-line cursor-pointer p-0.5 bg-transparent"
              />
              <span className="font-mono text-xs uppercase text-ink">
                {bgColor}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
