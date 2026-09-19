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
  setup_checklist?: EventSetupChecklist;
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
