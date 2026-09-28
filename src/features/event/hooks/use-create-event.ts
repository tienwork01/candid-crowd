import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  APIError,
  isBackendUnreachable,
  privateClient,
} from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/cache-config";
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
 * Mutation hook to create an event on the backend, with a local persistence
 * fallback for the offline/no-backend case only.
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

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

        if (response.data?.id) {
          saveStoredEvent(response.data);

          return response.data;
        }
      } catch (error) {
        if (!isBackendUnreachable(error)) {
          // Surface it. Swallowing this is how a misconfigured backend (an
          // expired token, an unreachable JWKS URL) turns into an event that
          // only ever works on the host's own machine.
          console.error("[create-event] backend rejected the request", error);

          throw error;
        }

        console.warn(
          "[create-event] backend unreachable, creating a local-only event",
          error,
        );

        return createLocalEvent({
          name: input.name,
          event_type: input.event_type,
          event_date: input.event_date,
          date_unknown: Boolean(input.date_unknown),
          expected_guest_count: input.expected_guest_count,
        });
      }

      throw new APIError(
        502,
        "request_failed",
        "Event was created but the API returned no event id.",
      );
    },
    onSuccess: (data) => {
      if (data?.id) {
        queryClient.setQueryData(QUERY_KEYS.event.detail(data.id), data);

        if (data.slug) {
          queryClient.setQueryData(QUERY_KEYS.event.detail(data.slug), data);
        }
      }

      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.event.all,
      });
    },
  });
}
