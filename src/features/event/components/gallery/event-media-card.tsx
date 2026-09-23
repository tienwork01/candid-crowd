"use client";

import Image from "next/image";
import {
  Check,
  Eye,
  EyeSlash,
  Heart,
  MagnifyingGlassPlus,
  QrCode,
  Trash,
  VideoCamera,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import type { EventMediaItem } from "../../types/event";
import type { GalleryLayoutMode } from "../../hooks/use-event-media-gallery";

type EventMediaCardProps = {
  item: EventMediaItem;
  layoutMode: GalleryLayoutMode;
  isSelected: boolean;
  isSelectMode: boolean;
  onToggleSelect: (id: string) => void;
  onOpenLightbox: (item: EventMediaItem) => void;
  onToggleStatus: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onDeleteMedia: (id: string) => void;
};

export function EventMediaCard({
  item,
  layoutMode,
  isSelected,
  isSelectMode,
  onToggleSelect,
  onOpenLightbox,
  onToggleStatus,
  onToggleFavorite,
  onDeleteMedia,
}: EventMediaCardProps) {
  const t = useTranslations("event");

  const handleCardClick = () => {
    if (isSelectMode) {
      onToggleSelect(item.id);
    } else {
      onOpenLightbox(item);
    }
  };

  const isFeatured = item.status === "featured";
  const isHidden = item.status === "hidden";

  return (
    <article
      className={`event-media-card ${
        isHidden ? "event-media-card--hidden" : ""
      } ${isSelected ? "event-media-card--selected" : ""}`}
    >
      <div
        className={`event-media-card__media-box ${
          layoutMode === "grid" ? "event-media-card__media-box--square" : ""
        }`}
        onClick={handleCardClick}
      >
        {/* Media (Image or Video Thumbnail) */}
        {layoutMode === "grid" ? (
          <Image
            src={item.url}
            alt={item.caption || "Event memory"}
            fill
            className="event-media-card__img object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <Image
            src={item.url}
            alt={item.caption || "Event memory"}
            width={item.width || 600}
            height={item.height || 800}
            className="event-media-card__img-natural w-full h-auto"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Video Badge */}
        {item.is_video && (
          <span className="event-media-card__video-badge">
            <VideoCamera size={12} weight="fill" aria-hidden="true" />
            <span>Video</span>
          </span>
        )}

        {/* Scrim Overlay on Hover / Active */}
        <div className="event-media-card__scrim" aria-hidden="true" />

        {/* Top Header Overlay: Favorite & Select Checkbox */}
        <div
          className="event-media-card__top-bar"
          onClick={(e) => e.stopPropagation()}
        >
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(item.id)}
              className={`event-media-card__icon-btn ${
                isFeatured ? "event-media-card__icon-btn--featured" : ""
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
                size={16}
                weight={isFeatured ? "fill" : "bold"}
                className={isFeatured ? "text-rose-500" : "text-white"}
              />
            </button>
          )}

          {(isSelectMode || isSelected) && (
            <button
              type="button"
              onClick={() => onToggleSelect(item.id)}
              className={`event-media-card__checkbox ${
                isSelected ? "event-media-card__checkbox--checked" : ""
              }`}
              title={
                isSelected ? t("gallery.batchCancel") : t("gallery.batchSelect")
              }
              aria-label={
                isSelected ? t("gallery.batchCancel") : t("gallery.batchSelect")
              }
              aria-checked={isSelected}
              role="checkbox"
            >
              {isSelected && <Check size={12} weight="bold" />}
            </button>
          )}
        </div>

        {/* Bottom Metadata & Fast Actions Overlay */}
        <div
          className="event-media-card__bottom-bar"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="event-media-card__meta">
            {item.guest_name && (
              <span className="event-media-card__uploader truncate">
                {item.guest_name}
              </span>
            )}
            {item.qr_source && (
              <span className="event-media-card__source truncate">
                <QrCode size={11} aria-hidden="true" />
                <span>{item.qr_source}</span>
              </span>
            )}
            {Boolean(item.likes_count) && (
              <span className="event-media-card__likes">
                <Heart size={11} weight="fill" className="text-rose-400" />
                <span>{item.likes_count}</span>
              </span>
            )}
          </div>

          <div className="event-media-card__actions">
            <button
              type="button"
              onClick={() => onOpenLightbox(item)}
              className="event-media-card__action-btn"
              title={t("gallery.itemDownload")}
              aria-label={t("gallery.itemDownload")}
            >
              <MagnifyingGlassPlus size={14} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => onToggleStatus(item.id)}
              className="event-media-card__action-btn"
              title={isHidden ? t("gallery.itemShow") : t("gallery.itemHide")}
              aria-label={
                isHidden ? t("gallery.itemShow") : t("gallery.itemHide")
              }
            >
              {isHidden ? (
                <Eye size={14} aria-hidden="true" />
              ) : (
                <EyeSlash size={14} aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm(t("gallery.deleteConfirm"))) {
                  onDeleteMedia(item.id);
                }
              }}
              className="event-media-card__action-btn event-media-card__action-btn--delete"
              title={t("gallery.itemDelete")}
              aria-label={t("gallery.itemDelete")}
            >
              <Trash size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Caption if provided */}
      {item.caption && (
        <div className="event-media-card__caption-box">
          <p className="event-media-card__caption" title={item.caption}>
            {item.caption}
          </p>
        </div>
      )}
    </article>
  );
}
