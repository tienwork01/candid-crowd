import { useQuery } from "@tanstack/react-query";
import { APIError, privateClient } from "@/lib/api-client";
import { CACHE_TIMES, QUERY_KEYS } from "@/lib/cache-config";
import type { CandidEvent } from "../types/event";

/** Fetch a single event from the backend by ID or slug. */
export function useEvent(idOrSlug: string) {
  return useQuery<CandidEvent | null>({
    queryKey: QUERY_KEYS.event.detail(idOrSlug),
    queryFn: async () => {
      if (!idOrSlug) return null;

      try {
        const response = await privateClient.get<CandidEvent>(
          `/api/v1/events/${encodeURIComponent(idOrSlug)}`,
        );

        return response.data?.id ? response.data : null;
      } catch (error) {
        if (error instanceof APIError && error.status === 404) return null;

        throw error;
      }
    },
    enabled: Boolean(idOrSlug),
    staleTime: CACHE_TIMES.STANDARD.staleTime,
    gcTime: CACHE_TIMES.STANDARD.gcTime,
  });
}
