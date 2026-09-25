import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { privateClient } from "@/lib/api-client";
import { CACHE_TIMES, QUERY_KEYS } from "@/lib/cache-config";
import { siteConfig } from "@/lib/config";
import type { CandidEvent } from "../types/event";
import type { EventListParams, EventListResponse } from "../types/event-list";
import { DEFAULT_PER_PAGE } from "../types/event-list";
import { saveStoredEvent, getStoredEvents } from "../lib/event-store";
import { paginateLocalEvents } from "../lib/paginate-local";

type BackendEvent = {
  id: string;
  host_id: string;
  name: string;
  slug: string;
  event_date: string | null;
  event_type: string;
  expected_guest_count: number;
  status: string;
  gallery_enabled: boolean;
  max_media_bytes: number;
  used_media_bytes: number;
  created_at: string;
  updated_at: string;
};

type BackendEventsResponse = {
  data: BackendEvent[];
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
};

function normalizeEvent(be: BackendEvent): CandidEvent {
  const origin =
    typeof window !== "undefined" ? window.location.origin : siteConfig.appUrl;
  const guestUrl = `${origin}/e/${be.slug}`;

  return {
    id: be.id,
    name: be.name,
    event_type: (be.event_type as CandidEvent["event_type"]) || "Other",
    event_date: be.event_date,
    date_unknown: !be.event_date,
    expected_guest_count: be.expected_guest_count,
    slug: be.slug,
    public_url: guestUrl,
    guest_url: guestUrl,
    qr_destination: guestUrl,
    created_at: be.created_at,
    updated_at: be.updated_at,
    lifecycle_phase: "before",
    setup_checklist: {
      eventCreated: true,
      qrReady: true,
      testedGuestExperience: false,
      addedGuestCount: be.expected_guest_count > 0,
      customizedQr: false,
      customizedPage: false,
    },
  };
}

/**
 * Fetches a paginated, searchable, filterable list of events.
 *
 * - Tries the backend API first (`/api/v1/events` with query params).
 * - Falls back to client-side pagination of localStorage data when the backend is unavailable.
 * - Uses `keepPreviousData` so the UI doesn't flash blank between page transitions.
 */
export function useEvents(params: EventListParams = {}) {
  const {
    page = 1,
    per_page = DEFAULT_PER_PAGE,
    q,
    type,
    sort = "newest",
    direction,
  } = params;

  const normalizedQ = q?.trim() || undefined;
  const normalizedType = type || undefined;

  const resolvedDirection =
    direction ||
    (sort === "oldest" || sort === "name" || sort === "upcoming"
      ? "asc"
      : "desc");

  return useQuery<EventListResponse>({
    queryKey: QUERY_KEYS.event.list({
      page,
      per_page,
      q: normalizedQ,
      type: normalizedType,
      sort,
      direction: resolvedDirection,
    }),
    queryFn: async (): Promise<EventListResponse> => {
      try {
        const response = await privateClient.get<BackendEventsResponse>(
          "/api/v1/events",
          {
            params: {
              page,
              per_page,
              ...(normalizedQ ? { q: normalizedQ } : {}),
              ...(normalizedType ? { type: normalizedType } : {}),
              sort,
              direction: resolvedDirection,
            },
          },
        );

        if (response.data?.data) {
          const events = response.data.data.map(normalizeEvent);

          // Sync to local store as cache
          for (const ev of events) {
            saveStoredEvent(ev);
          }

          return {
            data: events,
            pagination: response.data.pagination ?? {
              page,
              per_page,
              total: events.length,
              total_pages: 1,
              has_next: false,
              has_prev: false,
            },
          };
        }
      } catch {
        // Fallback: paginate localStorage data client-side
      }

      return paginateLocalEvents({
        page,
        per_page,
        q: normalizedQ,
        type: normalizedType,
        sort,
        direction: resolvedDirection,
      });
    },
    initialData: () => {
      const local = paginateLocalEvents({
        page,
        per_page,
        q: normalizedQ,
        type: normalizedType,
        sort,
        direction: resolvedDirection,
      });

      if (local.data.length > 0) {
        return local;
      }

      return undefined;
    },
    initialDataUpdatedAt: () => 0,
    placeholderData: keepPreviousData,
    staleTime: CACHE_TIMES.STANDARD.staleTime,
    gcTime: CACHE_TIMES.STANDARD.gcTime,
  });
}

/**
 * Returns the total count of all locally-stored events.
 * Used for global metrics strip (independent of current page/filter).
 */
export function useEventsTotals() {
  const events = Object.values(getStoredEvents());

  const totalEvents = events.length;

  const totalMemories = events.reduce((sum, ev) => {
    const photos = ev.metrics?.photos_count || 0;
    const videos = ev.metrics?.videos_count || 0;
    const items = ev.media_items?.length || 0;

    return sum + Math.max(photos + videos, items);
  }, 0);

  const totalContributors = events.reduce((sum, ev) => {
    return sum + (ev.metrics?.contributors_count || 0);
  }, 0);

  return { totalEvents, totalMemories, totalContributors };
}
