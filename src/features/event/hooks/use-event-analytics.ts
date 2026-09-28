import { useQuery } from "@tanstack/react-query";
import { privateClient } from "@/lib/api-client";
import { CACHE_TIMES } from "@/lib/cache-config";

export type EventAnalytics = {
  expected_guest_count: number;
  scans: number;
  contributors: number;
  media: number;
  photos: number;
  videos: number;
  sources: Array<{
    code: string;
    name: string;
    scans: number;
    contributors: number;
    uploads: number;
  }>;
};

export function useEventAnalytics(eventId: string) {
  return useQuery<EventAnalytics>({
    queryKey: ["event", eventId, "analytics"],
    queryFn: async () => {
      const response = await privateClient.get<EventAnalytics>(
        `/api/v1/events/${encodeURIComponent(eventId)}/analytics`,
      );

      return response.data;
    },
    enabled: Boolean(eventId),
    staleTime: CACHE_TIMES.FREQUENT.staleTime,
    gcTime: CACHE_TIMES.FREQUENT.gcTime,
  });
}
