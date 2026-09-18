import type { CandidEvent, EventSetupChecklist } from "../types/event";

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
      : "https://candidcrowd.com";

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
    setup_checklist: createInitialChecklist(
      Boolean(input.expected_guest_count),
    ),
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
