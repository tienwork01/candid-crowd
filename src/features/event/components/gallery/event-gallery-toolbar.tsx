"use client";

import {
  ArrowsDownUp,
  CheckSquareOffset,
  Columns,
  DownloadSimple,
  Heart,
  SquaresFour,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import type {
  GalleryFilterType,
  GalleryLayoutMode,
  GallerySortType,
} from "../../hooks/use-event-media-gallery";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";

type EventGalleryToolbarProps = {
  filter: GalleryFilterType;
  onFilterChange: (filter: GalleryFilterType) => void;
  counts: {
    all: number;
    photos: number;
    videos: number;
    favorites: number;
    hidden: number;
  };
  sort: GallerySortType;
  onSortChange: (sort: GallerySortType) => void;
  layoutMode: GalleryLayoutMode;
  onLayoutModeChange: (mode: GalleryLayoutMode) => void;
  isSelectMode: boolean;
  onToggleSelectMode: () => void;
  totalItems: number;
  onDownloadAll: () => void;
};

export function EventGalleryToolbar({
  filter,
  onFilterChange,
  counts,
  sort,
  onSortChange,
  layoutMode,
  onLayoutModeChange,
  isSelectMode,
  onToggleSelectMode,
  totalItems,
  onDownloadAll,
}: EventGalleryToolbarProps) {
  const t = useTranslations("event");

  return (
    <div className="event-gallery__toolbar">
      {/* Category Tabs */}
      <div
        className="event-gallery__filters"
        role="tablist"
        aria-label={t("gallery.filterAll")}
      >
        <button
          type="button"
          role="tab"
          aria-selected={filter === "all"}
          onClick={() => onFilterChange("all")}
          className={`event-gallery__filter-btn ${
            filter === "all" ? "event-gallery__filter-btn--active" : ""
          }`}
        >
          <span>{t("gallery.filterAll")}</span>
          <span className="ml-1 opacity-75">({counts.all})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={filter === "photos"}
          onClick={() => onFilterChange("photos")}
          className={`event-gallery__filter-btn ${
            filter === "photos" ? "event-gallery__filter-btn--active" : ""
          }`}
        >
          <span>{t("gallery.filterPhotos")}</span>
          <span className="ml-1 opacity-75">({counts.photos})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={filter === "videos"}
          onClick={() => onFilterChange("videos")}
          className={`event-gallery__filter-btn ${
            filter === "videos" ? "event-gallery__filter-btn--active" : ""
          }`}
        >
          <span>{t("gallery.filterVideos")}</span>
          <span className="ml-1 opacity-75">({counts.videos})</span>
        </button>

        {counts.favorites > 0 && (
          <button
            type="button"
            role="tab"
            aria-selected={filter === "favorites"}
            onClick={() => onFilterChange("favorites")}
            className={`event-gallery__filter-btn ${
              filter === "favorites" ? "event-gallery__filter-btn--active" : ""
            }`}
          >
            <Heart size={12} weight="fill" aria-hidden="true" />
            <span>{t("gallery.filterFavorites")}</span>
            <span className="ml-1 opacity-75">({counts.favorites})</span>
          </button>
        )}

        {counts.hidden > 0 && (
          <button
            type="button"
            role="tab"
            aria-selected={filter === "hidden"}
            onClick={() => onFilterChange("hidden")}
            className={`event-gallery__filter-btn ${
              filter === "hidden" ? "event-gallery__filter-btn--active" : ""
            }`}
          >
            <span>{t("gallery.filterHidden", { count: counts.hidden })}</span>
          </button>
        )}
      </div>

      {/* Toolbar Controls */}
      <div className="event-gallery__actions">
        {/* Layout Switcher (Masonry vs Grid) */}
        <div
          className="event-gallery__layout-toggle"
          role="group"
          aria-label="Layout view mode"
        >
          <button
            type="button"
            onClick={() => onLayoutModeChange("masonry")}
            className={`event-gallery__layout-btn ${
              layoutMode === "masonry"
                ? "event-gallery__layout-btn--active"
                : ""
            }`}
            title={t("gallery.layoutMasonry")}
            aria-label={t("gallery.layoutMasonry")}
          >
            <Columns size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onLayoutModeChange("grid")}
            className={`event-gallery__layout-btn ${
              layoutMode === "grid" ? "event-gallery__layout-btn--active" : ""
            }`}
            title={t("gallery.layoutGrid")}
            aria-label={t("gallery.layoutGrid")}
          >
            <SquaresFour size={15} aria-hidden="true" />
          </button>
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="text-xs h-9 gap-1.5 text-muted-foreground inline-flex items-center px-3 rounded-md hover:bg-accent transition-colors">
            <ArrowsDownUp size={14} aria-hidden="true" />
            <span>{t("gallery.sortLabel")}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSortChange("newest")}>
              <span
                className={sort === "newest" ? "font-semibold text-ink" : ""}
              >
                {t("gallery.sortNewest")}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange("oldest")}>
              <span
                className={sort === "oldest" ? "font-semibold text-ink" : ""}
              >
                {t("gallery.sortOldest")}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Select Mode Toggle */}
        {totalItems > 0 && (
          <Button
            type="button"
            variant={isSelectMode ? "default" : "outline"}
            size="sm"
            onClick={onToggleSelectMode}
            className="text-xs h-9 gap-1.5"
            aria-pressed={isSelectMode}
          >
            <CheckSquareOffset size={15} aria-hidden="true" />
            <span>{t("gallery.batchSelect")}</span>
          </Button>
        )}

        {/* Download All */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDownloadAll}
          className="text-xs h-9 gap-1.5"
          disabled={totalItems === 0}
        >
          <DownloadSimple size={15} aria-hidden="true" />
          <span>{t("gallery.downloadAll", { count: totalItems })}</span>
        </Button>
      </div>
    </div>
  );
}
