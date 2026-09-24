"use client";

import { Check, Sparkle } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import type { GuestThemeConfig, GuestThemePreset } from "./guest-theme-types";
import { GUEST_THEME_PRESETS } from "./guest-theme-types";

type GuestThemePresetsTabProps = {
  config: GuestThemeConfig;
  onChange: (updated: Partial<GuestThemeConfig>) => void;
};

export function GuestThemePresetsTab({
  config,
  onChange,
}: GuestThemePresetsTabProps) {
  const t = useTranslations("event");

  const handleSelectPreset = (preset: GuestThemePreset) => {
    onChange({
      presetId: preset.id,
      primaryColor: preset.primaryColor,
      bgColor: preset.bgColor,
      surfaceColor: preset.surfaceColor,
      fontHeading: preset.fontHeading,
      fontBody: preset.fontBody,
      heroStyle: preset.heroStyle,
      galleryLayout: preset.galleryLayout,
      cameraFrame: preset.cameraFrame,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-ink">
          {t("guestTheme.presetsHeading")}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("guestTheme.presetsSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GUEST_THEME_PRESETS.map((preset) => {
          const isSelected = config.presetId === preset.id;
          const isDark = preset.bgColor === "#09090b";

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`group relative text-left p-3.5 rounded-xl border transition-all duration-200 ${
                isSelected
                  ? "border-primary ring-2 ring-primary/20 bg-surface shadow-xs"
                  : "border-line/70 hover:border-line hover:bg-surface/60 bg-surface/30"
              }`}
            >
              {/* Top Header of Card */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-ink">
                    {preset.nameKey.replace("preset", "")}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-soft/80 border border-line/60 text-muted-foreground font-medium">
                    {preset.badge}
                  </span>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-primary text-white"
                      : "border border-line text-transparent group-hover:border-primary/50"
                  }`}
                >
                  <Check size={11} weight="bold" />
                </div>
              </div>

              {/* Color Swatches Palette */}
              <div className="flex items-center gap-1.5 mb-2.5">
                <span
                  className="w-5 h-5 rounded-md border border-black/10 shadow-2xs shrink-0"
                  style={{ backgroundColor: preset.primaryColor }}
                  title="Primary Color"
                />
                <span
                  className="w-5 h-5 rounded-md border border-black/10 shadow-2xs shrink-0"
                  style={{ backgroundColor: preset.bgColor }}
                  title="Background"
                />
                <span
                  className="w-5 h-5 rounded-md border border-black/10 shadow-2xs shrink-0"
                  style={{ backgroundColor: preset.surfaceColor }}
                  title="Surface"
                />
                <span className="text-[10px] text-muted-foreground ml-1 truncate">
                  {preset.fontHeading.toUpperCase()} · {preset.galleryLayout}
                </span>
              </div>

              {/* Mini Visual Vibe Strip */}
              <div
                className="h-8 rounded-lg border px-2.5 flex items-center justify-between text-[11px] overflow-hidden"
                style={{
                  backgroundColor: preset.bgColor,
                  borderColor: isDark ? "#27272a" : "rgba(0, 0, 0, 0.08)",
                  color: isDark ? "#f4f4f5" : "#181e17",
                }}
              >
                <span className="font-medium truncate flex items-center gap-1">
                  <Sparkle size={10} style={{ color: preset.primaryColor }} />
                  <span>Preview Style</span>
                </span>
                <span
                  className="px-2 py-0.5 rounded-md text-[9px] font-semibold text-white shrink-0"
                  style={{ backgroundColor: preset.primaryColor }}
                >
                  CTA
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
