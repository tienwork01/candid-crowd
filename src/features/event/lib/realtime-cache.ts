import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { EventMediaItem, EventMediaStatus } from "../types/event";
import type {
  EventMediaCounts,
  EventMediaResponse,
  GalleryFilterType,
} from "../types/event-media";
import type {
  RealtimeMediaPayload,
  RealtimeMessage,
} from "../types/event-realtime";

/**
 * Applies realtime messages to the TanStack Query cache.
 *
 * Removals and moderation are applied in place so a host sees them without a
 * round trip — that responsiveness is the whole point of the feature. New
 * media cannot be applied in place on the host side, because each host URL is
 * presigned per request, so those messages ask the caller to refetch instead.
 *
 * The functions here are pure with respect to everything but the cache, so the
 * rules can be tested without a server.
 */

type MediaInfiniteData = InfiniteData<EventMediaResponse>;

const EMPTY_COUNTS: EventMediaCounts = {
  all: 0,
  photos: 0,
  videos: 0,
  favorites: 0,
  hidden: 0,
};

export type RealtimeCacheResult = {
  /** The caller should refetch: the cache could not be corrected locally. */
  needsRefetch: boolean;
};

function mediaQueryFilter(eventId: string) {
  // Keys are ["event", id, "media", params], so a prefix match reaches every
  // filter/sort variant the host has open at once.
  return { queryKey: ["event", eventId, "media"] as const };
}

function filterOf(queryKey: readonly unknown[]): GalleryFilterType {
  const params = queryKey[3] as { filter?: GalleryFilterType } | undefined;

  return params?.filter || "all";
}

/** Mirrors the backend's gallery filters in `internal/media/service.go`. */
export function matchesFilter(
  item: Pick<EventMediaItem, "status" | "is_video">,
  filter: GalleryFilterType,
): boolean {
  switch (filter) {
    case "photos":
      return !item.is_video && item.status !== "hidden";
    case "videos":
      return Boolean(item.is_video) && item.status !== "hidden";
    case "favorites":
      return item.status === "featured";
    case "hidden":
      return item.status === "hidden";
    case "all":
    default:
      return item.status !== "hidden";
  }
}

/**
 * What one item contributes to the event's counters at a given status.
 * Counters describe the whole event, not the loaded pages, so they are
 * adjusted by deltas rather than recomputed from what happens to be cached.
 */
function contribution(
  isVideo: boolean,
  status: EventMediaStatus,
): EventMediaCounts {
  if (status === "hidden") {
    return { all: 0, photos: 0, videos: 0, favorites: 0, hidden: 1 };
  }

  return {
    all: 1,
    photos: isVideo ? 0 : 1,
    videos: isVideo ? 1 : 0,
    favorites: status === "featured" ? 1 : 0,
    hidden: 0,
  };
}

function addCounts(
  base: EventMediaCounts,
  delta: EventMediaCounts,
  sign: 1 | -1,
): EventMediaCounts {
  return {
    all: Math.max(0, base.all + sign * delta.all),
    photos: Math.max(0, base.photos + sign * delta.photos),
    videos: Math.max(0, base.videos + sign * delta.videos),
    favorites: Math.max(0, base.favorites + sign * delta.favorites),
    hidden: Math.max(0, base.hidden + sign * delta.hidden),
  };
}

function applyCounts(
  data: MediaInfiniteData,
  update: (counts: EventMediaCounts) => EventMediaCounts,
): MediaInfiniteData {
  return {
    ...data,
    pages: data.pages.map((page, index) =>
      index === 0
        ? { ...page, counts: update(page.counts || EMPTY_COUNTS) }
        : page,
    ),
  };
}

function mapItems(
  data: MediaInfiniteData,
  transform: (items: EventMediaItem[]) => EventMediaItem[],
): MediaInfiniteData {
  return {
    ...data,
    pages: data.pages.map((page) => ({ ...page, data: transform(page.data) })),
  };
}

/**
 * Finds an item anywhere in the host cache so its current state is known.
 *
 * It searches every filter variant on purpose. A hidden item is absent from
 * the "all" query by design, so looking only there would report it missing
 * and a caller deciding what to toggle would get the answer backwards.
 */
export function findCachedMediaItem(
  queryClient: QueryClient,
  eventId: string,
  id: string,
): EventMediaItem | undefined {
  const entries = queryClient.getQueriesData<MediaInfiniteData>(
    mediaQueryFilter(eventId),
  );

  for (const [, data] of entries) {
    for (const page of data?.pages || []) {
      const found = page.data.find((item) => item.id === id);

      if (found) return found;
    }
  }

  return undefined;
}

function removeFromHostCache(
  queryClient: QueryClient,
  eventId: string,
  ids: string[],
): void {
  const removable = new Set(ids);

  for (const [queryKey, data] of queryClient.getQueriesData<MediaInfiniteData>(
    mediaQueryFilter(eventId),
  )) {
    if (!data) continue;

    const removed: EventMediaItem[] = [];
    const next = mapItems(data, (items) =>
      items.filter((item) => {
        if (!removable.has(item.id)) return true;
        removed.push(item);

        return false;
      }),
    );

    if (removed.length === 0) continue;

    queryClient.setQueryData<MediaInfiniteData>(
      queryKey,
      applyCounts(next, (counts) =>
        removed.reduce(
          (acc, item) =>
            addCounts(
              acc,
              contribution(Boolean(item.is_video), item.status),
              -1,
            ),
          counts,
        ),
      ),
    );
  }
}

function updateStatusInHostCache(
  queryClient: QueryClient,
  eventId: string,
  ids: string[],
  status: EventMediaStatus,
): boolean {
  const affected = new Set(ids);
  // Previous state is read once, before any query is rewritten, so every
  // query computes its delta from the same starting point.
  const previous = new Map<string, EventMediaItem>();

  for (const id of ids) {
    const item = findCachedMediaItem(queryClient, eventId, id);

    if (item) previous.set(id, item);
  }

  // An id the host has never loaded cannot be patched locally.
  let needsRefetch = previous.size < ids.length;

  for (const [queryKey, data] of queryClient.getQueriesData<MediaInfiniteData>(
    mediaQueryFilter(eventId),
  )) {
    if (!data) continue;

    const filter = filterOf(queryKey);
    const present = new Set(
      data.pages.flatMap((page) => page.data.map((item) => item.id)),
    );

    // An item that now belongs in this filter but is not loaded here cannot
    // be inserted at the right position, so that query is refetched instead.
    for (const [id, item] of previous) {
      if (present.has(id)) continue;
      if (matchesFilter({ ...item, status }, filter)) needsRefetch = true;
    }

    let changed = false;
    const next = mapItems(data, (items) =>
      items.flatMap((item) => {
        if (!affected.has(item.id) || item.status === status) return [item];
        changed = true;

        const updated = { ...item, status };

        return matchesFilter(updated, filter) ? [updated] : [];
      }),
    );

    if (!changed) continue;

    queryClient.setQueryData<MediaInfiniteData>(
      queryKey,
      applyCounts(next, (counts) => {
        let result = counts;

        for (const [, item] of previous) {
          if (item.status === status) continue;

          const isVideo = Boolean(item.is_video);

          result = addCounts(result, contribution(isVideo, item.status), -1);
          result = addCounts(result, contribution(isVideo, status), 1);
        }

        return result;
      }),
    );
  }

  return needsRefetch;
}

/**
 * Applies one message to the host cache.
 *
 * Returns whether the caller must refetch. Callers should coalesce those
 * refetches: an upload burst produces one message per photo.
 */
export function applyHostRealtimeMessage(
  queryClient: QueryClient,
  eventId: string,
  message: RealtimeMessage,
): RealtimeCacheResult {
  switch (message.kind) {
    case "media.deleted":
      removeFromHostCache(queryClient, eventId, message.data.ids);

      return { needsRefetch: false };

    case "media.updated": {
      const { ids, status } = message.data as RealtimeMediaPayload;

      if (!status) return { needsRefetch: true };

      return {
        needsRefetch: updateStatusInHostCache(
          queryClient,
          eventId,
          ids,
          status,
        ),
      };
    }

    case "media.created":
    case "media.thumbnail.ready":
      // A host URL is presigned per request, so a new or newly thumbnailed
      // item cannot be rendered from the message alone.
      return { needsRefetch: true };

    case "event.updated":
      return { needsRefetch: false };

    default:
      return { needsRefetch: false };
  }
}

/**
 * Applies one message to a guest gallery cache, keyed by slug.
 *
 * Guest media URLs are stable application routes, so new items are inserted
 * directly and a guest never waits for a refetch to see a photo appear.
 */
export function applyGuestRealtimeMessage(
  queryClient: QueryClient,
  slug: string,
  message: RealtimeMessage,
  resolveUrl: (mediaId: string) => string,
): RealtimeCacheResult {
  const queryKey = ["public-event-media", slug] as const;

  switch (message.kind) {
    case "media.created": {
      const item = message.data.item;

      if (!item) return { needsRefetch: true };

      let inserted = false;

      queryClient.setQueryData<EventMediaItem[]>(queryKey, (items) => {
        if (!items) return items;

        if (items.some((existing) => existing.id === item.id)) {
          inserted = true;

          return items;
        }

        inserted = true;

        return [
          {
            id: item.id,
            url: resolveUrl(item.id),
            created_at: item.created_at,
            status: "ready",
            is_video: item.is_video,
            has_event_frame: item.has_event_frame,
          },
          ...items,
        ];
      });

      // Nothing cached yet means the gallery has not loaded; the first fetch
      // will include this item anyway.
      return { needsRefetch: !inserted };
    }

    case "media.deleted": {
      const removable = new Set(message.data.ids);

      queryClient.setQueryData<EventMediaItem[]>(queryKey, (items) =>
        items?.filter((item) => !removable.has(item.id)),
      );

      return { needsRefetch: false };
    }

    case "media.updated": {
      // Guests only ever receive a non-hidden status here; hiding reaches them
      // as a deletion. An id they have never loaded means it just became
      // visible, which only a refetch can resolve.
      const known = queryClient.getQueryData<EventMediaItem[]>(queryKey);

      if (!known) return { needsRefetch: false };

      const missing = message.data.ids.some(
        (id) => !known.some((item) => item.id === id),
      );

      return { needsRefetch: missing };
    }

    case "media.thumbnail.ready":
      // A guest URL does not change when a thumbnail appears.
      return { needsRefetch: false };

    case "event.updated":
      return { needsRefetch: false };

    default:
      return { needsRefetch: false };
  }
}

/** Builds the stable public content route for a guest gallery item. */
export function guestMediaUrl(slug: string, mediaId: string): string {
  return `/api/v1/public/events/${encodeURIComponent(slug)}/media/${encodeURIComponent(mediaId)}/content`;
}
