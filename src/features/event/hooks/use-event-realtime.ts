"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/cache-config";
import { connectEventStream } from "@/lib/event-stream";
import { applyHostRealtimeMessage } from "../lib/realtime-cache";
import {
  parseRealtimeMessage,
  type RealtimeStatus,
} from "../types/event-realtime";

/**
 * An upload burst produces one message per photo. Refetching per message
 * would hammer the API during exactly the moment it is busiest, so refetches
 * are collapsed into one call per window.
 */
const REFETCH_COALESCE_MS = 600;

export type UseEventRealtimeResult = {
  status: RealtimeStatus;
  /** True while the stream is live, so the UI can show a "live" affordance. */
  isLive: boolean;
};

/**
 * Subscribes a host workspace to its event's realtime stream.
 *
 * Mount this once per event. Opening a stream per component would burn
 * through the browser's six-connection limit on HTTP/1.1 and hold several
 * server-side subscriptions for one viewer.
 */
export function useEventRealtime(
  eventId: string | undefined,
): UseEventRealtimeResult {
  const queryClient = useQueryClient();
  // Derived rather than stored: setting state synchronously inside the
  // effect would cascade a render on every connect attempt.
  const [isOpen, setIsOpen] = useState(false);
  const status: RealtimeStatus = !eventId
    ? "closed"
    : isOpen
      ? "open"
      : "connecting";
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refetchMedia = useCallback(
    (immediate = false) => {
      if (!eventId) return;

      const run = () => {
        refetchTimer.current = null;
        void queryClient.invalidateQueries({
          queryKey: ["event", eventId, "media"],
        });
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.event.detail(eventId),
        });
        void queryClient.invalidateQueries({
          queryKey: ["event", eventId, "analytics"],
        });
      };

      if (immediate) {
        if (refetchTimer.current) clearTimeout(refetchTimer.current);
        run();

        return;
      }

      if (refetchTimer.current) return;
      refetchTimer.current = setTimeout(run, REFETCH_COALESCE_MS);
    },
    [eventId, queryClient],
  );

  useEffect(() => {
    if (!eventId) return;

    const controller = new AbortController();

    void connectEventStream({
      url: `/api/v1/events/${encodeURIComponent(eventId)}/stream`,
      mode: "authenticated",
      signal: controller.signal,
      onOpen: () => {
        setIsOpen(true);
        // Anything that changed while this client was away is invisible to
        // it: the stream carries no history. Refetching on every connect is
        // what makes that safe.
        refetchMedia(true);
      },
      onClose: () => setIsOpen(false),
      onResync: () => refetchMedia(true),
      onMessage: (frame) => {
        const message = parseRealtimeMessage(frame);

        if (!message) return;

        const { needsRefetch } = applyHostRealtimeMessage(
          queryClient,
          eventId,
          message,
        );

        if (needsRefetch) refetchMedia();
      },
    });

    return () => {
      controller.abort();

      if (refetchTimer.current) {
        clearTimeout(refetchTimer.current);
        refetchTimer.current = null;
      }
    };
  }, [eventId, queryClient, refetchMedia]);

  return { status, isLive: status === "open" };
}
