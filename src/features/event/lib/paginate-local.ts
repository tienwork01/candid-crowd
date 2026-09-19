import type { CandidEvent } from "../types/event";
import type {
  EventListParams,
  EventListResponse,
  EventSortOption,
} from "../types/event-list";
import { DEFAULT_PER_PAGE } from "../types/event-list";
import { getStoredEvents } from "./event-store";

/**
 * Paginate, filter, and sort events from localStorage.
 * Used as a fallback when the backend API is unavailable.
 */
export function paginateLocalEvents(
  params: EventListParams = {},
): EventListResponse {
  const {
    page = 1,
    per_page = DEFAULT_PER_PAGE,
    q,
    type,
    sort = "newest",
    direction,
  } = params;

  let items = Object.values(getStoredEvents());

  // ── Search filter ──
  if (q?.trim()) {
    const query = q.toLowerCase().trim();

    items = items.filter(
      (ev) =>
        ev.name.toLowerCase().includes(query) ||
        ev.event_type.toLowerCase().includes(query),
    );
  }

  // ── Type filter ──
  if (type) {
    items = items.filter((ev) => ev.event_type === type);
  }

  // ── Sort ──
  items = sortEvents(items, sort, direction);

  // ── Paginate ──
  const total = items.length;
  const total_pages = Math.max(1, Math.ceil(total / per_page));
  const safePage = Math.max(1, Math.min(page, total_pages));
  const start = (safePage - 1) * per_page;
  const data = items.slice(start, start + per_page);

  return {
    data,
    pagination: {
      page: safePage,
      per_page,
      total,
      total_pages,
      has_next: safePage < total_pages,
      has_prev: safePage > 1,
    },
  };
}

function sortEvents(
  events: CandidEvent[],
  sort: EventSortOption,
  direction?: import("../types/event-list").SortDirection,
): CandidEvent[] {
  const copy = [...events];
  const isDesc =
    direction === "desc" ||
    (!direction && (sort === "newest" as EventSortOption));

  switch (sort) {
    case "newest":
    case "oldest":
      return copy.sort((a, b) => {
        const diff =
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

        return isDesc ? diff : -diff;
      });

    case "name":
      return copy.sort((a, b) => {
        const diff = a.name.localeCompare(b.name);

        return isDesc ? -diff : diff;
      });

    case "upcoming": {
      const now = Date.now();

      return copy.sort((a, b) => {
        const aDate = a.event_date
          ? new Date(a.event_date).getTime()
          : Infinity;
        const bDate = b.event_date
          ? new Date(b.event_date).getTime()
          : Infinity;

        const aFuture = aDate >= now;
        const bFuture = bDate >= now;

        let diff = 0;

        if (aFuture && bFuture) diff = aDate - bDate;
        else if (aFuture) diff = -1;
        else if (bFuture) diff = 1;
        else diff = bDate - aDate;

        return isDesc ? -diff : diff;
      });
    }

    default:
      return copy;
  }
}
