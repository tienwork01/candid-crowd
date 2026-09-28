"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  Camera,
  CaretRight,
  Images,
  Sparkle,
  UploadSimple,
} from "@phosphor-icons/react";
import type { CandidEvent } from "../../types/event";
import { getGuestThemeStyles, isGuestThemeDark } from "./guest-theme-styles";
import type { GuestThemeConfig } from "./guest-theme-types";
import "../guest-upload.css";

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

/** A constrained render which uses the production guest page classes and tokens. */
export function GuestPhoneMockup({
  event,
  config,
  className = "",
}: GuestPhoneMockupProps) {
  const t = useTranslations("event");
  const [activeTab, setActiveTab] = useState<"upload" | "gallery">("upload");
  const displayTitle = config.eventTitleOverride.trim() || event.name;
  const isDark = isGuestThemeDark(config);
  const formattedDate = event.event_date
    ? new Intl.DateTimeFormat(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(event.event_date))
    : "";

  return (
    <div className={`guest-phone-mockup ${className}`}>
      <div className="guest-phone-mockup__device">
        <div className="guest-phone-mockup__notch" aria-hidden="true" />
        <div className="guest-phone-mockup__screen">
          <div
            className={`guest-event-page guest-phone-mockup__page ${
              isDark ? "guest-event-page--dark" : ""
            }`}
            style={getGuestThemeStyles(config)}
          >
            <main className="guest-event__content">
              <header className="guest-event__header">
                {config.heroStyle === "banner" && (
                  <div className="guest-event__hero-banner">
                    {config.coverUrl ? (
                      <Image
                        src={config.coverUrl}
                        alt={displayTitle}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <span className="guest-event__hero-monogram">
                        {config.monogram ||
                          displayTitle.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <span
                      className="guest-event__hero-scrim"
                      aria-hidden="true"
                    />
                    <div className="guest-event__badge guest-event__badge--overlay">
                      <Sparkle size={12} weight="fill" aria-hidden="true" />
                      <span>{t(`types.${event.event_type}`)}</span>
                    </div>
                  </div>
                )}
                {config.heroStyle === "avatar" && (
                  <div className="guest-event__avatar-badge">
                    <div className="guest-event__avatar-inner">
                      {config.coverUrl ? (
                        <Image
                          src={config.coverUrl}
                          alt={displayTitle}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <span className="guest-phone-mockup__monogram">
                          {config.monogram || "CC"}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {config.heroStyle === "monogram" && config.monogram && (
                  <div className="guest-event__monogram-crest">
                    <span>{config.monogram}</span>
                  </div>
                )}
                {config.heroStyle !== "banner" && (
                  <div className="guest-event__badge">
                    <Sparkle size={12} weight="fill" className="text-primary" />
                    <span>{t(`types.${event.event_type}`)}</span>
                  </div>
                )}
                <h2 className="guest-event__title">{displayTitle}</h2>
                {formattedDate && (
                  <time className="guest-event__date">{formattedDate}</time>
                )}
                {config.welcomeMessage.trim() && (
                  <div className="guest-event__welcome-card">
                    &ldquo;{config.welcomeMessage.trim()}&rdquo;
                  </div>
                )}
                {config.photoPrompts && config.photoPrompts.length > 0 && (
                  <div className="guest-prompts">
                    <span className="guest-prompts__title">
                      <Sparkle size={12} weight="fill" aria-hidden="true" />
                      {t("guestTheme.photoMissionsTitle")}
                    </span>
                    <div className="guest-prompts__list">
                      {config.photoPrompts.map((prompt) => (
                        <span key={prompt} className="guest-prompts__chip">
                          <Sparkle
                            size={11}
                            weight="fill"
                            className="guest-prompts__sparkle"
                          />
                          {prompt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <p className="guest-event__trust-line">
                  {t("guest.noSignInNeeded")}
                </p>
              </header>

              <div className="guest-event__nav" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "upload"}
                  data-active={activeTab === "upload" ? "" : undefined}
                  className="guest-event__tab"
                  onClick={() => setActiveTab("upload")}
                >
                  <UploadSimple size={15} weight="bold" />
                  <span>{t("guest.tabShare")}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "gallery"}
                  data-active={activeTab === "gallery" ? "" : undefined}
                  className="guest-event__tab"
                  onClick={() => setActiveTab("gallery")}
                >
                  <Images size={15} weight="bold" />
                  <span>{t("guest.tabMemoriesCount", { count: 4 })}</span>
                </button>
                <span
                  className="guest-event__indicator"
                  style={{
                    ["--active-tab-width" as string]: "calc(50% - 4px)",
                    ["--active-tab-left" as string]:
                      activeTab === "upload" ? "4px" : "calc(50% + 0px)",
                  }}
                />
              </div>

              {activeTab === "upload" ? (
                <div className="guest-upload guest-event__panel">
                  <div className="guest-upload__picker-card">
                    <div className="guest-upload__actions-grid">
                      <button
                        type="button"
                        className="guest-upload__btn guest-upload__btn--primary guest-upload__btn--library"
                      >
                        <Images size={19} weight="bold" />
                        <span>
                          {config.ctaText.trim() || t("guest.selectFiles")}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="guest-upload__btn guest-upload__btn--secondary guest-upload__btn--camera"
                      >
                        <span className="guest-upload__camera-icon">
                          <Camera size={17} weight="bold" />
                        </span>
                        <span className="guest-upload__camera-copy">
                          <span>{t("camera.candidCameraBtn")}</span>
                          <span>{config.cameraFrame}</span>
                        </span>
                        <CaretRight
                          size={16}
                          weight="bold"
                          className="guest-upload__camera-arrow"
                        />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="guest-upload__dropzone-note"
                    >
                      <UploadSimple size={21} weight="bold" />
                      <span>{t("guest.dragDropHint")}</span>
                      <small>{t("guest.noSignInNeeded")}</small>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="guest-gallery guest-event__panel">
                  <div
                    className={`guest-gallery__grid ${config.galleryLayout === "grid" ? "guest-gallery__grid--balanced" : "guest-gallery__grid--masonry"}`}
                  >
                    {SAMPLE_GALLERY_IMAGES.map((src) => (
                      <div key={src} className="guest-gallery__item">
                        <Image
                          src={src}
                          alt=""
                          fill
                          unoptimized
                          className="guest-gallery__img"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
