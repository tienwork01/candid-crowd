import { useMutation, useQueryClient } from "@tanstack/react-query";
import { privateClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/cache-config";
import type { CandidEvent } from "../types/event";
import { updateStoredEvent } from "../lib/event-store";

export type UpdateEventInput = {
  id: string;
  expected_guest_count?: number | null;
  setup_checklist?: Partial<NonNullable<CandidEvent["setup_checklist"]>>;
  lifecycle_phase?: CandidEvent["lifecycle_phase"];
};

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation<CandidEvent | null, Error, UpdateEventInput>({
    mutationFn: async (input) => {
      try {
        const response = await privateClient.patch<CandidEvent>(
          `/api/v1/events/${encodeURIComponent(input.id)}`,
          input,
        );

        if (response.data && response.data.id) {
          updateStoredEvent(input.id, response.data);

          return response.data;
        }
      } catch {
        // Fallback to local store
      }

      const updated = updateStoredEvent(input.id, {
        expected_guest_count: input.expected_guest_count,
        ...(input.setup_checklist
          ? {
              setup_checklist: {
                eventCreated: true,
                qrReady: true,
                testedGuestExperience: false,
                addedGuestCount: false,
                customizedQr: false,
                customizedPage: false,
                ...input.setup_checklist,
              },
            }
          : {}),
        ...(input.lifecycle_phase
          ? { lifecycle_phase: input.lifecycle_phase }
          : {}),
      });

      return updated;
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
