"use client";

import { useMemo, useState } from "react";
import type { EventMediaItem } from "../types/event";
import type {
  GalleryFilterType,
  GalleryLayoutMode,
  GallerySortType,
} from "../types/event-media";
import { useEventMedia } from "./use-event-media";

export type {
  GalleryFilterType,
  GalleryLayoutMode,
  GallerySortType,
} from "../types/event-media";

export type UseEventMediaGalleryOptions = {
  eventId?: string;
  initialFilter?: GalleryFilterType;
  initialSort?: GallerySortType;
  initialLayout?: GalleryLayoutMode;
};

const EMPTY_FALLBACK_ITEMS: EventMediaItem[] = [];

export function useEventMediaGallery(
  itemsOrEventId: EventMediaItem[] | string,
  optionsOrItems?: UseEventMediaGalleryOptions | EventMediaItem[],
  legacyOptions?: UseEventMediaGalleryOptions,
) {
  // Support flexible signatures:
  // 1. useEventMediaGallery(eventId, options)
  // 2. useEventMediaGallery(items, options)
  // 3. useEventMediaGallery(eventId, items, options)
  let eventId: string | undefined;
  let options: UseEventMediaGalleryOptions = {};

  if (typeof itemsOrEventId === "string") {
    eventId = itemsOrEventId;

    if (Array.isArray(optionsOrItems)) {
      options = legacyOptions || {};
    } else if (optionsOrItems) {
      options = optionsOrItems;
    }
  } else if (optionsOrItems && !Array.isArray(optionsOrItems)) {
    options = optionsOrItems;
    eventId = options.eventId;
  }

  const fallbackItems = useMemo(() => {
    if (typeof itemsOrEventId === "string") {
      if (Array.isArray(optionsOrItems)) {
        return optionsOrItems;
      }

      return EMPTY_FALLBACK_ITEMS;
    }

    return itemsOrEventId || EMPTY_FALLBACK_ITEMS;
  }, [itemsOrEventId, optionsOrItems]);

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

  // Backend-driven query when eventId is present
  const remoteQuery = useEventMedia(eventId, {
    filter,
    sort,
  });

  // Category counts: comes from Backend if eventId is active, otherwise computed locally
  const localCounts = useMemo(() => {
    let all = 0;
    let photos = 0;
    let videos = 0;
    let favorites = 0;
    let hidden = 0;

    for (const item of fallbackItems) {
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
  }, [fallbackItems]);

  // Local filtered items fallback (when eventId is not provided)
  const localFilteredItems = useMemo(() => {
    let result: EventMediaItem[];

    switch (filter) {
      case "photos":
        result = fallbackItems.filter(
          (i) => !i.is_video && i.status !== "hidden",
        );
        break;
      case "videos":
        result = fallbackItems.filter(
          (i) => i.is_video && i.status !== "hidden",
        );
        break;
      case "favorites":
        result = fallbackItems.filter((i) => i.status === "featured");
        break;
      case "hidden":
        result = fallbackItems.filter((i) => i.status === "hidden");
        break;
      case "all":
      default:
        result = fallbackItems.filter((i) => i.status !== "hidden");
    }

    return [...result].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();

      return sort === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [fallbackItems, filter, sort]);

  // Unified single source of truth:
  // If eventId exists and remoteQuery has data, use Backend response
  // Otherwise use local calculation
  const counts =
    eventId && remoteQuery.data ? remoteQuery.data.counts : localCounts;
  const filteredItems =
    eventId && remoteQuery.data ? remoteQuery.data.data : localFilteredItems;
  const isLoading = eventId ? remoteQuery.isLoading : false;
  const isFetching = eventId ? remoteQuery.isFetching : false;

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
    isLoading,
    isFetching,
    refetch: remoteQuery.refetch,
  };
}
