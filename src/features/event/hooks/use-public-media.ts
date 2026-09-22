import { useQuery } from "@tanstack/react-query";
import { publicClient } from "@/lib/api-client";
import type { EventMediaItem } from "../types/event";

export function usePublicMedia(slug: string) {
  return useQuery<EventMediaItem[]>({
    queryKey: ["public-event-media", slug],
    queryFn: async () => {
      const r = await publicClient.get<{
        data: Array<{
          id: string;
          url: string;
          created_at: string;
          is_video: boolean;
        }>;
      }>(`/api/v1/public/events/${encodeURIComponent(slug)}/media`);

      return r.data.data.map((x) => ({
        id: x.id,
        url: x.url,
        created_at: x.created_at,
        status: "ready",
        is_video: x.is_video,
      }));
    },
    enabled: !!slug,
  });
}
