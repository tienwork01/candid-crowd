"use client";

import { useEffect, useId, useRef } from "react";
import Image from "next/image";
import {
  CaretLeft,
  CaretRight,
  DownloadSimple,
  Eye,
  EyeSlash,
  QrCode,
  User,
  X,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import type { EventMediaItem } from "../types/event";
import { formatDate } from "@/i18n/format";
import type { AppLocale } from "@/i18n/locales";
import { Button } from "@/components/ui";

type EventMediaLightboxProps = {
  item: EventMediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  onToggleStatus?: (id: string) => void;
  currentIndex?: number;
  totalItems?: number;
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
  currentIndex,
  totalItems,
}: EventMediaLightboxProps) {
  const t = useTranslations("event");
  const locale = useLocale() as AppLocale;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const descriptionId = useId();

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
    link.download = `candid-memory-${item.id}.jpg`;
    link.click();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.caption || "Event photo lightbox"}
      aria-describedby={descriptionId}
      className="event-lightbox"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="event-lightbox__inner"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="event-lightbox__topbar">
          <div className="event-lightbox__context">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {item.is_video ? "Video" : "Photo"}
            </span>
            {typeof currentIndex === "number" && totalItems && (
              <span
                className="event-lightbox__counter"
                aria-label={t("guest.tabMemoriesCount", { count: totalItems })}
              >
                {currentIndex + 1} / {totalItems}
              </span>
            )}
            {item.status === "hidden" && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-destructive/15 text-destructive">
                {t("gallery.statusHidden")}
              </span>
            )}
            {item.status === "featured" && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                {t("gallery.statusFeatured")}
              </span>
            )}
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="event-lightbox__close"
            aria-label="Close lightbox"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="event-lightbox__image-box">
          {item.is_video ? (
            <video
              src={item.url}
              controls
              playsInline
              className="h-full w-full object-contain"
              preload="metadata"
            />
          ) : (
            <Image
              src={item.url}
              alt={item.caption || "Event memory"}
              fill
              unoptimized
              className="object-contain"
              sizes="(max-width: 900px) 100vw, 900px"
              priority
            />
          )}

          {hasPrev && onPrev && (
            <button
              type="button"
              onClick={onPrev}
              className="event-lightbox__nav event-lightbox__nav--previous"
              aria-label="Previous photo"
            >
              <CaretLeft size={22} weight="bold" aria-hidden="true" />
            </button>
          )}

          {hasNext && onNext && (
            <button
              type="button"
              onClick={onNext}
              className="event-lightbox__nav event-lightbox__nav--next"
              aria-label="Next photo"
            >
              <CaretRight size={22} weight="bold" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="event-lightbox__footer" id={descriptionId}>
          <div className="event-lightbox__details">
            {item.caption && (
              <p className="font-heading text-base font-semibold text-ink">
                {item.caption}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
              {item.guest_name && (
                <span className="inline-flex items-center gap-1">
                  <User size={13} aria-hidden="true" />
                  <span>
                    {t("gallery.uploadedBy", { name: item.guest_name })}
                  </span>
                </span>
              )}
              {item.qr_source && (
                <span className="inline-flex items-center gap-1">
                  <QrCode size={13} aria-hidden="true" />
                  <span>
                    {t("gallery.scannedAt", { source: item.qr_source })}
                  </span>
                </span>
              )}
              <span>{formattedTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onToggleStatus && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onToggleStatus(item.id)}
                className="text-xs h-9 gap-1.5"
              >
                {item.status === "hidden" ? (
                  <>
                    <Eye size={15} aria-hidden="true" />
                    <span>{t("gallery.itemShow")}</span>
                  </>
                ) : (
                  <>
                    <EyeSlash size={15} aria-hidden="true" />
                    <span>{t("gallery.itemHide")}</span>
                  </>
                )}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="text-xs h-9 gap-1.5"
              title={t("gallery.itemDownload")}
            >
              <DownloadSimple size={15} aria-hidden="true" />
              <span>{t("gallery.itemDownload")}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
