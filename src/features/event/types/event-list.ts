import type { EventType } from "./event";

/** Pagination metadata returned alongside a list of events. */
export type PaginationMeta = {
  /** Current page number (1-indexed). */
  page: number;
  /** Number of items per page. */
  per_page: number;
  /** Total number of items matching the query. */
  total: number;
  /** Total number of pages. */
  total_pages: number;
  /** Whether there is a next page. */
  has_next: boolean;
  /** Whether there is a previous page. */
  has_prev: boolean;
};

/** Default number of events shown per page. */
export const DEFAULT_PER_PAGE = 12;

/** Sort options for the event list. */
export const eventSortOptions = [
  "newest",
  "oldest",
  "name",
  "upcoming",
] as const;

export type EventSortOption = (typeof eventSortOptions)[number];

/** Query parameters accepted by the event list endpoint / hook. */
export type EventListParams = {
  page?: number;
  per_page?: number;
  q?: string;
  type?: EventType;
  sort?: EventSortOption;
};

/** Shape returned by the paginated events query. */
export type EventListResponse = {
  data: import("./event").CandidEvent[];
  pagination: PaginationMeta;
};
