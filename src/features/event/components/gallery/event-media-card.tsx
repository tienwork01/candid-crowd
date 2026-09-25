"use client";

import Image from "next/image";
import {
  Check,
  EyeSlash,
  Heart,
  Play,
  User,
  VideoCamera,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import type { EventMediaItem } from "../../types/event";
import type { GalleryLayoutMode } from "../../types/event-media";

type EventMediaCardProps = {
  item: EventMediaItem;
  layoutMode: GalleryLayoutMode;
  isSelected: boolean;
  isSelectMode: boolean;
  onToggleSelect: (id: string) => void;
  onOpenLightbox: (item: EventMediaItem) => void;
  onToggleStatus?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onDeleteMedia?: (id: string) => void;
};

export function EventMediaCard({
  item,
  layoutMode,
  isSelected,
  isSelectMode,
  onToggleSelect,
  onOpenLightbox,
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
  const isVideo = Boolean(item.is_video);
  const hasMeta = Boolean(item.guest_name || item.likes_count);

  return (
    <article
      className={`event-media-card ${
        isHidden ? "event-media-card--hidden" : ""
      } ${isFeatured ? "event-media-card--featured" : ""} ${
        isSelected ? "event-media-card--selected" : ""
      } ${isVideo ? "event-media-card--video" : ""}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={isVideo ? "Event video" : "Event photo"}
    >
      <div
        className={`event-media-card__media-box ${
          layoutMode === "grid" ? "event-media-card__media-box--square" : ""
        }`}
      >
        {/* Media Canvas (Image or Video Poster) */}
        {layoutMode === "grid" ? (
          <Image
            src={item.thumbnail_url || item.url}
            alt={item.caption || "Event memory"}
            fill
            className="event-media-card__img"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <Image
            src={item.thumbnail_url || item.url}
            alt={item.caption || "Event memory"}
            width={item.width || 600}
            height={item.height || 800}
            className="event-media-card__img-natural w-full h-auto"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Multi-stop Photographic Scrim Overlay on Hover */}
        <div className="event-media-card__scrim" aria-hidden="true" />

        {/* Persistent Status Badges (Top-Left) */}
        <div className="event-media-card__badges" aria-hidden="true">
          {isVideo && (
            <span className="event-media-card__badge event-media-card__badge--video">
              <VideoCamera size={12} weight="fill" />
              <span>Video</span>
            </span>
          )}

          {isFeatured && (
            <span className="event-media-card__badge event-media-card__badge--featured">
              <Heart size={11} weight="fill" />
              <span>{t("gallery.statusFeatured")}</span>
            </span>
          )}

          {isHidden && (
            <span className="event-media-card__badge event-media-card__badge--hidden">
              <EyeSlash size={11} weight="bold" />
              <span>{t("gallery.statusHidden")}</span>
            </span>
          )}
        </div>

        {/* Floating Center Play Affordance for Videos on Hover */}
        {isVideo && (
          <div className="event-media-card__play-center" aria-hidden="true">
            <div className="event-media-card__play-btn">
              <Play size={22} weight="fill" className="translate-x-0.5" />
            </div>
          </div>
        )}

        {/* Top-Right Selection Checkbox (Active only in Select Mode) */}
        {(isSelectMode || isSelected) && (
          <div
            className="event-media-card__top-bar"
            onClick={(e) => e.stopPropagation()}
          >
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
              {isSelected && <Check size={13} weight="bold" />}
            </button>
          </div>
        )}

        {/* Minimal Contributor / Likes Layer on Hover */}
        {hasMeta && (
          <div className="event-media-card__bottom-bar" aria-hidden="true">
            <div className="event-media-card__meta">
              {item.guest_name && (
                <span
                  className="event-media-card__contributor truncate"
                  title={t("gallery.uploadedBy", { name: item.guest_name })}
                >
                  <User size={11} weight="bold" aria-hidden="true" />
                  <span className="truncate">{item.guest_name}</span>
                </span>
              )}

              {Boolean(item.likes_count) && (
                <span className="event-media-card__likes">
                  <Heart
                    size={11}
                    weight="fill"
                    className="text-rose-400"
                    aria-hidden="true"
                  />
                  <span>{item.likes_count}</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
