import type { EventMediaItem, EventMediaStatus } from "./event";

/**
 * Mirrors the backend contract in `internal/realtime/realtime.go`.
 *
 * Every message is a hint, never a source of truth. A client that reconnects
 * refetches, so nothing here needs replay, ordering, or acknowledgement.
 */
export type RealtimeKind =
  | "media.created"
  | "media.thumbnail.ready"
  | "media.updated"
  | "media.deleted"
  | "event.updated";

/**
 * The item projection a browser can insert into a gallery directly. It
 * deliberately carries no URL: a host URL has to be presigned per request, and
 * a guest URL is a stable route the client builds from the event slug.
 */
export type RealtimeMediaItem = {
  id: string;
  mime_type: string;
  created_at: string;
  is_video: boolean;
  has_event_frame: boolean;
  thumbnail_ready: boolean;
  status: EventMediaStatus;
};

export type RealtimeMediaPayload = {
  ids: string[];
  status?: EventMediaStatus;
  item?: RealtimeMediaItem;
  thumbnail_ready?: boolean;
};

export type RealtimeEventPayload = {
  gallery_enabled: boolean;
  event_mode: string;
  status: string;
};

export type RealtimeMessage =
  | { kind: "media.created"; id: string; data: RealtimeMediaPayload }
  | { kind: "media.thumbnail.ready"; id: string; data: RealtimeMediaPayload }
  | { kind: "media.updated"; id: string; data: RealtimeMediaPayload }
  | { kind: "media.deleted"; id: string; data: RealtimeMediaPayload }
  | { kind: "event.updated"; id: string; data: RealtimeEventPayload };

/**
 * `resync` is emitted by the server when a connection fell too far behind and
 * was cut loose. It carries no data: the only correct response is to refetch.
 */
export type RealtimeSignal = "resync";

export type RealtimeStatus = "connecting" | "open" | "closed";

const KNOWN_KINDS: ReadonlySet<string> = new Set<RealtimeKind>([
  "media.created",
  "media.thumbnail.ready",
  "media.updated",
  "media.deleted",
  "event.updated",
]);

/**
 * Parses one SSE frame. Anything unrecognised or malformed yields null rather
 * than throwing: a bad frame must never take the stream down, and a future
 * server may emit kinds this client predates.
 */
export function parseRealtimeMessage(frame: {
  id: string;
  kind: string;
  data: string;
}): RealtimeMessage | null {
  if (!KNOWN_KINDS.has(frame.kind)) return null;

  try {
    const data: unknown = JSON.parse(frame.data);

    if (!data || typeof data !== "object") return null;

    return { kind: frame.kind, id: frame.id, data } as RealtimeMessage;
  } catch {
    return null;
  }
}

const MEDIA_KINDS: ReadonlySet<string> = new Set([
  "media.created",
  "media.thumbnail.ready",
  "media.updated",
  "media.deleted",
]);

export function isMediaMessage(
  message: RealtimeMessage,
): message is Extract<RealtimeMessage, { data: RealtimeMediaPayload }> {
  return MEDIA_KINDS.has(message.kind);
}

/**
 * Converts a realtime item into the shape the galleries already render.
 * `resolveUrl` is supplied by the caller because host and guest resolve media
 * URLs differently.
 */
export function toMediaItem(
  item: RealtimeMediaItem,
  resolveUrl: (id: string) => string,
): EventMediaItem {
  return {
    id: item.id,
    url: resolveUrl(item.id),
    created_at: item.created_at,
    status: item.status,
    is_video: item.is_video,
    has_event_frame: item.has_event_frame,
  };
}
