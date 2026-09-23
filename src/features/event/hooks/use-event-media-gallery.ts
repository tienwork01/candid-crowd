"use client";

import { useMemo, useState } from "react";
import type { EventMediaItem } from "../types/event";

export type GalleryFilterType =
  "all" | "photos" | "videos" | "favorites" | "hidden";

export type GallerySortType = "newest" | "oldest";

export type GalleryLayoutMode = "masonry" | "grid";

export type UseEventMediaGalleryOptions = {
  initialFilter?: GalleryFilterType;
  initialSort?: GallerySortType;
  initialLayout?: GalleryLayoutMode;
};

export function useEventMediaGallery(
  items: EventMediaItem[],
  options: UseEventMediaGalleryOptions = {},
) {
  const [filter, setFilter] = useState<GalleryFilterType>(
    options.initialFilter || "all",
  );
  const [sort, setSort] = useState<GallerySortType>(
    options.initialSort || "newest",
  );
  const [layoutMode, setLayoutMode] = useState<GalleryLayoutMode>(
    options.initialLayout || "masonry",
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [lightboxId, setLightboxId] = useState<string | null>(null);

  // Category counts
  const counts = useMemo(() => {
    let all = 0;
    let photos = 0;
    let videos = 0;
    let favorites = 0;
    let hidden = 0;

    for (const item of items) {
      if (item.status === "hidden") {
        hidden++;
      } else {
        all++;

        if (item.is_video) {
          videos++;
        } else {
          photos++;
        }
      }

      if (item.status === "featured") {
        favorites++;
      }
    }

    return { all, photos, videos, favorites, hidden };
  }, [items]);

  // Filter & sort media items (Single Source of Truth)
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

    return [...result].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();

      return sort === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [items, filter, sort]);

  // Synchronized Lightbox Navigation
  const lightboxIndex = useMemo(() => {
    if (!lightboxId) return -1;

    return filteredItems.findIndex((i) => i.id === lightboxId);
  }, [lightboxId, filteredItems]);

  const activeLightboxItem =
    lightboxIndex >= 0 ? filteredItems[lightboxIndex] : null;

  const hasPrev = lightboxIndex > 0;
  const hasNext =
    lightboxIndex >= 0 && lightboxIndex < filteredItems.length - 1;

  const handlePrevLightbox = () => {
    if (hasPrev) {
      setLightboxId(filteredItems[lightboxIndex - 1].id);
    }
  };

  const handleNextLightbox = () => {
    if (hasNext) {
      setLightboxId(filteredItems[lightboxIndex + 1].id);
    }
  };

  const openLightbox = (item: EventMediaItem) => {
    setLightboxId(item.id);
  };

  const closeLightbox = () => {
    setLightboxId(null);
  };

  const selectLightboxIndex = (index: number) => {
    if (index >= 0 && index < filteredItems.length) {
      setLightboxId(filteredItems[index].id);
    }
  };

  // Selection actions
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredItems.map((i) => i.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setIsSelectMode(false);
  };

  return {
    filter,
    setFilter,
    sort,
    setSort,
    layoutMode,
    setLayoutMode,
    counts,
    filteredItems,
    selectedIds,
    isSelectMode,
    setIsSelectMode,
    toggleSelect,
    selectAll,
    clearSelection,
    activeLightboxItem,
    lightboxIndex,
    hasPrev,
    hasNext,
    openLightbox,
    closeLightbox,
    handlePrevLightbox,
    handleNextLightbox,
    selectLightboxIndex,
  };
}
