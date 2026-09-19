import type {
  CandidEvent,
  EventMediaItem,
  EventMode,
  EventSetupChecklist,
  QRSourceMetric,
} from "../types/event";
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
    testedGuestExperience: true,
    addedGuestCount: hasGuestCount,
    customizedQr: false,
    customizedPage: false,
  };
}

export function createDefaultQrSources(): QRSourceMetric[] {
  return [
    {
      id: "src_entrance",
      source: "entrance",
      label: "Welcome Entrance",
      scans_count: 72,
      contributors_count: 28,
      media_count: 46,
    },
    {
      id: "src_table",
      source: "table",
      label: "Dinner Tables",
      scans_count: 134,
      contributors_count: 52,
      media_count: 112,
    },
    {
      id: "src_bar",
      source: "bar",
      label: "Cocktail Bar",
      scans_count: 64,
      contributors_count: 24,
      media_count: 58,
    },
    {
      id: "src_dance_floor",
      source: "dance_floor",
      label: "Dance Floor",
      scans_count: 48,
      contributors_count: 19,
      media_count: 64,
    },
    {
      id: "src_invitation",
      source: "invitation",
      label: "Printed Invitation",
      scans_count: 32,
      contributors_count: 12,
      media_count: 18,
    },
    {
      id: "src_screen",
      source: "screen",
      label: "Live Screen Display",
      scans_count: 26,
      contributors_count: 9,
      media_count: 20,
    },
  ];
}

export function createDefaultSampleMedia(): EventMediaItem[] {
  return [
    {
      id: "med_1",
      url: "/images/wedding-embrace.webp",
      caption: "First look by the quiet olive grove",
      guest_name: "Marcus & Elena",
      created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      qr_source: "entrance",
      status: "featured",
      is_video: false,
      likes_count: 24,
    },
    {
      id: "med_2",
      url: "/images/wedding-ceremony.webp",
      caption: "Heartfelt vows under the stone archway",
      guest_name: "Aunt Claire",
      created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      qr_source: "table",
      status: "ready",
      is_video: false,
      likes_count: 18,
    },
    {
      id: "med_3",
      url: "/images/celebration.jpg",
      caption: "A joyful toast with everyone together!",
      guest_name: "Oliver & Maya",
      created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      qr_source: "bar",
      status: "ready",
      is_video: false,
      likes_count: 32,
    },
    {
      id: "med_4",
      url: "/images/wedding-sunset.webp",
      caption: "Golden hour golden light across the hills",
      guest_name: "Sophie T.",
      created_at: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
      qr_source: "table",
      status: "featured",
      is_video: false,
      likes_count: 41,
    },
    {
      id: "med_5",
      url: "/images/couple.jpg",
      caption: "The quiet moments in between",
      guest_name: "Lucas P.",
      created_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
      qr_source: "entrance",
      status: "ready",
      is_video: false,
      likes_count: 15,
    },
    {
      id: "med_6",
      url: "/images/moment.jpg",
      caption: "Spontaneous laughter across the tables",
      guest_name: "David K.",
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      qr_source: "table",
      status: "ready",
      is_video: false,
      likes_count: 29,
    },
    {
      id: "med_7",
      url: "/images/flowers.jpg",
      caption: "Wild meadow flowers and place cards",
      guest_name: "Hannah W.",
      created_at: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
      qr_source: "table",
      status: "ready",
      is_video: false,
      likes_count: 12,
    },
    {
      id: "med_8",
      url: "/images/wedding-meadow.webp",
      caption: "Walking toward the reception dinner",
      guest_name: "Grandma Rose",
      created_at: new Date(Date.now() - 1000 * 60 * 190).toISOString(),
      qr_source: "dance_floor",
      status: "ready",
      is_video: false,
      likes_count: 27,
    },
    {
      id: "med_9",
      url: "/images/table.jpg",
      caption: "Candlelight dinner conversation",
      guest_name: "Uncle James",
      created_at: new Date(Date.now() - 1000 * 60 * 220).toISOString(),
      qr_source: "table",
      status: "ready",
      is_video: false,
      likes_count: 9,
    },
    {
      id: "med_10",
      url: "/images/venue.jpg",
      caption: "Before everyone arrived at dusk",
      guest_name: "CandidCrowd Team",
      created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
      qr_source: "entrance",
      status: "ready",
      is_video: false,
      likes_count: 14,
    },
  ];
}

function createSampleEvent(): CandidEvent {
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : siteConfig.appUrl;

  const slug = "emma-lucas-wedding";
  const guestUrl = `${origin}/e/${slug}`;

  return {
    id: "evt_demo_wedding",
    name: "Emma & Lucas's Wedding",
    event_type: "Wedding",
    event_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    date_unknown: false,
    expected_guest_count: 120,
    slug,
    public_url: `/e/${slug}`,
    guest_url: guestUrl,
    qr_destination: guestUrl,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updated_at: new Date().toISOString(),
    lifecycle_phase: "during",
    event_mode: "social",
    gallery_enabled: true,
    setup_checklist: {
      eventCreated: true,
      qrReady: true,
      testedGuestExperience: true,
      addedGuestCount: true,
      customizedQr: true,
      customizedPage: true,
    },
    media_items: createDefaultSampleMedia(),
    qr_sources: createDefaultQrSources(),
    metrics: {
      scans_count: 376,
      visitors_count: 184,
      contributors_count: 88,
      photos_count: 318,
      videos_count: 24,
      participation_rate: 73,
    },
  };
}

export function getStoredEvents(): Record<string, CandidEvent> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      const demo = createSampleEvent();
      const initial: Record<string, CandidEvent> = { [demo.id]: demo };

      saveStoredEvents(initial);

      return initial;
    }

    const parsed = JSON.parse(raw) as Record<string, CandidEvent>;

    // If empty object in storage, seed default event
    if (Object.keys(parsed).length === 0) {
      const demo = createSampleEvent();

      parsed[demo.id] = demo;
      saveStoredEvents(parsed);
    }

    return parsed;
  } catch {
    const demo = createSampleEvent();

    return { [demo.id]: demo };
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

  const found = Object.values(events).find(
    (item) => item.id === idOrSlug || item.slug === idOrSlug,
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

export function toggleStoredMediaStatus(
  eventId: string,
  mediaId: string,
): CandidEvent | null {
  const existing = getStoredEvent(eventId);

  if (!existing || !existing.media_items) return null;

  const updatedItems = existing.media_items.map((item) => {
    if (item.id === mediaId) {
      const nextStatus = item.status === "hidden" ? "ready" : "hidden";

      return { ...item, status: nextStatus as EventMediaItem["status"] };
    }

    return item;
  });

  return updateStoredEvent(eventId, { media_items: updatedItems });
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

  return updateStoredEvent(eventId, {
    media_items: updatedItems,
    metrics: existing.metrics
      ? {
          ...existing.metrics,
          photos_count: photosCount,
          videos_count: videosCount,
          contributors_count: (existing.metrics.contributors_count || 0) + 1,
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
    media_items: createDefaultSampleMedia(),
    qr_sources: createDefaultQrSources(),
    metrics: {
      scans_count: 12,
      visitors_count: 8,
      contributors_count: 4,
      photos_count: 10,
      videos_count: 0,
      participation_rate: input.expected_guest_count
        ? Math.round((4 / input.expected_guest_count) * 100)
        : 10,
    },
  };

  return saveStoredEvent(event);
}
