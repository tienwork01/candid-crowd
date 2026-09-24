export const eventTypes = [
  "Wedding",
  "Birthday",
  "Anniversary",
  "Graduation",
  "Baby Shower",
  "Reunion",
  "Party",
  "Corporate",
  "Conference",
  "Other",
] as const;

export type EventType = (typeof eventTypes)[number];

export type EventSetupChecklist = {
  eventCreated: boolean;
  qrReady: boolean;
  testedGuestExperience: boolean;
  addedGuestCount: boolean;
  customizedQr: boolean;
  customizedPage: boolean;
};

export type EventLifecyclePhase = "before" | "during" | "after";

export const eventModes = [
  "silent",
  "soft",
  "social",
  "party",
  "after",
] as const;

export type EventMode = (typeof eventModes)[number];

export type EventMediaStatus = "ready" | "hidden" | "featured";

export type EventMediaItem = {
  id: string;
  url: string;
  thumbnail_url?: string;
  caption?: string;
  guest_name?: string;
  created_at: string;
  qr_source?:
    | "entrance"
    | "table"
    | "bar"
    | "dance_floor"
    | "screen"
    | "invitation"
    | "direct";
  status: EventMediaStatus;
  is_video?: boolean;
  likes_count?: number;
  width?: number;
  height?: number;
};

export type QRSourceType =
  "entrance" | "table" | "bar" | "dance_floor" | "screen" | "invitation";

export type QRSourceMetric = {
  id: string;
  source: QRSourceType;
  label: string;
  scans_count: number;
  contributors_count: number;
  media_count: number;
};

export type CandidEvent = {
  id: string;
  name: string;
  event_type: EventType;
  event_date: string | null;
  date_unknown: boolean;
  expected_guest_count?: number | null;
  slug: string;
  public_url: string;
  guest_url: string;
  qr_destination: string;
  created_at: string;
  updated_at: string;
  lifecycle_phase?: EventLifecyclePhase;
  event_mode?: EventMode;
  gallery_enabled?: boolean;
  candid_camera_enabled?: boolean;
  setup_checklist?: EventSetupChecklist;
  guest_theme?: import("../components/guest-theme/guest-theme-types").GuestThemeConfig;
  media_items?: EventMediaItem[];
  qr_sources?: QRSourceMetric[];
  // Metrics summary for overview
  metrics?: {
    scans_count: number;
    visitors_count: number;
    contributors_count: number;
    photos_count: number;
    videos_count: number;
    participation_rate: number;
  };
};

export type EventDraft = {
  id: string;
  name: string;
  date: string;
  type: EventType;
  expectedGuests: number;
  createdAt: string;
};

export type EventLifecycleStatus = "upcoming" | "live" | "ended";

/**
 * Derive the lifecycle status from the event date.
 * - "upcoming" if the event date is in the future (more than 0 days away)
 * - "live" if the event date is today
 * - "ended" if the event date is in the past
 * - Falls back to lifecycle_phase if no date is set
 */
export function getEventLifecycleStatus(
  event: CandidEvent,
): EventLifecycleStatus {
  if (!event.event_date) {
    // No date — infer from lifecycle_phase if set
    if (event.lifecycle_phase === "before") return "upcoming";
    if (event.lifecycle_phase === "after") return "ended";

    return "live";
  }

  const eventDate = new Date(event.event_date);
  const now = new Date();

  // Normalise to date-only comparisons
  const eventDay = new Date(
    eventDate.getFullYear(),
    eventDate.getMonth(),
    eventDate.getDate(),
  );
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (eventDay.getTime() > today.getTime()) return "upcoming";
  if (eventDay.getTime() === today.getTime()) return "live";

  return "ended";
}

/**
 * Derives a clean, stable public event code (e.g. "CB0449")
 * ensuring internal database IDs (like "evt_...") are never exposed.
 */
export function getEventPublicCode(event: {
  id?: string;
  slug?: string;
  name?: string;
}): string {
  // If the event already has an explicit short code (<= 8 chars alphanumeric)
  if (
    event.slug &&
    !event.slug.startsWith("evt_") &&
    event.slug.length <= 8 &&
    /^[A-Za-z0-9]+$/.test(event.slug)
  ) {
    return event.slug.toUpperCase();
  }

  // Derive a deterministic, stable 6-character uppercase code (like "CB0449")
  const seed = (event.id || event.slug || event.name || "candid").replace(
    /^evt_/,
    "",
  );
  let hash = 5381;

  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash) ^ seed.charCodeAt(i);
  }

  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  let val = Math.abs(hash);

  for (let i = 0; i < 6; i++) {
    code += charset[val % charset.length];
    val =
      Math.floor(val / charset.length) + seed.charCodeAt(i % seed.length) * 31;
  }

  return code;
}
