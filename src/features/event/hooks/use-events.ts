import { useQuery } from "@tanstack/react-query";
import { privateClient } from "@/lib/api-client";
import type { CandidEvent } from "../types/event";
import { getStoredEvents, saveStoredEvent } from "../lib/event-store";

type BackendEvent = {
  id: string;
  host_id: string;
  name: string;
  slug: string;
  event_date: string | null;
  event_type: string;
  expected_guest_count: number;
  status: string;
  gallery_enabled: boolean;
  max_media_bytes: number;
  used_media_bytes: number;
  created_at: string;
  updated_at: string;
};

type EventsResponse = {
  data: BackendEvent[];
};

function normalizeEvent(be: BackendEvent): CandidEvent {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";
  const guestUrl = `${origin}/e/${be.slug}`;

  return {
    id: be.id,
    name: be.name,
    event_type: (be.event_type as CandidEvent["event_type"]) || "Other",
    event_date: be.event_date,
    date_unknown: !be.event_date,
    expected_guest_count: be.expected_guest_count,
    slug: be.slug,
    public_url: guestUrl,
    guest_url: guestUrl,
    qr_destination: guestUrl,
    created_at: be.created_at,
    updated_at: be.updated_at,
    lifecycle_phase: "before",
    setup_checklist: {
      eventCreated: true,
      qrReady: true,
      testedGuestExperience: false,
      addedGuestCount: be.expected_guest_count > 0,
      customizedQr: false,
      customizedPage: false,
    },
  };
}

export function useEvents() {
  return useQuery<CandidEvent[]>({
    queryKey: ["events"],
    queryFn: async () => {
      try {
        const response =
          await privateClient.get<EventsResponse>("/api/v1/events");

        if (response.data?.data) {
          const events = response.data.data.map(normalizeEvent);

          for (const ev of events) {
            saveStoredEvent(ev);
          }

          return events;
        }
      } catch {
        // Backend offline or route issue, fallback to local store
      }

      return Object.values(getStoredEvents());
    },
    initialData: () => Object.values(getStoredEvents()),
  });
}
