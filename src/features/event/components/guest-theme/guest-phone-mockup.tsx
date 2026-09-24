"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Camera,
  Heart,
  Images,
  Sparkle,
  UploadSimple,
} from "@phosphor-icons/react";
import type { CandidEvent } from "../../types/event";
import type { GuestThemeConfig } from "./guest-theme-types";
import { GUEST_THEME_PRESETS } from "./guest-theme-types";

type GuestPhoneMockupProps = {
  event: CandidEvent;
  config: GuestThemeConfig;
  className?: string;
};

const SAMPLE_GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80",
];

export function GuestPhoneMockup({
  event,
  config,
  className = "",
}: GuestPhoneMockupProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "gallery">("upload");

  const preset =
    GUEST_THEME_PRESETS.find((p) => p.id === config.presetId) ||
    GUEST_THEME_PRESETS[0];

  const displayTitle = config.eventTitleOverride.trim() || event.name;
  const coverImage = config.coverUrl || preset.sampleCoverUrl;
  const monogram = config.monogram.trim() || "CC";
  const displayCta = config.ctaText.trim() || "Share photos & videos";
  const welcomeText =
    config.welcomeMessage.trim() ||
    "Thank you for celebrating with us! Capture and share your candid moments.";

  const fontHeadingFamily =
    config.fontHeading === "serif"
      ? "var(--font-serif), Georgia, serif"
      : config.fontHeading === "classic"
        ? "Georgia, 'Times New Roman', serif"
        : config.fontHeading === "mono"
          ? "ui-monospace, SFMono-Regular, monospace"
          : "var(--font-sans), sans-serif";

  const fontBodyFamily =
    config.fontBody === "serif"
      ? "var(--font-serif), Georgia, serif"
      : config.fontBody === "classic"
        ? "Georgia, 'Times New Roman', serif"
        : "var(--font-sans), sans-serif";

  const isDarkBg =
    config.bgColor === "#09090b" ||
    config.bgColor.toLowerCase().includes("09090b");
  const textColor = isDarkBg ? "#f4f4f5" : "#181e17";
  const mutedTextColor = isDarkBg ? "#a1a1aa" : "#606458";
  const borderColor = isDarkBg ? "#27272a" : "rgba(0, 0, 0, 0.08)";

  return (
    <div
      className={`guest-phone-mockup relative mx-auto w-[320px] sm:w-[350px] select-none ${className}`}
      style={{
        ["--guest-primary" as string]: config.primaryColor,
        ["--guest-bg" as string]: config.bgColor,
        ["--guest-surface" as string]: config.surfaceColor,
      }}
    >
      {/* Realistic Phone Bezel */}
      <div className="relative rounded-[48px] p-3 bg-neutral-900 border-4 border-neutral-700/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]">
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-between px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
          <div className="w-2 h-2 rounded-full bg-neutral-900 ring-1 ring-neutral-700" />
        </div>

        {/* Screen Viewport */}
        <div
          className="relative rounded-[38px] overflow-hidden flex flex-col h-[620px] transition-colors duration-300"
          style={{
            backgroundColor: config.bgColor,
            color: textColor,
            fontFamily: fontBodyFamily,
          }}
        >
          {/* Status Bar */}
          <div
            className="h-10 shrink-0 flex items-center justify-between px-7 pt-2 text-[11px] font-semibold tracking-tight z-20"
            style={{ color: mutedTextColor }}
          >
            <span>9:41</span>
            <div className="flex items-center gap-1.5 opacity-80">
              <span className="text-[10px]">5G</span>
              <div className="w-5 h-2.5 rounded-xs border border-current p-0.5 flex items-center">
                <div className="w-full h-full bg-current rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Scrollable Guest Page Body */}
          <div className="flex-1 overflow-y-auto px-4 pb-6 pt-1 space-y-4 scrollbar-thin">
            {/* Header Hero Branding */}
            <div className="text-center space-y-3 pt-2">
              {/* Hero Banner Style */}
              {config.heroStyle === "banner" && coverImage && (
                <div className="relative w-full h-32 rounded-2xl overflow-hidden shadow-xs border border-black/5">
                  <Image
                    src={coverImage}
                    alt={displayTitle}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3 text-left">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/90 text-neutral-900 backdrop-blur-xs">
                      <Sparkle size={10} weight="fill" />
                      <span>{event.event_type}</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Avatar Style */}
              {config.heroStyle === "avatar" && (
                <div className="flex justify-center pt-1">
                  <div
                    className="relative w-20 h-20 rounded-full p-1 shadow-md transition-transform"
                    style={{
                      backgroundColor: config.primaryColor,
                    }}
                  >
                    <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/80 bg-neutral-200">
                      {coverImage ? (
                        <Image
                          src={coverImage}
                          alt={displayTitle}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center font-bold text-lg"
                          style={{
                            backgroundColor: config.bgColor,
                            color: config.primaryColor,
                            fontFamily: fontHeadingFamily,
                          }}
                        >
                          {monogram}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Monogram Crest Style */}
              {config.heroStyle === "monogram" && (
                <div className="flex justify-center pt-1">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shadow-xs border transition-all"
                    style={{
                      borderColor,
                      backgroundColor: config.surfaceColor,
                      color: config.primaryColor,
                      fontFamily: fontHeadingFamily,
                    }}
                  >
                    {monogram}
                  </div>
                </div>
              )}

              {/* Titles & Type Badge */}
              <div className="space-y-1">
                {config.heroStyle !== "banner" && (
                  <div className="flex items-center justify-center gap-1 text-[10px] tracking-wider uppercase font-semibold opacity-70">
                    <Sparkle size={10} weight="fill" />
                    <span>{event.event_type}</span>
                  </div>
                )}
                <h2
                  className="text-xl sm:text-2xl font-semibold tracking-tight leading-tight px-2"
                  style={{ fontFamily: fontHeadingFamily }}
                >
                  {displayTitle}
                </h2>
                <p className="text-[11px] opacity-75">
                  {event.event_date
                    ? new Date(event.event_date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Special Event"}
                </p>
              </div>

              {/* Welcome Message Card */}
              {welcomeText && (
                <div
                  className="p-3 rounded-xl text-xs leading-relaxed text-center border shadow-xs"
                  style={{
                    backgroundColor: config.surfaceColor,
                    borderColor,
                    color: textColor,
                  }}
                >
                  <p className="opacity-90 italic text-[11px]">
                    &ldquo;{welcomeText}&rdquo;
                  </p>
                </div>
              )}

              {/* Photo Prompts Chips */}
              {config.photoPrompts && config.photoPrompts.length > 0 && (
                <div className="space-y-1.5 pt-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60">
                    Photo missions
                  </span>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {config.photoPrompts.map((prompt, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border shadow-2xs backdrop-blur-xs"
                        style={{
                          backgroundColor: `${config.primaryColor}15`,
                          borderColor: `${config.primaryColor}30`,
                          color: config.primaryColor,
                        }}
                      >
                        <Sparkle size={9} weight="fill" />
                        <span>{prompt}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Tabs (Upload vs Memories) */}
            <div
              className="flex items-center p-1 rounded-xl border text-xs font-medium"
              style={{
                backgroundColor: config.surfaceColor,
                borderColor,
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                  activeTab === "upload"
                    ? "shadow-xs font-semibold"
                    : "opacity-60 hover:opacity-100"
                }`}
                style={
                  activeTab === "upload"
                    ? {
                        backgroundColor: config.primaryColor,
                        color: "#ffffff",
                      }
                    : { color: textColor }
                }
              >
                <UploadSimple size={13} weight="bold" />
                <span>Upload</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("gallery")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                  activeTab === "gallery"
                    ? "shadow-xs font-semibold"
                    : "opacity-60 hover:opacity-100"
                }`}
                style={
                  activeTab === "gallery"
                    ? {
                        backgroundColor: config.primaryColor,
                        color: "#ffffff",
                      }
                    : { color: textColor }
                }
              >
                <Images size={13} weight="bold" />
                <span>Gallery (4)</span>
              </button>
            </div>

            {/* Tab 1: Upload Experience Preview */}
            {activeTab === "upload" && (
              <div className="space-y-3 pt-1">
                {/* Primary CTA Button */}
                <button
                  type="button"
                  className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <UploadSimple size={15} weight="bold" />
                  <span className="truncate">{displayCta}</span>
                </button>

                {/* Candid Camera Feature Button */}
                <button
                  type="button"
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-medium border flex items-center justify-between transition-colors shadow-2xs"
                  style={{
                    backgroundColor: config.surfaceColor,
                    borderColor,
                    color: textColor,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      <Camera size={14} weight="bold" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-[11px]">
                        Candid Camera
                      </div>
                      <div className="text-[9px] opacity-60">
                        Frame: {config.cameraFrame}
                      </div>
                    </div>
                  </div>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold text-white"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    Snap
                  </span>
                </button>

                {/* Dropzone Skeleton */}
                <div
                  className="border-2 border-dashed rounded-xl p-4 text-center space-y-1.5"
                  style={{ borderColor }}
                >
                  <UploadSimple
                    size={22}
                    className="mx-auto opacity-50"
                    style={{ color: config.primaryColor }}
                  />
                  <p className="text-[11px] font-medium opacity-80">
                    Tap or drag photos here
                  </p>
                  <p className="text-[9px] opacity-50">
                    High quality · No account needed
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Gallery Experience Preview */}
            {activeTab === "gallery" && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] px-1 opacity-70">
                  <span>Layout: {config.galleryLayout}</span>
                  <span className="flex items-center gap-1">
                    <Heart size={11} weight="fill" className="text-rose-500" />
                    <span>Live</span>
                  </span>
                </div>

                {/* Grid vs Masonry Simulation */}
                <div
                  className={`grid gap-2 ${
                    config.galleryLayout === "masonry"
                      ? "grid-cols-2"
                      : "grid-cols-2"
                  }`}
                >
                  {SAMPLE_GALLERY_IMAGES.map((imgUrl, idx) => (
                    <div
                      key={imgUrl}
                      className={`relative rounded-xl overflow-hidden border shadow-2xs group ${
                        config.galleryLayout === "masonry" && idx % 2 === 1
                          ? "h-36"
                          : "h-28"
                      }`}
                      style={{ borderColor }}
                    >
                      <Image
                        src={imgUrl}
                        alt="Memory preview"
                        fill
                        unoptimized
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute bottom-1 right-1.5 bg-black/60 backdrop-blur-xs text-white text-[8px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Heart size={8} weight="fill" />
                        <span>{idx + 2}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Home Indicator */}
          <div className="h-4 shrink-0 flex items-center justify-center pb-1">
            <div
              className="w-28 h-1 rounded-full opacity-30"
              style={{ backgroundColor: textColor }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
