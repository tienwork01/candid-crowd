import { useMutation } from "@tanstack/react-query";
import { apiClient, APIError } from "@/lib/api-client";
import type { EventType } from "../types/event";

export type CreateEventInput = {
  name: string;
  event_date: string;
  event_type: EventType;
  expected_guest_count?: number;
};

export type CreateEventResponse = {
  id: string;
  slug?: string;
  public_url?: string;
  guest_url?: string;
};

/**
 * Mutation hook to create an event draft on the backend using TanStack Query & Axios.
 */
export function useCreateEvent() {
  return useMutation<CreateEventResponse, APIError, CreateEventInput>({
    mutationFn: async (input) => {
      const response = await apiClient.post<CreateEventResponse>(
        "/api/v1/events",
        input,
      );

      return response.data;
    },
  });
}
