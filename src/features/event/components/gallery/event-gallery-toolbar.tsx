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
} from "../../types";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tabs,
  TabsIndicator,
  TabsList,
  TabsTrigger,
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
      <Tabs
        value={filter}
        onValueChange={(val) => onFilterChange(val as GalleryFilterType)}
      >
        <TabsList
          className="event-gallery__filters"
          aria-label={t("gallery.filterAll")}
        >
          <TabsTrigger value="all" className="event-gallery__filter-btn">
            <span>{t("gallery.filterAll")}</span>
            <span className="ml-1 opacity-75">({counts.all})</span>
          </TabsTrigger>

          <TabsTrigger value="photos" className="event-gallery__filter-btn">
            <span>{t("gallery.filterPhotos")}</span>
            <span className="ml-1 opacity-75">({counts.photos})</span>
          </TabsTrigger>

          <TabsTrigger value="videos" className="event-gallery__filter-btn">
            <span>{t("gallery.filterVideos")}</span>
            <span className="ml-1 opacity-75">({counts.videos})</span>
          </TabsTrigger>

          {counts.favorites > 0 && (
            <TabsTrigger
              value="favorites"
              className="event-gallery__filter-btn"
            >
              <Heart size={12} weight="fill" aria-hidden="true" />
              <span>{t("gallery.filterFavorites")}</span>
              <span className="ml-1 opacity-75">({counts.favorites})</span>
            </TabsTrigger>
          )}

          {counts.hidden > 0 && (
            <TabsTrigger value="hidden" className="event-gallery__filter-btn">
              <span>{t("gallery.filterHidden", { count: counts.hidden })}</span>
            </TabsTrigger>
          )}

          <TabsIndicator className="event-gallery__filter-indicator" />
        </TabsList>
      </Tabs>

      {/* Toolbar Controls */}
      <div className="event-gallery__actions">
        {/* Layout Switcher (Masonry vs Grid) */}
        <Tabs
          value={layoutMode}
          onValueChange={(val) => onLayoutModeChange(val as GalleryLayoutMode)}
        >
          <TabsList
            className="event-gallery__layout-toggle"
            aria-label="Layout view mode"
          >
            <TabsTrigger
              value="masonry"
              className="event-gallery__layout-btn"
              title={t("gallery.layoutMasonry")}
              aria-label={t("gallery.layoutMasonry")}
            >
              <Columns size={15} aria-hidden="true" />
            </TabsTrigger>
            <TabsTrigger
              value="grid"
              className="event-gallery__layout-btn"
              title={t("gallery.layoutGrid")}
              aria-label={t("gallery.layoutGrid")}
            >
              <SquaresFour size={15} aria-hidden="true" />
            </TabsTrigger>
            <TabsIndicator className="event-gallery__layout-indicator" />
          </TabsList>
        </Tabs>

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
