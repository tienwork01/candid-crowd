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
  setup_checklist?: EventSetupChecklist;
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
