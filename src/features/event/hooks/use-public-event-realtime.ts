"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/cache-config";
import { connectEventStream } from "@/lib/event-stream";
import {
  applyGuestRealtimeMessage,
  guestMediaUrl,
} from "../lib/realtime-cache";
import {
  parseRealtimeMessage,
  type RealtimeStatus,
} from "../types/event-realtime";

const REFETCH_COALESCE_MS = 600;

export type UsePublicEventRealtimeResult = {
  status: RealtimeStatus;
  isLive: boolean;
};

/**
 * Subscribes a guest page to its event's public stream.
 *
 * Guests see new photos appear and moderated ones disappear without
 * reloading. The stream is public, matching the public media list, so the
 * browser's own EventSource is used and reconnects on its own.
 */
export function usePublicEventRealtime(
  slug: string | undefined,
  options: {
    enabled?: boolean;
    /**
     * Media the host removed or hid. A guest page that keeps its own copy of
     * just-uploaded items must drop them too, or a moderated photo reappears
     * the moment the two lists are merged.
     */
    onMediaRemoved?: (ids: string[]) => void;
  } = {},
): UsePublicEventRealtimeResult {
  const enabled = options.enabled !== false;
  // Held in a ref so an inline callback cannot become an effect dependency
  // and tear the stream down on every render.
  const onMediaRemoved = useRef(options.onMediaRemoved);

  useEffect(() => {
    onMediaRemoved.current = options.onMediaRemoved;
  }, [options.onMediaRemoved]);

  const queryClient = useQueryClient();
  // Derived rather than stored: setting state synchronously inside the
  // effect would cascade a render on every connect attempt.
  const [isOpen, setIsOpen] = useState(false);
  const status: RealtimeStatus =
    !slug || !enabled ? "closed" : isOpen ? "open" : "connecting";
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refetchMedia = useCallback(
    (immediate = false) => {
      if (!slug) return;

      const run = () => {
        refetchTimer.current = null;
        void queryClient.invalidateQueries({
          queryKey: ["public-event-media", slug],
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
    [queryClient, slug],
  );

  useEffect(() => {
    if (!slug || !enabled) return;

    const controller = new AbortController();

    void connectEventStream({
      url: `/api/v1/public/events/${encodeURIComponent(slug)}/stream`,
      mode: "public",
      signal: controller.signal,
      onOpen: () => {
        setIsOpen(true);
        refetchMedia(true);
      },
      onClose: () => setIsOpen(false),
      onResync: () => refetchMedia(true),
      onMessage: (frame) => {
        const message = parseRealtimeMessage(frame);

        if (!message) return;

        if (message.kind === "event.updated") {
          // The host changed the gallery or the event mode. The guest page
          // reads both from the event record, so refresh that.
          void queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.event.public(slug),
          });

          return;
        }

        if (message.kind === "media.deleted") {
          onMediaRemoved.current?.(message.data.ids);
        }

        const { needsRefetch } = applyGuestRealtimeMessage(
          queryClient,
          slug,
          message,
          (mediaId) => guestMediaUrl(slug, mediaId),
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
  }, [enabled, queryClient, refetchMedia, slug]);

  return { status, isLive: status === "open" };
}
