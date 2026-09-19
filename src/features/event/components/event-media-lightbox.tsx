"use client";

import { useEffect } from "react";
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
}: EventMediaLightboxProps) {
  const t = useTranslations("event");
  const locale = useLocale() as AppLocale;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && hasPrev && onPrev) {
        onPrev();
      } else if (e.key === "ArrowRight" && hasNext && onNext) {
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, hasPrev, hasNext, onPrev, onNext, onClose]);

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
      className="event-lightbox"
      onClick={onClose}
    >
      <div
        className="event-lightbox__inner"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with close button */}
        <div className="flex items-center justify-between p-3.5 bg-surface border-b border-line">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {item.is_video ? "Video" : "Photo"}
            </span>
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
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-ink hover:bg-soft transition-colors"
            aria-label="Close lightbox"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Media display area */}
        <div className="event-lightbox__image-box relative">
          <Image
            src={item.url}
            alt={item.caption || "Event memory"}
            fill
            className="object-contain"
            sizes="(max-width: 900px) 100vw, 900px"
            priority
          />

          {/* Prev button */}
          {hasPrev && onPrev && (
            <button
              type="button"
              onClick={onPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/75 flex items-center justify-center transition-colors"
              aria-label="Previous photo"
            >
              <CaretLeft size={22} weight="bold" aria-hidden="true" />
            </button>
          )}

          {/* Next button */}
          {hasNext && onNext && (
            <button
              type="button"
              onClick={onNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/75 flex items-center justify-center transition-colors"
              aria-label="Next photo"
            >
              <CaretRight size={22} weight="bold" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Footer with caption, author, source, and actions */}
        <div className="event-lightbox__footer">
          <div>
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
