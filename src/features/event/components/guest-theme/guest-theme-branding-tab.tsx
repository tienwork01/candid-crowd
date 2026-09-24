"use client";

import { useRef, useState } from "react";
import { Check, Sparkle, Trash, UploadSimple } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { CandidEvent } from "../../types/event";
import type { GuestThemeConfig } from "./guest-theme-types";
import { generateDefaultMonogram } from "../../lib/guest-theme-storage";
import { Button, Input, Label } from "@/components/ui";

type GuestThemeBrandingTabProps = {
  event: CandidEvent;
  config: GuestThemeConfig;
  onChange: (updated: Partial<GuestThemeConfig>) => void;
};

const COLOR_SWATCHES = [
  { label: "Classic Charcoal", hex: "#181e17" },
  { label: "Botanical Olive", hex: "#2d4a3e" },
  { label: "Romantic Wine", hex: "#881337" },
  { label: "Electric Indigo", hex: "#312e81" },
  { label: "Analog Amber", hex: "#c2410c" },
  { label: "Heritage Earth", hex: "#3f2b1d" },
  { label: "Champagne Gold", hex: "#d4af37" },
  { label: "Deep Slate", hex: "#0f172a" },
];

const BACKGROUND_SWATCHES = [
  { label: "Warm Ivory", hex: "#fdfbf7", surface: "#ffffff" },
  { label: "Crisp White", hex: "#ffffff", surface: "#f8fafc" },
  { label: "Soft Petal", hex: "#fff1f2", surface: "#ffffff" },
  { label: "Sage Wash", hex: "#f4f6f0", surface: "#ffffff" },
  { label: "Antique Paper", hex: "#f7f4ea", surface: "#ffffff" },
  { label: "Warm Grain", hex: "#faf6ee", surface: "#fffdf8" },
  { label: "Midnight Dark", hex: "#09090b", surface: "#18181b" },
];

const SAMPLE_COVERS = [
  {
    label: "Wedding Sunset",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Garden Party",
    url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Retro Film",
    url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Classic Black Tie",
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
  },
];

export function GuestThemeBrandingTab({
  event,
  config,
  onChange,
}: GuestThemeBrandingTabProps) {
  const t = useTranslations("event");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingImg, setIsProcessingImg] = useState(false);

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPEG, PNG, WebP)");

      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error("Image file should be smaller than 25 MB");

      return;
    }

    setIsProcessingImg(true);

    try {
      let targetFile = file;

      try {
        const { default: imageCompression } =
          await import("browser-image-compression");

        targetFile = await imageCompression(file, {
          maxSizeMB: 0.35,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
          fileType: "image/jpeg",
        });
      } catch {
        // Fall back to original file if compression worker is unavailable
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;

        onChange({ coverUrl: dataUrl });
        setIsProcessingImg(false);
        toast.success("Cover photo updated & optimized!");
      };

      reader.onerror = () => {
        setIsProcessingImg(false);
        toast.error("Failed to read image file");
      };

      reader.readAsDataURL(targetFile);
    } catch {
      setIsProcessingImg(false);
      toast.error("Failed to process image file");
    }
  };

  const handleAutoMonogram = () => {
    const mono = generateDefaultMonogram(
      config.eventTitleOverride || event.name,
    );

    onChange({ monogram: mono });
    toast.success(`Monogram set to "${mono}"`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Hero Presentation Style */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-ink">
          {t("guestTheme.brandingHero")}
        </Label>
        <p className="text-[11px] text-muted-foreground">
          {t("guestTheme.brandingHeroSubtitle")}
        </p>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {(
            [
              {
                id: "banner",
                label: t("guestTheme.heroWideBanner"),
                sub: t("guestTheme.heroWideBannerSub"),
              },
              {
                id: "avatar",
                label: t("guestTheme.heroAvatar"),
                sub: t("guestTheme.heroAvatarSub"),
              },
              {
                id: "monogram",
                label: t("guestTheme.heroMonogram"),
                sub: t("guestTheme.heroMonogramSub"),
              },
            ] as const
          ).map((item) => {
            const isSelected = config.heroStyle === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange({ heroStyle: item.id })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-line/70 hover:border-line bg-surface/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-ink">
                    {item.label}
                  </span>
                  {isSelected && (
                    <Check
                      size={12}
                      weight="bold"
                      className="text-primary shrink-0"
                    />
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {item.sub}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Cover Photo Section (Visible for Banner & Avatar) */}
      <div className="space-y-3 pt-3 border-t border-line/60">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs font-semibold text-ink">
              {t("guestTheme.coverPhoto")}
            </Label>
            <p className="text-[11px] text-muted-foreground">
              {t("guestTheme.coverPhotoSubtitle")}
            </p>
          </div>
          {config.coverUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange({ coverUrl: null })}
              className="h-7 px-2 text-[11px] text-red-600 hover:text-red-700 hover:bg-red-500/10 gap-1"
            >
              <Trash size={12} />
              <span>{t("guestTheme.remove")}</span>
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessingImg}
            className="h-8 text-xs font-medium inline-flex items-center gap-1.5"
          >
            <UploadSimple size={14} />
            <span>
              {isProcessingImg ? "Processing..." : t("guestTheme.uploadDevice")}
            </span>
          </Button>

          {/* Sample photos selector */}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>{t("guestTheme.orSample")}</span>
            {SAMPLE_COVERS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => onChange({ coverUrl: sample.url })}
                className="px-2 py-0.5 rounded-md border border-line text-[10px] hover:border-primary hover:text-primary transition-colors bg-surface"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Event Monogram & Display Name Override */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-line/60">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="monogram-input" className="text-xs font-semibold">
              {t("guestTheme.monogramTitle")}
            </Label>
            <button
              type="button"
              onClick={handleAutoMonogram}
              className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5"
            >
              <Sparkle size={10} weight="fill" />
              <span>{t("guestTheme.autoMonogram")}</span>
            </button>
          </div>
          <Input
            id="monogram-input"
            value={config.monogram}
            onChange={(e) =>
              onChange({ monogram: e.target.value.slice(0, 10) })
            }
            placeholder="e.g. T & C"
            maxLength={10}
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="title-override" className="text-xs font-semibold">
            {t("guestTheme.titleOverride")}
          </Label>
          <Input
            id="title-override"
            value={config.eventTitleOverride}
            onChange={(e) => onChange({ eventTitleOverride: e.target.value })}
            placeholder={event.name}
            className="h-8 text-xs"
          />
        </div>
      </div>

      {/* 4. Primary Accent Color */}
      <div className="space-y-2 pt-3 border-t border-line/60">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-ink">
            {t("guestTheme.colorAccent")}
          </Label>
          <span className="text-[11px] font-mono text-muted-foreground">
            {config.primaryColor}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch.hex}
              type="button"
              onClick={() => onChange({ primaryColor: swatch.hex })}
              title={swatch.label}
              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                config.primaryColor.toLowerCase() === swatch.hex.toLowerCase()
                  ? "ring-2 ring-primary ring-offset-2 scale-105"
                  : "border-black/15 hover:scale-105"
              }`}
              style={{ backgroundColor: swatch.hex }}
            >
              {config.primaryColor.toLowerCase() ===
                swatch.hex.toLowerCase() && (
                <Check size={13} weight="bold" className="text-white" />
              )}
            </button>
          ))}
          {/* Custom color input */}
          <label className="relative w-7 h-7 rounded-lg border border-line flex items-center justify-center cursor-pointer overflow-hidden bg-surface hover:border-primary">
            <input
              type="color"
              value={config.primaryColor}
              onChange={(e) => onChange({ primaryColor: e.target.value })}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <span className="text-[10px] font-bold text-muted-foreground">
              +
            </span>
          </label>
        </div>
      </div>

      {/* 5. Background Tone */}
      <div className="space-y-2 pt-3 border-t border-line/60">
        <Label className="text-xs font-semibold text-ink">
          {t("guestTheme.surfaceTone")}
        </Label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BACKGROUND_SWATCHES.map((swatch) => {
            const isSelected =
              config.bgColor.toLowerCase() === swatch.hex.toLowerCase();

            return (
              <button
                key={swatch.hex}
                type="button"
                onClick={() =>
                  onChange({
                    bgColor: swatch.hex,
                    surfaceColor: swatch.surface,
                  })
                }
                className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                  isSelected
                    ? "border-primary ring-1 ring-primary bg-surface"
                    : "border-line/70 hover:border-line bg-surface/40"
                }`}
              >
                <span
                  className="w-4 h-4 rounded-md border border-black/10 shrink-0"
                  style={{ backgroundColor: swatch.hex }}
                />
                <span className="text-[11px] font-medium text-ink truncate">
                  {swatch.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Typography Pairing */}
      <div className="space-y-2 pt-3 border-t border-line/60">
        <Label className="text-xs font-semibold text-ink">
          {t("guestTheme.typography")}
        </Label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(
            [
              {
                id: "serif",
                label: "Editorial Serif",
                fontFamily: "var(--font-serif), Georgia, serif",
                sub: "Romantic & Elegant",
              },
              {
                id: "sans",
                label: "Modern Sans",
                fontFamily: "var(--font-sans), sans-serif",
                sub: "Clean & Contemporary",
              },
              {
                id: "classic",
                label: "Classic Book",
                fontFamily: "Georgia, serif",
                sub: "Heritage & Formal",
              },
              {
                id: "mono",
                label: "Retro Film",
                fontFamily: "ui-monospace, monospace",
                sub: "Analog Typewriter",
              },
            ] as const
          ).map((item) => {
            const isSelected = config.fontHeading === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  onChange({
                    fontHeading: item.id,
                    fontBody:
                      item.id === "mono"
                        ? "sans"
                        : item.id === "classic"
                          ? "classic"
                          : item.id,
                  })
                }
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-line/70 hover:border-line bg-surface/40"
                }`}
              >
                <div
                  className="text-xs font-semibold text-ink mb-0.5 truncate"
                  style={{ fontFamily: item.fontFamily }}
                >
                  Aa {item.label}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {item.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
