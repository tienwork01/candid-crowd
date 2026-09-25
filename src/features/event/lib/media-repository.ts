import { privateClient } from "@/lib/api-client";
import type { EventMediaItem, EventMediaStatus } from "../types/event";
import type {
  EventMediaCounts,
  EventMediaQueryParams,
  EventMediaResponse,
} from "../types/event-media";
import {
  batchDeleteStoredMedia,
  batchUpdateStoredMediaStatus,
  deleteStoredMediaItem,
  getStoredEvent,
  updateStoredEvent,
} from "./event-store";

/**
 * Port (Contract): Event Media Repository
 * Follows Hexagonal / Clean Architecture boundaries:
 * Application logic interacts only with this abstract interface.
 */
export interface EventMediaRepository {
  getMedia(
    eventId: string,
    params?: EventMediaQueryParams,
  ): Promise<EventMediaResponse>;
  updateStatus(
    eventId: string,
    mediaId: string,
    status: EventMediaStatus,
  ): Promise<void>;
  batchUpdateStatus(
    eventId: string,
    mediaIds: string[],
    status: EventMediaStatus,
  ): Promise<void>;
  deleteMedia(eventId: string, mediaId: string): Promise<void>;
  batchDeleteMedia(eventId: string, mediaIds: string[]): Promise<void>;
}

/**
 * Adapter: Local Storage & In-Memory Media Repository
 * Provides resilient offline filtering, development mocking, and unit testing fallback.
 */
export class LocalEventMediaRepository implements EventMediaRepository {
  async getMedia(
    eventId: string,
    params: EventMediaQueryParams = {},
  ): Promise<EventMediaResponse> {
    const event = getStoredEvent(eventId);
    const items = event?.media_items || [];

    // Calculate category counts
    let all = 0;
    let photos = 0;
    let videos = 0;
    let favorites = 0;
    let hidden = 0;

    for (const item of items) {
      if (item.status === "hidden") {
        hidden++;
      } else {
        all++;

        if (item.is_video) {
          videos++;
        } else {
          photos++;
        }
      }

      if (item.status === "featured") {
        favorites++;
      }
    }

    const counts: EventMediaCounts = {
      all,
      photos,
      videos,
      favorites,
      hidden,
    };

    // Filter items based on backend filter query
    const filter = params.filter || "all";
    let filtered: EventMediaItem[];

    switch (filter) {
      case "photos":
        filtered = items.filter((i) => !i.is_video && i.status !== "hidden");
        break;
      case "videos":
        filtered = items.filter((i) => i.is_video && i.status !== "hidden");
        break;
      case "favorites":
        filtered = items.filter((i) => i.status === "featured");
        break;
      case "hidden":
        filtered = items.filter((i) => i.status === "hidden");
        break;
      case "all":
      default:
        filtered = items.filter((i) => i.status !== "hidden");
        break;
    }

    // Sort items based on backend sort query
    const sort = params.sort || "newest";
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();

      return sort === "newest" ? dateB - dateA : dateA - dateB;
    });

    // Pagination
    const page = params.page || 1;
    const perPage = params.per_page;
    let paginatedData = sorted;
    let pagination;

    if (perPage && perPage > 0) {
      const total = sorted.length;
      const totalPages = Math.max(1, Math.ceil(total / perPage));
      const safePage = Math.max(1, Math.min(page, totalPages));
      const start = (safePage - 1) * perPage;

      paginatedData = sorted.slice(start, start + perPage);
      pagination = {
        page: safePage,
        per_page: perPage,
        total,
        total_pages: totalPages,
        has_next: safePage < totalPages,
        has_prev: safePage > 1,
      };
    }

    return {
      data: paginatedData,
      counts,
      pagination,
    };
  }

  async updateStatus(
    eventId: string,
    mediaId: string,
    status: EventMediaStatus,
  ): Promise<void> {
    batchUpdateStoredMediaStatus(eventId, [mediaId], status);
  }

  async batchUpdateStatus(
    eventId: string,
    mediaIds: string[],
    status: EventMediaStatus,
  ): Promise<void> {
    batchUpdateStoredMediaStatus(eventId, mediaIds, status);
  }

  async deleteMedia(eventId: string, mediaId: string): Promise<void> {
    deleteStoredMediaItem(eventId, mediaId);
  }

  async batchDeleteMedia(eventId: string, mediaIds: string[]): Promise<void> {
    batchDeleteStoredMedia(eventId, mediaIds);
  }
}

type BackendMediaListPayload = {
  data: Array<{
    id: string;
    url: string;
    thumbnail_url?: string;
    caption?: string;
    guest_name?: string;
    created_at: string;
    qr_source?: EventMediaItem["qr_source"];
    status: EventMediaStatus;
    is_video?: boolean;
    likes_count?: number;
    width?: number;
    height?: number;
  }>;
  counts?: EventMediaCounts;
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
};

/**
 * Adapter: Remote HTTP Media Repository (Go Gin Backend)
 * Sends all filtering, sorting, pagination, and mutation requests directly to the Go backend.
 */
export class HttpEventMediaRepository implements EventMediaRepository {
  async getMedia(
    eventId: string,
    params: EventMediaQueryParams = {},
  ): Promise<EventMediaResponse> {
    const response = await privateClient.get<BackendMediaListPayload>(
      `/api/v1/events/${encodeURIComponent(eventId)}/media`,
      {
        params: {
          filter: params.filter || "all",
          sort: params.sort || "newest",
          ...(params.page ? { page: params.page } : {}),
          ...(params.per_page ? { per_page: params.per_page } : {}),
        },
      },
    );

    const data: EventMediaItem[] = (response.data.data || []).map((item) => ({
      id: item.id,
      url: item.url,
      thumbnail_url: item.thumbnail_url,
      caption: item.caption,
      guest_name: item.guest_name,
      created_at: item.created_at,
      qr_source: item.qr_source,
      status: item.status,
      is_video: Boolean(item.is_video),
      likes_count: item.likes_count,
      width: item.width,
      height: item.height,
    }));

    // If backend returns counts, use them; otherwise compute from items
    let counts: EventMediaCounts = response.data.counts || {
      all: 0,
      photos: 0,
      videos: 0,
      favorites: 0,
      hidden: 0,
    };

    if (!response.data.counts) {
      let all = 0;
      let photos = 0;
      let videos = 0;
      let favorites = 0;
      let hidden = 0;

      for (const item of data) {
        if (item.status === "hidden") {
          hidden++;
        } else {
          all++;
          if (item.is_video) videos++;
          else photos++;
        }

        if (item.status === "featured") {
          favorites++;
        }
      }

      counts = { all, photos, videos, favorites, hidden };
    }

    return {
      data,
      counts,
      pagination: response.data.pagination,
    };
  }

  async updateStatus(
    eventId: string,
    mediaId: string,
    status: EventMediaStatus,
  ): Promise<void> {
    await privateClient.patch(
      `/api/v1/events/${encodeURIComponent(eventId)}/media/${encodeURIComponent(mediaId)}`,
      { status },
    );
  }

  async batchUpdateStatus(
    eventId: string,
    mediaIds: string[],
    status: EventMediaStatus,
  ): Promise<void> {
    await privateClient.post(
      `/api/v1/events/${encodeURIComponent(eventId)}/media/batch-status`,
      { ids: mediaIds, status },
    );
  }

  async deleteMedia(eventId: string, mediaId: string): Promise<void> {
    await privateClient.delete(
      `/api/v1/events/${encodeURIComponent(eventId)}/media/${encodeURIComponent(mediaId)}`,
    );
  }

  async batchDeleteMedia(eventId: string, mediaIds: string[]): Promise<void> {
    await privateClient.post(
      `/api/v1/events/${encodeURIComponent(eventId)}/media/batch-delete`,
      { ids: mediaIds },
    );
  }
}

/**
 * Composite Media Repository:
 * First attempts to query the Go Backend.
 * Seamlessly falls back to local storage adapter when the backend is offline or unreachable.
 */
export class CompositeEventMediaRepository implements EventMediaRepository {
  constructor(
    private readonly remote: EventMediaRepository = new HttpEventMediaRepository(),
    private readonly local: EventMediaRepository = new LocalEventMediaRepository(),
  ) {}

  async getMedia(
    eventId: string,
    params: EventMediaQueryParams = {},
  ): Promise<EventMediaResponse> {
    try {
      const response = await this.remote.getMedia(eventId, params);

      // Synchronize to local storage for offline resilience
      if (response.data && response.data.length > 0) {
        const existing = getStoredEvent(eventId);

        if (existing) {
          updateStoredEvent(eventId, {
            media_items: response.data,
          });
        }
      }

      return response;
    } catch {
      // Backend offline, network error, or route not found -> gracefully fall back to local
      return this.local.getMedia(eventId, params);
    }
  }

  async updateStatus(
    eventId: string,
    mediaId: string,
    status: EventMediaStatus,
  ): Promise<void> {
    try {
      await this.remote.updateStatus(eventId, mediaId, status);
    } catch {
      // Offline fallback
    } finally {
      await this.local.updateStatus(eventId, mediaId, status);
    }
  }

  async batchUpdateStatus(
    eventId: string,
    mediaIds: string[],
    status: EventMediaStatus,
  ): Promise<void> {
    try {
      await this.remote.batchUpdateStatus(eventId, mediaIds, status);
    } catch {
      // Offline fallback
    } finally {
      await this.local.batchUpdateStatus(eventId, mediaIds, status);
    }
  }

  async deleteMedia(eventId: string, mediaId: string): Promise<void> {
    try {
      await this.remote.deleteMedia(eventId, mediaId);
    } catch {
      // Offline fallback
    } finally {
      await this.local.deleteMedia(eventId, mediaId);
    }
  }

  async batchDeleteMedia(eventId: string, mediaIds: string[]): Promise<void> {
    try {
      await this.remote.batchDeleteMedia(eventId, mediaIds);
    } catch {
      // Offline fallback
    } finally {
      await this.local.batchDeleteMedia(eventId, mediaIds);
    }
  }
}

/**
 * Singleton repository instance exposed to the application layer.
 */
export const eventMediaRepository: EventMediaRepository =
  new CompositeEventMediaRepository();
