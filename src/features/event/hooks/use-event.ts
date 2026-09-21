import { useQuery } from "@tanstack/react-query";
import { privateClient } from "@/lib/api-client";
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

      // Check local cache first
      const local = getStoredEvent(idOrSlug);

      try {
        const response = await privateClient.get<CandidEvent>(
          `/api/v1/events/${encodeURIComponent(idOrSlug)}`,
        );

        if (response.data && response.data.id) {
          saveStoredEvent(response.data);

          return response.data;
        }
      } catch {
        // Backend offline or route not present
      }

      return local ?? null;
    },
    enabled: Boolean(idOrSlug),
    initialData: () => getStoredEvent(idOrSlug),
    staleTime: CACHE_TIMES.STANDARD.staleTime,
    gcTime: CACHE_TIMES.STANDARD.gcTime,
  });
}
