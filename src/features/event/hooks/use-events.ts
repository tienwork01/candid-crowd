import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { APIError, privateClient } from "@/lib/api-client";
import { CACHE_TIMES, QUERY_KEYS } from "@/lib/cache-config";
import { siteConfig } from "@/lib/config";
import type { CandidEvent } from "../types/event";
import type { EventListParams, EventListResponse } from "../types/event-list";
import { DEFAULT_PER_PAGE } from "../types/event-list";

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
  qr_config?: CandidEvent["qr_config"];
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
    qr_config: be.qr_config,
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
 * The backend is the only source of truth for authenticated event data.
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

      if (!response.data?.data) {
        throw new APIError(
          502,
          "request_failed",
          "The events API returned no list.",
        );
      }

      const events = response.data.data.map(normalizeEvent);

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
    },
    placeholderData: keepPreviousData,
    staleTime: CACHE_TIMES.STANDARD.staleTime,
    gcTime: CACHE_TIMES.STANDARD.gcTime,
  });
}
