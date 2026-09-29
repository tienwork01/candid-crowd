import { useMutation, useQueryClient } from "@tanstack/react-query";
import { privateClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/cache-config";
import type { CandidEvent } from "../types/event";

export type UpdateEventInput = {
  id: string;
  name?: string;
  event_type?: CandidEvent["event_type"];
  event_date?: string | null;
  date_unknown?: boolean;
  expected_guest_count?: number | null;
  gallery_enabled?: boolean;
  event_mode?: CandidEvent["event_mode"];
  guest_theme?: CandidEvent["guest_theme"];
  qr_config?: CandidEvent["qr_config"];
  setup_checklist?: Partial<NonNullable<CandidEvent["setup_checklist"]>>;
  lifecycle_phase?: CandidEvent["lifecycle_phase"];
  candid_camera_enabled?: boolean;
};

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation<CandidEvent, Error, UpdateEventInput>({
    mutationFn: async (input) => {
      const { id, date_unknown, event_date, ...updates } = input;
      const response = await privateClient.patch<CandidEvent>(
        `/api/v1/events/${encodeURIComponent(id)}`,
        {
          ...updates,
          ...(event_date !== undefined ? { event_date } : {}),
          ...(date_unknown || event_date === null
            ? { clear_event_date: true }
            : {}),
        },
      );

      if (!response.data?.id) {
        throw new Error("event_update_invalid_response");
      }

      return response.data;
    },
    onSuccess: (data, variables) => {
      if (data) {
        queryClient.setQueryData(QUERY_KEYS.event.detail(variables.id), data);

        if (data.slug) {
          queryClient.setQueryData(QUERY_KEYS.event.detail(data.slug), data);
        }
      }

      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.event.detail(variables.id),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.event.all,
      });
    },
  });
}
