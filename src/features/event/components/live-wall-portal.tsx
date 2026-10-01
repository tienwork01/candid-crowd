"use client";

import { useEffect, useRef, useState } from "react";
import type {
  LiveWallPortalPhoto,
  LiveWallPortalRenderer,
} from "./live-wall-portal-renderer";

export type { LiveWallPortalPhoto } from "./live-wall-portal-renderer";

export function LiveWallPortal({
  photos,
  focusedId,
  active,
}: {
  photos: LiveWallPortalPhoto[];
  focusedId: string;
  active: boolean;
}) {
  const portalRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<LiveWallPortalRenderer | null>(null);
  const latestRef = useRef({ photos, focusedId, active });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    latestRef.current = { photos, focusedId, active };
    void rendererRef.current
      ?.sync(photos, focusedId, active)
      .catch(() => setReady(false));
  }, [active, focusedId, photos]);

  useEffect(() => {
    const portal = portalRef.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const device = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    let cancelled = false;

    if (
      !portal ||
      media.matches ||
      device.connection?.saveData ||
      (device.deviceMemory !== undefined && device.deviceMemory <= 2) ||
      navigator.hardwareConcurrency <= 2
    ) {
      return;
    }

    void import("./live-wall-portal-renderer")
      .then(({ createLiveWallPortalRenderer }) => {
        if (cancelled || media.matches) return;

        const renderer = createLiveWallPortalRenderer(portal);

        rendererRef.current = renderer;

        const latest = latestRef.current;

        return renderer
          .sync(latest.photos, latest.focusedId, latest.active)
          .then(() => {
            if (!cancelled) setReady(true);
          });
      })
      .catch(() => setReady(false));

    return () => {
      cancelled = true;
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, []);

  return (
    <div
      ref={portalRef}
      className="live-wall-player__portal"
      data-ready={ready || undefined}
      aria-hidden="true"
    />
  );
}
