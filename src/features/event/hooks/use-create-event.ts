import { useMutation } from "@tanstack/react-query";
import { privateClient } from "@/lib/api-client";
import type { CandidEvent, EventType } from "../types/event";
import { createLocalEvent, saveStoredEvent } from "../lib/event-store";

export type CreateEventInput = {
  name: string;
  event_type: EventType;
  event_date: string | null;
  date_unknown?: boolean;
  expected_guest_count?: number | null;
};

export type CreateEventResponse = CandidEvent;

/**
 * Mutation hook to create an event. Tries remote backend API first,
 * with seamless local persistence fallback for resilience.
 */
export function useCreateEvent() {
  return useMutation<CreateEventResponse, Error, CreateEventInput>({
    mutationFn: async (input) => {
      try {
        const response = await privateClient.post<CreateEventResponse>(
          "/api/v1/events",
          {
            name: input.name.trim(),
            event_type: input.event_type,
            event_date: input.date_unknown ? null : input.event_date,
            expected_guest_count: input.expected_guest_count ?? undefined,
          },
        );

        if (response.data && response.data.id) {
          saveStoredEvent(response.data);

          return response.data;
        }
      } catch {
        // Fallback to local store when backend is unavailable or not yet configured
      }

      const localEvent = createLocalEvent({
        name: input.name,
        event_type: input.event_type,
        event_date: input.event_date,
        date_unknown: Boolean(input.date_unknown),
        expected_guest_count: input.expected_guest_count,
      });

      return localEvent;
    },
  });
}
