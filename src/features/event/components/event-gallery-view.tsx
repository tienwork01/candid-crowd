"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowsClockwise,
  ArrowsDownUp,
  Camera,
  DownloadSimple,
  Eye,
  EyeSlash,
  Funnel,
  Heart,
  MagnifyingGlassPlus,
  Printer,
  QrCode,
  Sparkle,
  Trash,
  VideoCamera,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { EventMediaItem } from "../types/event";
import {
  Button,
  buttonVariants,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";

type FilterType = "all" | "photos" | "videos" | "favorites" | "hidden";
type SortType = "newest" | "oldest";

type EventGalleryViewProps = {
  items: EventMediaItem[];
  onOpenLightbox: (item: EventMediaItem) => void;
  onToggleStatus: (id: string) => void;
  onDeleteMedia: (id: string) => void;
  guestUrl?: string;
  onOpenShare?: () => void;
  onOpenPrint?: () => void;
  eventName?: string;
  publicCode?: string;
};

export function EventGalleryView({
  items,
  onOpenLightbox,
  onToggleStatus,
  onDeleteMedia,
  guestUrl,
  onOpenShare,
  onOpenPrint,
  eventName,
  publicCode,
}: EventGalleryViewProps) {
  const t = useTranslations("event");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("newest");
  const [emptyQrUrl, setEmptyQrUrl] = useState<string>("");

  // Dynamically generate real scannable event QR code for empty state showcase
  useEffect(() => {
    if (items.length > 0) return;

    let active = true;
    const qrTargetUrl = publicCode
      ? `https://candidcrowd.life/e/${publicCode}`
      : guestUrl || "";

    if (!qrTargetUrl) return;

    void import("qrcode")
      .then((qr) =>
        qr.toDataURL(qrTargetUrl, {
          width: 360,
          margin: 1.5,
          color: { dark: "#181e17", light: "#ffffff" },
          errorCorrectionLevel: "H",
        }),
      )
      .then((url) => {
        if (active) setEmptyQrUrl(url);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [items.length, publicCode, guestUrl]);

  const hiddenCount = useMemo(
    () => items.filter((i) => i.status === "hidden").length,
    [items],
  );

  const favoritesCount = useMemo(
    () => items.filter((i) => i.status === "featured").length,
    [items],
  );

  const filteredItems = useMemo(() => {
    let result: EventMediaItem[];

    switch (filter) {
      case "photos":
        result = items.filter((i) => !i.is_video && i.status !== "hidden");
        break;
      case "videos":
        result = items.filter((i) => i.is_video && i.status !== "hidden");
        break;
      case "favorites":
        result = items.filter((i) => i.status === "featured");
        break;
      case "hidden":
        result = items.filter((i) => i.status === "hidden");
        break;
      case "all":
      default:
        result = items.filter((i) => i.status !== "hidden");
    }

    // Apply sort
    return [...result].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();

      return sort === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [items, filter, sort]);

  const handleDownloadAll = () => {
    if (items.length === 0) return;
    toast.success(t("gallery.downloadAll", { count: items.length }));
  };

  return (
    <section className="event-gallery" aria-labelledby="gallery-heading">
      <h2 id="gallery-heading" className="sr-only">
        {t("hub.tabMemories")}
      </h2>

      {/* Gallery Filter & Batch Toolbar */}
      <div className="event-gallery__toolbar">
        <div
          className="event-gallery__filters"
          role="tablist"
          aria-label={t("gallery.filterAll")}
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

          {favoritesCount > 0 && (
            <button
              type="button"
              role="tab"
              aria-selected={filter === "favorites"}
              onClick={() => setFilter("favorites")}
              className={`event-gallery__filter-btn ${
                filter === "favorites"
                  ? "event-gallery__filter-btn--active"
                  : ""
              }`}
            >
              <Heart size={12} weight="fill" aria-hidden="true" />
              <span>{t("gallery.filterFavorites")}</span>
            </button>
          )}

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
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="text-xs h-9 gap-1.5 text-muted-foreground inline-flex items-center px-3 rounded-md hover:bg-accent transition-colors">
              <ArrowsDownUp size={14} aria-hidden="true" />
              <span>{t("gallery.sortLabel")}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSort("newest")}>
                <span
                  className={sort === "newest" ? "font-semibold text-ink" : ""}
                >
                  {t("gallery.sortNewest")}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("oldest")}>
                <span
                  className={sort === "oldest" ? "font-semibold text-ink" : ""}
                >
                  {t("gallery.sortOldest")}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Download All */}
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

      {/* Media Grid or Empty State */}
      {items.length === 0 ? (
        <div className="event-gallery__hero-empty">
          {/* Visual Stage: 3-card Editorial Cluster (Polaroids + Center Live Mini QR Standee) */}
          <div className="event-gallery__empty-stage">
            {/* Left Polaroid: Authentic Cocktail / Gathering Candid */}
            <div className="event-gallery__polaroid event-gallery__polaroid--left">
              <div
                className="event-gallery__washi-tape event-gallery__washi-tape--left"
                aria-hidden="true"
              />
              <div className="event-gallery__polaroid-media">
                <Image
                  src="/images/moment.jpg"
                  alt="Sample candid moment"
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
              <p className="event-gallery__polaroid-caption">
                {t("gallery.sampleMoment1")}
              </p>
            </div>

            {/* Center Hero: Interactive Live Mini QR Standee */}
            <div className="event-gallery__qr-standee">
              <div className="event-gallery__qr-standee-header">
                <Sparkle
                  size={14}
                  weight="fill"
                  className="text-amber-500 shrink-0"
                  aria-hidden="true"
                />
                <span className="event-gallery__qr-standee-title truncate">
                  {eventName || "CandidCrowd"}
                </span>
              </div>

              <div className="event-gallery__qr-standee-code-box">
                {emptyQrUrl ? (
                  <div className="event-gallery__qr-standee-img-wrap">
                    <Image
                      src={emptyQrUrl}
                      alt="Event QR code"
                      width={132}
                      height={132}
                      className="event-gallery__qr-standee-img"
                    />
                    <div
                      className="event-gallery__qr-standee-logo-pin"
                      aria-hidden="true"
                    >
                      <Camera size={13} weight="fill" />
                    </div>
                  </div>
                ) : (
                  <div className="event-gallery__qr-standee-placeholder animate-pulse">
                    <QrCode size={40} className="text-muted-foreground/40" />
                  </div>
                )}
              </div>

              {publicCode && (
                <div className="event-gallery__qr-standee-url">
                  <span>candidcrowd.life/e/{publicCode}</span>
                </div>
              )}

              <div className="event-gallery__qr-standee-badge">
                <span className="event-gallery__pulse-dot" aria-hidden="true" />
                <span>{t("gallery.scanToTryPrompt")}</span>
              </div>
            </div>

            {/* Right Polaroid: Dance Floor / Celebration Candid */}
            <div className="event-gallery__polaroid event-gallery__polaroid--right">
              <div
                className="event-gallery__washi-tape event-gallery__washi-tape--right"
                aria-hidden="true"
              />
              <div className="event-gallery__polaroid-media">
                <Image
                  src="/images/table.jpg"
                  alt="Sample celebratory moment"
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
              <p className="event-gallery__polaroid-caption">
                {t("gallery.sampleMoment2")}
              </p>
            </div>
          </div>

          {/* Copywriting & Emotional Narrative */}
          <div className="event-gallery__hero-empty-copy">
            <h3 className="event-gallery__hero-empty-title font-heading">
              {t("gallery.emptyTitle")}
            </h3>
            <p className="event-gallery__hero-empty-desc">
              {t("gallery.emptyDesc")}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="event-gallery__hero-empty-actions">
            {onOpenShare && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={onOpenShare}
                className="gap-2 font-medium"
              >
                <QrCode size={15} weight="bold" aria-hidden="true" />
                <span>{t("gallery.shareQr")}</span>
              </Button>
            )}

            {guestUrl && (
              <a
                href={guestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Eye size={15} weight="bold" aria-hidden="true" />
                <span>{t("gallery.viewAsGuest")}</span>
              </a>
            )}

            {onOpenPrint && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onOpenPrint}
                className="gap-1.5 text-muted-foreground hover:text-ink"
              >
                <Printer size={15} aria-hidden="true" />
                <span>{t("gallery.downloadPrintCard")}</span>
              </Button>
            )}
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="event-gallery__filter-empty">
          <div className="event-gallery__filter-empty-icon" aria-hidden="true">
            <Funnel size={26} className="text-muted-foreground" />
          </div>
          <h3 className="font-heading text-base text-ink font-medium mt-2">
            {t("gallery.filterEmptyTitle")}
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFilter("all")}
            className="mt-3 gap-1.5"
          >
            <ArrowsClockwise size={14} aria-hidden="true" />
            <span>{t("gallery.filterEmptyReset")}</span>
          </Button>
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
                    <span>{t("gallery.filterVideos")}</span>
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
                      title={t("gallery.itemDownload")}
                      aria-label={t("gallery.itemDownload")}
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
