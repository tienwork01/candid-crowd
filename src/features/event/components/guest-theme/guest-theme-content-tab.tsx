"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ChatCircleText,
  CursorClick,
  Plus,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import type { GuestThemeConfig } from "./guest-theme-types";
import { Input, Label } from "@/components/ui";

type GuestThemeContentTabProps = {
  config: GuestThemeConfig;
  onChange: (updated: Partial<GuestThemeConfig>) => void;
};

const WELCOME_TEMPLATES = [
  {
    type: "Wedding",
    label: "Wedding Couple",
    text: "Thank you for celebrating with us! Please capture and share your favorite moments from our special day 💕",
  },
  {
    type: "Wedding (VN)",
    label: "Lễ Cưới (Tiếng Việt)",
    text: "Cảm ơn bạn đã đến chung vui cùng chúng mình! Hãy chụp và gửi thật nhiều ảnh đẹp vào album nhé 💕",
  },
  {
    type: "Birthday",
    label: "Birthday Celebration",
    text: "So happy you are here! Snap candid photos throughout the party and add them to our shared memory reel.",
  },
  {
    type: "Party",
    label: "Casual Gathering",
    text: "Welcome to the celebration! No filters needed—just share raw and candid moments as they happen.",
  },
  {
    type: "Corporate",
    label: "Company Event",
    text: "Welcome team! Please share your highlights, group photos, and memorable moments from today's gathering.",
  },
];

const CTA_SUGGESTIONS = [
  "Share photos & videos",
  "Gửi ảnh cho dâu rể 💕",
  "Góp ảnh vào album",
  "Add your memories",
  "Snap and upload",
  "Start capturing",
];

const POPULAR_PROMPT_SUGGESTIONS = [
  "Selfie with the couple",
  "Table cheers / Cụng ly",
  "Best dance move",
  "Favorite decor detail",
  "Funniest candid laugh",
];

export function GuestThemeContentTab({
  config,
  onChange,
}: GuestThemeContentTabProps) {
  const t = useTranslations("event");
  const [newPromptText, setNewPromptText] = useState("");
  const currentPrompts = config.photoPrompts || [];

  const handleAddPrompt = (text: string) => {
    const trimmed = text.trim();

    if (
      !trimmed ||
      currentPrompts.includes(trimmed) ||
      currentPrompts.length >= 3
    ) {
      return;
    }

    onChange({ photoPrompts: [...currentPrompts, trimmed] });
    setNewPromptText("");
  };

  const handleRemovePrompt = (index: number) => {
    onChange({
      photoPrompts: currentPrompts.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Welcome Note / Message */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <Label
              htmlFor="welcome-message"
              className="text-xs font-semibold text-ink flex items-center gap-1.5"
            >
              <ChatCircleText size={14} className="text-primary" />
              <span>{t("guestTheme.welcomeNote")}</span>
            </Label>
            <p className="text-[11px] text-muted-foreground">
              {t("guestTheme.welcomeNoteSub")}
            </p>
          </div>
        </div>

        <textarea
          id="welcome-message"
          rows={3}
          value={config.welcomeMessage}
          onChange={(e) => onChange({ welcomeMessage: e.target.value })}
          placeholder={t("guestTheme.welcomePlaceholder")}
          className="w-full text-xs rounded-xl border border-line bg-surface p-3 text-ink placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all leading-relaxed"
        />

        {/* Quick template suggestions */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
            <Sparkle size={10} weight="fill" className="text-primary" />
            <span>{t("guestTheme.oneClickTemplates")}</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {WELCOME_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.label}
                type="button"
                onClick={() => onChange({ welcomeMessage: tmpl.text })}
                className="px-2 py-1 rounded-md text-[10px] bg-soft border border-line/70 hover:border-primary hover:text-primary transition-colors text-ink text-left"
              >
                {tmpl.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. CTA Button Text */}
      <div className="space-y-2.5 pt-3 border-t border-line/60">
        <div>
          <Label
            htmlFor="cta-text"
            className="text-xs font-semibold text-ink flex items-center gap-1.5"
          >
            <CursorClick size={14} className="text-primary" />
            <span>{t("guestTheme.ctaText")}</span>
          </Label>
          <p className="text-[11px] text-muted-foreground">
            {t("guestTheme.ctaTextSub")}
          </p>
        </div>

        <Input
          id="cta-text"
          value={config.ctaText}
          onChange={(e) => onChange({ ctaText: e.target.value })}
          placeholder={t("guestTheme.ctaPlaceholder")}
          className="h-9 text-xs"
        />

        {/* CTA suggestions */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {CTA_SUGGESTIONS.map((sug) => (
            <button
              key={sug}
              type="button"
              onClick={() => onChange({ ctaText: sug })}
              className={`px-2 py-0.5 rounded-md text-[10px] border transition-colors ${
                config.ctaText === sug
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-line bg-surface hover:border-line-hover text-muted-foreground"
              }`}
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Photo Prompts / Missions (Participation Engine) */}
      <div className="space-y-3 pt-3 border-t border-line/60">
        <div>
          <Label className="text-xs font-semibold text-ink flex items-center gap-1.5">
            <Sparkle size={14} className="text-primary" />
            <span>{t("guestTheme.photoMissions")}</span>
          </Label>
          <p className="text-[11px] text-muted-foreground">
            {t("guestTheme.photoMissionsSub")}
          </p>
        </div>

        {/* Existing prompt chips */}
        <div className="space-y-2">
          {currentPrompts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentPrompts.map((prompt, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-ink"
                >
                  <span>✨ {prompt}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePrompt(idx)}
                    className="w-4 h-4 rounded-full flex items-center justify-center text-muted-foreground hover:text-ink hover:bg-black/10 transition-colors"
                    aria-label={`Remove prompt ${prompt}`}
                  >
                    <X size={10} weight="bold" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add custom prompt input */}
          {currentPrompts.length < 3 && (
            <div className="flex items-center gap-2">
              <Input
                value={newPromptText}
                onChange={(e) => setNewPromptText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddPrompt(newPromptText);
                  }
                }}
                placeholder={t("guestTheme.promptPlaceholder")}
                className="h-8 text-xs flex-1"
                maxLength={45}
              />
              <button
                type="button"
                onClick={() => handleAddPrompt(newPromptText)}
                disabled={!newPromptText.trim()}
                className="h-8 px-3 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1 shrink-0"
              >
                <Plus size={12} weight="bold" />
                <span>{t("guestTheme.addPrompt")}</span>
              </button>
            </div>
          )}

          {/* Quick inspiration suggestion buttons */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] text-muted-foreground">
              {t("guestTheme.quickSuggestions")}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_PROMPT_SUGGESTIONS.map((sug) => {
                const isAdded = currentPrompts.includes(sug);

                return (
                  <button
                    key={sug}
                    type="button"
                    disabled={isAdded || currentPrompts.length >= 3}
                    onClick={() => handleAddPrompt(sug)}
                    className={`px-2 py-0.5 rounded-md text-[10px] border transition-colors ${
                      isAdded
                        ? "border-transparent bg-muted/40 text-muted-foreground line-through cursor-not-allowed"
                        : "border-line bg-surface hover:border-primary hover:text-primary text-muted-foreground"
                    }`}
                  >
                    + {sug}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
