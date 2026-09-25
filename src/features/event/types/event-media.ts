import type { EventMediaItem } from "./event";
import type { PaginationMeta } from "./event-list";

export type GalleryFilterType =
  "all" | "photos" | "videos" | "favorites" | "hidden";

export type GallerySortType = "newest" | "oldest";

export type GalleryLayoutMode = "masonry" | "grid";

export type EventMediaCounts = {
  all: number;
  photos: number;
  videos: number;
  favorites: number;
  hidden: number;
};

export type EventMediaQueryParams = {
  filter?: GalleryFilterType;
  sort?: GallerySortType;
  page?: number;
  per_page?: number;
};

export type EventMediaResponse = {
  data: EventMediaItem[];
  counts: EventMediaCounts;
  pagination?: PaginationMeta;
};
