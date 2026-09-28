"use client";

import {
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/cache-config";
import type { EventMediaStatus } from "../types/event";
import type {
  EventMediaQueryParams,
  EventMediaResponse,
} from "../types/event-media";
import { eventMediaRepository } from "../lib/media-repository";

/**
 * Clean Architecture Query Hook:
 * Queries event media with backend-driven filtering, sorting, and pagination.
 */
export function useEventMedia(
  eventId: string | undefined,
  params: EventMediaQueryParams = {},
) {
  const queryParams: EventMediaQueryParams = {
    filter: params.filter || "all",
    sort: params.sort || "newest",
    per_page: params.per_page || 24,
  };

  return useInfiniteQuery<EventMediaResponse>({
    queryKey: QUERY_KEYS.event.media(eventId || "", queryParams),
    queryFn: async ({ pageParam }) => {
      if (!eventId) {
        return {
          data: [],
          counts: { all: 0, photos: 0, videos: 0, favorites: 0, hidden: 0 },
        };
      }

      return eventMediaRepository.getMedia(eventId, {
        ...queryParams,
        cursor:
          typeof pageParam === "string" && pageParam ? pageParam : undefined,
      });
    },
    initialPageParam: "",
    getNextPageParam: (lastPage) =>
      lastPage.page?.has_more ? lastPage.page.next_cursor : undefined,
    enabled: Boolean(eventId),
    // Keep the same signed URLs during normal host navigation so images can
    // be served from the browser cache instead of downloading again.
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Mutation Hook: Update single media status (featured, hidden, ready) on Backend
 */
export function useUpdateMediaStatus(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mediaId,
      status,
    }: {
      mediaId: string;
      status: EventMediaStatus;
    }) => {
      await eventMediaRepository.updateStatus(eventId, mediaId, status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["event", eventId, "media"],
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.event.detail(eventId),
      });
    },
  });
}

/**
 * Mutation Hook: Batch update media status on Backend
 */
export function useBatchUpdateMediaStatus(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mediaIds,
      status,
    }: {
      mediaIds: string[];
      status: EventMediaStatus;
    }) => {
      await eventMediaRepository.batchUpdateStatus(eventId, mediaIds, status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["event", eventId, "media"],
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.event.detail(eventId),
      });
    },
  });
}

/**
 * Mutation Hook: Delete single media on Backend
 */
export function useDeleteMedia(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mediaId: string) => {
      await eventMediaRepository.deleteMedia(eventId, mediaId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["event", eventId, "media"],
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.event.detail(eventId),
      });
    },
  });
}

/**
 * Mutation Hook: Batch delete media on Backend
 */
export function useBatchDeleteMedia(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mediaIds: string[]) => {
      await eventMediaRepository.batchDeleteMedia(eventId, mediaIds);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["event", eventId, "media"],
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.event.detail(eventId),
      });
    },
  });
}
