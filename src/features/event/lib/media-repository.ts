import { privateClient } from "@/lib/api-client";
import type { EventMediaItem, EventMediaStatus } from "../types/event";
import type {
  EventMediaCounts,
  EventMediaQueryParams,
  EventMediaResponse,
} from "../types/event-media";

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
    has_event_frame?: boolean;
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
  page?: { next_cursor: string; has_more: boolean };
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
          limit: params.per_page || 24,
          ...(params.cursor ? { cursor: params.cursor } : {}),
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
      has_event_frame: Boolean(item.has_event_frame),
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
      page: response.data.page,
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
 * Singleton repository instance exposed to the application layer.
 */
export const eventMediaRepository: EventMediaRepository =
  new HttpEventMediaRepository();
