import { useQuery } from "@tanstack/react-query";
import { publicClient, APIError } from "@/lib/api-client";
import { CACHE_TIMES, QUERY_KEYS } from "@/lib/cache-config";

export type PublicEventData = {
  id: string;
  name: string;
  slug: string;
  event_date: string;
  event_type: string;
};

/**
 * Example public query hook for guests to view event details without authentication.
 */
export function usePublicEvent(slug: string) {
  return useQuery<PublicEventData, APIError>({
    queryKey: QUERY_KEYS.event.public(slug),
    queryFn: async () => {
      const response = await publicClient.get<PublicEventData>(
        `/api/v1/public/events/${encodeURIComponent(slug)}`,
      );

      return response.data;
    },
    enabled: Boolean(slug),
    staleTime: CACHE_TIMES.STATIC.staleTime,
    gcTime: CACHE_TIMES.STATIC.gcTime,
  });
}
