import type {
  CandidEvent,
  EventMediaItem,
  EventMode,
  EventSetupChecklist,
  QRSourceMetric,
} from "../types/event";
import { getEventPublicCode } from "../types/event";
import { siteConfig } from "@/lib/config";

const STORAGE_KEY = "candidcrowd.events.v1";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function generateShortId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().slice(0, 8);
  }

  return Math.random().toString(36).slice(2, 10);
}

export function createInitialChecklist(
  hasGuestCount = false,
): EventSetupChecklist {
  return {
    eventCreated: true,
    qrReady: true,
    testedGuestExperience: false,
    addedGuestCount: hasGuestCount,
    customizedQr: false,
    customizedPage: false,
  };
}

export function createInitialQrSources(): QRSourceMetric[] {
  return [
    {
      id: "src_entrance",
      source: "entrance",
      label: "Welcome Entrance",
      scans_count: 0,
      contributors_count: 0,
      media_count: 0,
    },
    {
      id: "src_table",
      source: "table",
      label: "Dinner Tables",
      scans_count: 0,
      contributors_count: 0,
      media_count: 0,
    },
    {
      id: "src_bar",
      source: "bar",
      label: "Cocktail Bar",
      scans_count: 0,
      contributors_count: 0,
      media_count: 0,
    },
    {
      id: "src_dance_floor",
      source: "dance_floor",
      label: "Dance Floor",
      scans_count: 0,
      contributors_count: 0,
      media_count: 0,
    },
    {
      id: "src_invitation",
      source: "invitation",
      label: "Printed Invitation",
      scans_count: 0,
      contributors_count: 0,
      media_count: 0,
    },
    {
      id: "src_screen",
      source: "screen",
      label: "Live Screen Display",
      scans_count: 0,
      contributors_count: 0,
      media_count: 0,
    },
  ];
}

export function getStoredEvents(): Record<string, CandidEvent> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) return {};

    return JSON.parse(raw) as Record<string, CandidEvent>;
  } catch {
    return {};
  }
}

export function saveStoredEvents(events: Record<string, CandidEvent>): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // Ignore storage quota errors
  }
}

export function getStoredEvent(idOrSlug: string): CandidEvent | null {
  const events = getStoredEvents();

  if (events[idOrSlug]) {
    return events[idOrSlug];
  }

  const normalized = idOrSlug.toUpperCase();
  const found = Object.values(events).find(
    (item) =>
      item.id === idOrSlug ||
      item.slug === idOrSlug ||
      getEventPublicCode(item).toUpperCase() === normalized,
  );

  return found ?? null;
}

export function saveStoredEvent(event: CandidEvent): CandidEvent {
  const events = getStoredEvents();

  events[event.id] = event;
  saveStoredEvents(events);

  return event;
}

export function updateStoredEvent(
  id: string,
  partial: Partial<CandidEvent>,
): CandidEvent | null {
  const existing = getStoredEvent(id);

  if (!existing) return null;

  const updated: CandidEvent = {
    ...existing,
    ...partial,
    updated_at: new Date().toISOString(),
    setup_checklist: {
      ...existing.setup_checklist,
      ...(partial.setup_checklist ?? {}),
    } as EventSetupChecklist,
  };

  return saveStoredEvent(updated);
}

export function updateStoredEventMode(
  id: string,
  mode: EventMode,
): CandidEvent | null {
  return updateStoredEvent(id, { event_mode: mode });
}

export function deleteStoredMediaItem(
  eventId: string,
  mediaId: string,
): CandidEvent | null {
  const existing = getStoredEvent(eventId);

  if (!existing || !existing.media_items) return null;

  const updatedItems = existing.media_items.filter(
    (item) => item.id !== mediaId,
  );
  const photosCount = updatedItems.filter((i) => !i.is_video).length;
  const videosCount = updatedItems.filter((i) => i.is_video).length;

  return updateStoredEvent(eventId, {
    media_items: updatedItems,
    metrics: existing.metrics
      ? {
          ...existing.metrics,
          photos_count: photosCount,
          videos_count: videosCount,
        }
      : undefined,
  });
}

export function batchUpdateStoredMediaStatus(
  eventId: string,
  mediaIds: string[],
  status: EventMediaItem["status"],
): CandidEvent | null {
  const existing = getStoredEvent(eventId);

  if (!existing || !existing.media_items || mediaIds.length === 0) return null;

  const targetSet = new Set(mediaIds);
  const updatedItems = existing.media_items.map((item) => {
    if (targetSet.has(item.id)) {
      return { ...item, status };
    }

    return item;
  });

  return updateStoredEvent(eventId, { media_items: updatedItems });
}

export function batchDeleteStoredMedia(
  eventId: string,
  mediaIds: string[],
): CandidEvent | null {
  const existing = getStoredEvent(eventId);

  if (!existing || !existing.media_items || mediaIds.length === 0) return null;

  const targetSet = new Set(mediaIds);
  const updatedItems = existing.media_items.filter(
    (item) => !targetSet.has(item.id),
  );
  const photosCount = updatedItems.filter((i) => !i.is_video).length;
  const videosCount = updatedItems.filter((i) => i.is_video).length;

  return updateStoredEvent(eventId, {
    media_items: updatedItems,
    metrics: existing.metrics
      ? {
          ...existing.metrics,
          photos_count: photosCount,
          videos_count: videosCount,
        }
      : undefined,
  });
}

export function addStoredMediaItem(
  eventId: string,
  item: EventMediaItem,
): CandidEvent | null {
  const existing = getStoredEvent(eventId);

  if (!existing) return null;

  const currentItems = existing.media_items || [];
  const updatedItems = [item, ...currentItems];
  const photosCount = updatedItems.filter((i) => !i.is_video).length;
  const videosCount = updatedItems.filter((i) => i.is_video).length;
  const contributorsCount = (existing.metrics?.contributors_count || 0) + 1;
  const participationRate = existing.expected_guest_count
    ? Math.min(
        100,
        Math.round((contributorsCount / existing.expected_guest_count) * 100),
      )
    : existing.metrics?.participation_rate || 0;

  return updateStoredEvent(eventId, {
    media_items: updatedItems,
    metrics: existing.metrics
      ? {
          ...existing.metrics,
          photos_count: photosCount,
          videos_count: videosCount,
          contributors_count: contributorsCount,
          participation_rate: participationRate,
        }
      : undefined,
  });
}

export function createLocalEvent(input: {
  name: string;
  event_type: CandidEvent["event_type"];
  event_date: string | null;
  date_unknown: boolean;
  expected_guest_count?: number | null;
}): CandidEvent {
  const id = `evt_${generateShortId()}`;
  const baseSlug = slugify(input.name) || "event";
  const slug = `${baseSlug}-${generateShortId()}`;
  const now = new Date().toISOString();

  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : siteConfig.appUrl;

  const guestUrl = `${origin}/e/${slug}`;
  const publicUrl = `/e/${slug}`;

  const event: CandidEvent = {
    id,
    name: input.name.trim(),
    event_type: input.event_type,
    event_date: input.date_unknown ? null : input.event_date,
    date_unknown: input.date_unknown,
    expected_guest_count: input.expected_guest_count ?? null,
    slug,
    public_url: publicUrl,
    guest_url: guestUrl,
    qr_destination: guestUrl,
    created_at: now,
    updated_at: now,
    lifecycle_phase: "before",
    event_mode: "social",
    gallery_enabled: true,
    setup_checklist: createInitialChecklist(
      Boolean(input.expected_guest_count),
    ),
    media_items: [],
    qr_sources: createInitialQrSources(),
    metrics: {
      scans_count: 0,
      visitors_count: 0,
      contributors_count: 0,
      photos_count: 0,
      videos_count: 0,
      participation_rate: 0,
    },
  };

  return saveStoredEvent(event);
}
