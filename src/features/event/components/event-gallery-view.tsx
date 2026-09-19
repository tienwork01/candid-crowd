"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  DownloadSimple,
  Eye,
  EyeSlash,
  Heart,
  Images,
  MagnifyingGlassPlus,
  Trash,
  VideoCamera,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { EventMediaItem } from "../types/event";
import { Button } from "@/components/ui";

type FilterType = "all" | "photos" | "videos" | "hidden";

type EventGalleryViewProps = {
  items: EventMediaItem[];
  onOpenLightbox: (item: EventMediaItem) => void;
  onToggleStatus: (id: string) => void;
  onDeleteMedia: (id: string) => void;
};

export function EventGalleryView({
  items,
  onOpenLightbox,
  onToggleStatus,
  onDeleteMedia,
}: EventGalleryViewProps) {
  const t = useTranslations("event");
  const [filter, setFilter] = useState<FilterType>("all");

  const hiddenCount = useMemo(
    () => items.filter((i) => i.status === "hidden").length,
    [items],
  );

  const filteredItems = useMemo(() => {
    switch (filter) {
      case "photos":
        return items.filter((i) => !i.is_video && i.status !== "hidden");
      case "videos":
        return items.filter((i) => i.is_video && i.status !== "hidden");
      case "hidden":
        return items.filter((i) => i.status === "hidden");
      case "all":
      default:
        return items.filter((i) => i.status !== "hidden");
    }
  }, [items, filter]);

  const handleDownloadAll = () => {
    if (items.length === 0) return;
    toast.success(t("gallery.downloadAll", { count: items.length }));
  };

  return (
    <section className="event-gallery" aria-labelledby="gallery-heading">
      <h2 id="gallery-heading" className="sr-only">
        {t("hub.tabGallery")}
      </h2>

      {/* Gallery Filter & Batch Toolbar */}
      <div className="event-gallery__toolbar">
        <div
          className="event-gallery__filters"
          role="tablist"
          aria-label="Media filter"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filter === "all"}
            onClick={() => setFilter("all")}
            className={`event-gallery__filter-btn ${
              filter === "all" ? "event-gallery__filter-btn--active" : ""
            }`}
          >
            <span>{t("gallery.filterAll")}</span>
            <span className="ml-1 opacity-75">
              ({items.filter((i) => i.status !== "hidden").length})
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter === "photos"}
            onClick={() => setFilter("photos")}
            className={`event-gallery__filter-btn ${
              filter === "photos" ? "event-gallery__filter-btn--active" : ""
            }`}
          >
            <span>{t("gallery.filterPhotos")}</span>
            <span className="ml-1 opacity-75">
              (
              {items.filter((i) => !i.is_video && i.status !== "hidden").length}
              )
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter === "videos"}
            onClick={() => setFilter("videos")}
            className={`event-gallery__filter-btn ${
              filter === "videos" ? "event-gallery__filter-btn--active" : ""
            }`}
          >
            <span>{t("gallery.filterVideos")}</span>
            <span className="ml-1 opacity-75">
              ({items.filter((i) => i.is_video && i.status !== "hidden").length}
              )
            </span>
          </button>

          {hiddenCount > 0 && (
            <button
              type="button"
              role="tab"
              aria-selected={filter === "hidden"}
              onClick={() => setFilter("hidden")}
              className={`event-gallery__filter-btn ${
                filter === "hidden" ? "event-gallery__filter-btn--active" : ""
              }`}
            >
              <span>{t("gallery.filterHidden", { count: hiddenCount })}</span>
            </button>
          )}
        </div>

        <div className="event-gallery__actions">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadAll}
            className="text-xs h-9 gap-1.5"
            disabled={items.length === 0}
          >
            <DownloadSimple size={15} aria-hidden="true" />
            <span>{t("gallery.downloadAll", { count: items.length })}</span>
          </Button>
        </div>
      </div>

      {/* Media Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-surface border border-line rounded-2xl">
          <Images
            size={40}
            className="mx-auto text-subtle mb-3"
            aria-hidden="true"
          />
          <h3 className="font-heading text-lg text-ink">
            {t("gallery.emptyTitle")}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {t("gallery.emptyDesc")}
          </p>
        </div>
      ) : (
        <div className="event-gallery__grid">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className={`event-gallery__item ${
                item.status === "hidden" ? "event-gallery__item--hidden" : ""
              }`}
            >
              <div
                className="event-gallery__media-wrapper"
                onClick={() => onOpenLightbox(item)}
              >
                <Image
                  src={item.url}
                  alt={item.caption || "Event memory"}
                  fill
                  className="event-gallery__media"
                  sizes="(max-width: 640px) 50vw, (max-width: 960px) 33vw, 25vw"
                />

                {item.is_video && (
                  <span className="event-gallery__badge-corner">
                    <VideoCamera size={11} weight="fill" aria-hidden="true" />
                    <span>Video</span>
                  </span>
                )}

                {item.status === "featured" && (
                  <span className="event-gallery__badge-corner text-primary">
                    <span>{t("gallery.statusFeatured")}</span>
                  </span>
                )}
              </div>

              <div className="event-gallery__item-info">
                {item.caption && (
                  <p className="event-gallery__caption" title={item.caption}>
                    {item.caption}
                  </p>
                )}

                <div className="event-gallery__item-meta">
                  <span className="truncate">{item.guest_name || "Guest"}</span>

                  <div className="event-gallery__item-actions">
                    {Boolean(item.likes_count) && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground mr-1">
                        <Heart
                          size={12}
                          weight="fill"
                          className="text-rose-500"
                          aria-hidden="true"
                        />
                        <span>{item.likes_count}</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => onOpenLightbox(item)}
                      className="event-gallery__action-btn"
                      title="Inspect photo"
                      aria-label="Inspect photo"
                    >
                      <MagnifyingGlassPlus size={14} aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleStatus(item.id)}
                      className="event-gallery__action-btn"
                      title={
                        item.status === "hidden"
                          ? t("gallery.itemShow")
                          : t("gallery.itemHide")
                      }
                      aria-label={
                        item.status === "hidden"
                          ? t("gallery.itemShow")
                          : t("gallery.itemHide")
                      }
                    >
                      {item.status === "hidden" ? (
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
                      className="event-gallery__action-btn hover:text-destructive"
                      title={t("gallery.itemDelete")}
                      aria-label={t("gallery.itemDelete")}
                    >
                      <Trash size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
