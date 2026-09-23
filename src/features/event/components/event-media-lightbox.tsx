"use client";

import { useEffect, useId, useRef } from "react";
import Image from "next/image";
import {
  CaretLeft,
  CaretRight,
  DownloadSimple,
  Eye,
  EyeSlash,
  Heart,
  QrCode,
  User,
  VideoCamera,
  X,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import type { EventMediaItem } from "../types/event";
import { formatDate } from "@/i18n/format";
import type { AppLocale } from "@/i18n/locales";

type EventMediaLightboxProps = {
  item: EventMediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  onToggleStatus?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  currentIndex?: number;
  totalItems?: number;
  items?: EventMediaItem[];
  onSelectItem?: (index: number) => void;
};

export function EventMediaLightbox({
  item,
  isOpen,
  onClose,
  onNext,
  onPrev,
  hasPrev = false,
  hasNext = false,
  onToggleStatus,
  onToggleFavorite,
  currentIndex,
  totalItems,
  items,
  onSelectItem,
}: EventMediaLightboxProps) {
  const t = useTranslations("event");
  const locale = useLocale() as AppLocale;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const activeThumbRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const descriptionId = useId();

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (activeThumbRef.current) {
      activeThumbRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentIndex]);

  // Keyboard navigation & trap focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && hasPrev && onPrev) {
        onPrev();
      } else if (e.key === "ArrowRight" && hasNext && onNext) {
        onNext();
      } else if (e.key === "Tab") {
        const focusableElements =
          dialogRef.current?.querySelectorAll<HTMLElement>(
            "button:not([disabled]), a[href], video[controls]",
          );

        if (!focusableElements?.length) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, hasPrev, hasNext, onPrev, onNext, onClose]);

  // Lock body scroll and manage focus
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElement.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = originalOverflow;
      previouslyFocusedElement.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const formattedTime = formatDate(item.created_at, locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleDownload = () => {
    const link = document.createElement("a");

    link.href = item.url;
    link.download = `candid-memory-${item.id}.${item.is_video ? "mp4" : "jpg"}`;
    link.click();
  };

  const isFeatured = item.status === "featured";
  const isHidden = item.status === "hidden";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.caption || "Event media theater"}
      aria-describedby={descriptionId}
      className="event-lightbox event-lightbox--immersive"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="event-lightbox__theater"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Top Floating HUD ─── */}
        <header className="event-lightbox__hud">
          <div className="event-lightbox__hud-context">
            <span className="event-lightbox__type-badge">
              {item.is_video ? (
                <>
                  <VideoCamera size={13} weight="fill" aria-hidden="true" />
                  <span>Video</span>
                </>
              ) : (
                <span>Photo</span>
              )}
            </span>

            {typeof currentIndex === "number" && totalItems && (
              <span className="event-lightbox__counter">
                {currentIndex + 1} / {totalItems}
              </span>
            )}

            {isHidden && (
              <span className="event-lightbox__status-badge event-lightbox__status-badge--hidden">
                {t("gallery.statusHidden")}
              </span>
            )}

            {isFeatured && (
              <span className="event-lightbox__status-badge event-lightbox__status-badge--featured">
                <Heart size={11} weight="fill" aria-hidden="true" />
                <span>{t("gallery.statusFeatured")}</span>
              </span>
            )}
          </div>

          {/* Quick HUD Actions */}
          <div className="event-lightbox__hud-actions">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(item.id)}
                className={`event-lightbox__hud-btn ${
                  isFeatured ? "event-lightbox__hud-btn--featured" : ""
                }`}
                title={
                  isFeatured
                    ? t("gallery.itemUnfavorite")
                    : t("gallery.itemFavorite")
                }
                aria-label={
                  isFeatured
                    ? t("gallery.itemUnfavorite")
                    : t("gallery.itemFavorite")
                }
              >
                <Heart
                  size={18}
                  weight={isFeatured ? "fill" : "bold"}
                  className={isFeatured ? "text-rose-500" : "text-white"}
                  aria-hidden="true"
                />
              </button>
            )}

            {onToggleStatus && (
              <button
                type="button"
                onClick={() => onToggleStatus(item.id)}
                className="event-lightbox__hud-btn"
                title={isHidden ? t("gallery.itemShow") : t("gallery.itemHide")}
                aria-label={
                  isHidden ? t("gallery.itemShow") : t("gallery.itemHide")
                }
              >
                {isHidden ? (
                  <Eye size={18} aria-hidden="true" />
                ) : (
                  <EyeSlash size={18} aria-hidden="true" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="event-lightbox__hud-btn"
              title={t("gallery.itemDownload")}
              aria-label={t("gallery.itemDownload")}
            >
              <DownloadSimple size={18} aria-hidden="true" />
            </button>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="event-lightbox__hud-btn event-lightbox__hud-btn--close"
              aria-label="Close theater"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* ─── Main Media Stage ─── */}
        <div className="event-lightbox__stage">
          {item.is_video ? (
            <video
              src={item.url}
              controls
              playsInline
              autoPlay
              className="event-lightbox__video"
              preload="metadata"
            />
          ) : (
            <div className="event-lightbox__media-wrap">
              <Image
                src={item.url}
                alt={item.caption || "Event memory"}
                fill
                unoptimized
                className="object-contain"
                sizes="(max-width: 1200px) 100vw, 1200px"
                priority
              />
            </div>
          )}

          {/* Prev / Next Carets */}
          {hasPrev && onPrev && (
            <button
              type="button"
              onClick={onPrev}
              className="event-lightbox__nav event-lightbox__nav--previous"
              aria-label="Previous photo"
            >
              <CaretLeft size={24} weight="bold" aria-hidden="true" />
            </button>
          )}

          {hasNext && onNext && (
            <button
              type="button"
              onClick={onNext}
              className="event-lightbox__nav event-lightbox__nav--next"
              aria-label="Next photo"
            >
              <CaretRight size={24} weight="bold" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* ─── Bottom Footer & Metadata ─── */}
        <footer className="event-lightbox__bottom" id={descriptionId}>
          <div className="event-lightbox__info">
            {item.caption && (
              <p className="event-lightbox__caption">{item.caption}</p>
            )}

            <div className="event-lightbox__meta-tags">
              {item.guest_name && (
                <span className="event-lightbox__tag">
                  <User size={12} aria-hidden="true" />
                  <span>
                    {t("gallery.uploadedBy", { name: item.guest_name })}
                  </span>
                </span>
              )}
              {item.qr_source && (
                <span className="event-lightbox__tag">
                  <QrCode size={12} aria-hidden="true" />
                  <span>
                    {t("gallery.scannedAt", { source: item.qr_source })}
                  </span>
                </span>
              )}
              <span className="event-lightbox__tag-time">{formattedTime}</span>
            </div>
          </div>

          {/* Filmstrip Thumbnail Bar */}
          {items && items.length > 1 && onSelectItem && (
            <div
              className="event-lightbox__filmstrip"
              role="tablist"
              aria-label="Photo carousel"
            >
              {items.map((thumb, idx) => {
                const isActive = idx === currentIndex;

                return (
                  <button
                    key={thumb.id}
                    ref={isActive ? activeThumbRef : null}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onSelectItem(idx)}
                    className={`event-lightbox__filmstrip-item ${
                      isActive ? "event-lightbox__filmstrip-item--active" : ""
                    }`}
                    title={thumb.caption || `Photo ${idx + 1}`}
                    aria-label={`Photo ${idx + 1}`}
                  >
                    <Image
                      src={thumb.url}
                      alt={thumb.caption || ""}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                    {thumb.is_video && (
                      <span className="event-lightbox__filmstrip-video-icon">
                        <VideoCamera size={10} weight="fill" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
