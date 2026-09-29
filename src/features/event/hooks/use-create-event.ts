import { useMutation, useQueryClient } from "@tanstack/react-query";
import { APIError, privateClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/cache-config";
import type { CandidEvent, EventType } from "../types/event";

export type CreateEventInput = {
  name: string;
  event_type: EventType;
  event_date: string | null;
  date_unknown?: boolean;
  expected_guest_count?: number | null;
};

export type CreateEventResponse = CandidEvent;

/**
 * Mutation hook to create an event on the backend.
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation<CreateEventResponse, Error, CreateEventInput>({
    mutationFn: async (input) => {
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
        return response.data;
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
