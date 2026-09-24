"use client";

import {
  Camera,
  Check,
  GridFour,
  Images,
  SquareSplitHorizontal,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import type {
  GuestCameraFrame,
  GuestGalleryLayout,
  GuestThemeConfig,
} from "./guest-theme-types";
import { Label } from "@/components/ui";

type GuestThemeExperienceTabProps = {
  config: GuestThemeConfig;
  onChange: (updated: Partial<GuestThemeConfig>) => void;
};

export function GuestThemeExperienceTab({
  config,
  onChange,
}: GuestThemeExperienceTabProps) {
  const t = useTranslations("event");

  return (
    <div className="space-y-6">
      {/* 1. Gallery Layout Selection */}
      <div className="space-y-2.5">
        <div>
          <Label className="text-xs font-semibold text-ink flex items-center gap-1.5">
            <Images size={14} className="text-primary" />
            <span>{t("guestTheme.galleryLayout")}</span>
          </Label>
          <p className="text-[11px] text-muted-foreground">
            How shared guest photos are organized in the Memories tab.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          {(
            [
              {
                id: "masonry" as GuestGalleryLayout,
                label: t("guestTheme.galleryMasonry"),
                sub: "Staggered columns, honors portrait photos",
                icon: SquareSplitHorizontal,
              },
              {
                id: "grid" as GuestGalleryLayout,
                label: t("guestTheme.galleryGrid"),
                sub: "Uniform 2-column square tiles",
                icon: GridFour,
              },
            ] as const
          ).map((layout) => {
            const isSelected = config.galleryLayout === layout.id;
            const Icon = layout.icon;

            return (
              <button
                key={layout.id}
                type="button"
                onClick={() => onChange({ galleryLayout: layout.id })}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-line/70 hover:border-line bg-surface/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-surface border border-line flex items-center justify-center text-primary">
                    <Icon size={16} />
                  </div>
                  {isSelected && (
                    <Check size={13} weight="bold" className="text-primary" />
                  )}
                </div>
                <div className="text-xs font-semibold text-ink">
                  {layout.label}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                  {layout.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Candid Camera Frame Style */}
      <div className="space-y-2.5 pt-3 border-t border-line/60">
        <div>
          <Label className="text-xs font-semibold text-ink flex items-center gap-1.5">
            <Camera size={14} className="text-primary" />
            <span>{t("guestTheme.cameraFrame")}</span>
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Decorative photo frame applied when guests take photos using the
            in-app camera.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {(
            [
              {
                id: "35mm" as GuestCameraFrame,
                label: t("guestTheme.frame35mm"),
                sub: "Analog sprocket edges",
              },
              {
                id: "polaroid" as GuestCameraFrame,
                label: t("guestTheme.framePolaroid"),
                sub: "White border + date",
              },
              {
                id: "minimal" as GuestCameraFrame,
                label: t("guestTheme.frameMinimal"),
                sub: "Clean viewfinder corners",
              },
              {
                id: "gold" as GuestCameraFrame,
                label: t("guestTheme.frameGold"),
                sub: "Metallic luxury border",
              },
            ] as const
          ).map((frame) => {
            const isSelected = config.cameraFrame === frame.id;

            return (
              <button
                key={frame.id}
                type="button"
                onClick={() => onChange({ cameraFrame: frame.id })}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-line/70 hover:border-line bg-surface/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-ink">
                    {frame.label}
                  </span>
                  {isSelected && (
                    <Check size={11} weight="bold" className="text-primary" />
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight">
                  {frame.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
