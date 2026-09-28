import { useQuery } from "@tanstack/react-query";
import {
  APIError,
  isBackendUnreachable,
  privateClient,
} from "@/lib/api-client";
import { CACHE_TIMES, QUERY_KEYS } from "@/lib/cache-config";
import type { CandidEvent } from "../types/event";
import { getStoredEvent, saveStoredEvent } from "../lib/event-store";

/**
 * Query hook to fetch a single event by ID or slug.
 */
export function useEvent(idOrSlug: string) {
  return useQuery<CandidEvent | null>({
    queryKey: QUERY_KEYS.event.detail(idOrSlug),
    queryFn: async () => {
      if (!idOrSlug) return null;

      // Locally stored copy of a previously synced event, used only when the
      // API cannot be reached at all.
      const local = getStoredEvent(idOrSlug);

      try {
        const response = await privateClient.get<CandidEvent>(
          `/api/v1/events/${encodeURIComponent(idOrSlug)}`,
        );

        if (response.data?.id) {
          saveStoredEvent(response.data);

          return response.data;
        }

        return null;
      } catch (error) {
        if (isBackendUnreachable(error)) {
          console.warn(
            `[event] backend unreachable, showing the stored copy of "${idOrSlug}"`,
            error,
          );

          return local ?? null;
        }

        // A 404 is an answer, not a failure: the event does not exist.
        if (error instanceof APIError && error.status === 404) {
          return null;
        }

        console.error(
          `[event] backend rejected the request for "${idOrSlug}"`,
          error,
        );

        throw error;
      }
    },
    enabled: Boolean(idOrSlug),
    // `null` counts as data to TanStack Query, so returning it here used to
    // put the query straight into success with an empty event and, thanks to
    // staleTime, never fetch at all — every host without a locally stored
    // copy saw "event not found" and no request was ever made.
    initialData: () => getStoredEvent(idOrSlug) ?? undefined,
    // A stored copy is a placeholder, not an answer. Dating it to the epoch
    // renders it immediately while the real event loads behind it.
    initialDataUpdatedAt: 0,
    staleTime: CACHE_TIMES.STANDARD.staleTime,
    gcTime: CACHE_TIMES.STANDARD.gcTime,
  });
}
