"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { CACHE_TIMES, QUERY_KEYS } from "@/lib/cache-config";
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
    page: params.page,
    per_page: params.per_page,
  };

  return useQuery<EventMediaResponse>({
    queryKey: QUERY_KEYS.event.media(eventId || "", queryParams),
    queryFn: async () => {
      if (!eventId) {
        return {
          data: [],
          counts: { all: 0, photos: 0, videos: 0, favorites: 0, hidden: 0 },
        };
      }

      return eventMediaRepository.getMedia(eventId, queryParams);
    },
    enabled: Boolean(eventId),
    placeholderData: keepPreviousData,
    staleTime: CACHE_TIMES.FREQUENT.staleTime,
    gcTime: CACHE_TIMES.FREQUENT.gcTime,
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
