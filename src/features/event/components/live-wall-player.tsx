"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, RefObject, SyntheticEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { toDataURL } from "qrcode";
import { publicClient } from "@/lib/api-client";
import { connectEventStream } from "@/lib/event-stream";
import type { GuestThemeConfig } from "./guest-theme";
import { LiveWallPortal, type LiveWallPortalPhoto } from "./live-wall-portal";
import "./event.css";

type PlayerMedia = {
  id: string;
  url: string;
  thumbnail_url?: string;
  dominant_color?: string;
  is_video?: boolean;
  status: "ready" | "featured" | "hidden";
};

type Presentation = {
  status?: "live" | "ended" | "revoked";
  is_playing: boolean;
  show_cta: boolean;
  is_blackout: boolean;
  revision: number;
  content_policy?: "featured_only" | "auto_approved";
  cta_every_media?: number;
  layout_mode?: "spotlight" | "mosaic" | "featured";
  slide_duration_seconds?: number;
  qr_strategy?: "interval" | "always" | "empty_only" | "hidden";
  arrival_behavior?: "queue" | "next";
  transition_mode?: "classic" | "cinematic" | "float_3d" | "flash";
};

type PresentationMessage = Partial<Presentation> & {
  command?: "next" | "previous";
};

type StreamStatus = "live" | "reconnecting";

type PlayerPayload = {
  event: {
    name: string;
    slug: string;
    guest_theme?: GuestThemeConfig | null;
  };
  data: PlayerMedia[];
  page: { next_cursor?: string; has_more?: boolean };
  presentation?: Presentation;
};

type LiveWallInvitationProps = {
  eventName: string;
  qrDataUrl: string;
  isFinalSlide: boolean;
  title: string;
  description: string;
};

const defaultPresentation: Presentation = {
  status: "live",
  is_playing: true,
  show_cta: false,
  is_blackout: false,
  revision: 0,
};

const PAGE_SIZE = 24;
const PREFETCH_REMAINING = 5;
const DEFAULT_CTA_EVERY_MEDIA = 8;
const CTA_DURATION_MS = 8_000;

function mergeMedia(existing: PlayerMedia[], incoming: PlayerMedia[]) {
  const known = new Set(existing.map((item) => item.id));

  return [...existing, ...incoming.filter((item) => !known.has(item.id))];
}

function getLiveWallThemeStyles(
  theme: GuestThemeConfig | null | undefined,
): CSSProperties | undefined {
  const primary = theme?.primaryColor?.trim();

  // Only accept a mid-luminance hex accent. Very dark/light custom colors
  // disappear on an ink projector canvas, so the safe champagne default wins.
  if (!primary || !/^#[0-9a-f]{6}$/i.test(primary)) return undefined;

  const [red, green, blue] = [1, 3, 5].map((index) =>
    Number.parseInt(primary.slice(index, index + 2), 16),
  );
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;

  if (luminance < 0.22 || luminance > 0.88) return undefined;

  return { ["--live-wall-accent" as string]: primary };
}

function getPresentationEventName(
  event: PlayerPayload["event"] | undefined,
  fallback: string,
) {
  return (
    event?.guest_theme?.eventTitleOverride?.trim() || event?.name || fallback
  );
}

function getMediaRequestURL(url: string, attempt: number) {
  if (attempt === 0) return url;

  const separator = url.includes("?") ? "&" : "?";

  // The content endpoint produces a fresh short-lived storage URL on every
  // request. This cache-busting query is intentionally ignored by the API and
  // forces the browser to make that second request rather than reuse an error.
  return `${url}${separator}retry=${attempt}`;
}

function getCTAEveryMedia(value: number | undefined) {
  if (!Number.isInteger(value) || !value || value < 3 || value > 30) {
    return DEFAULT_CTA_EVERY_MEDIA;
  }

  return value;
}

function getSlideDuration(value: number | undefined) {
  return value && value >= 5 && value <= 12 ? value : 5;
}

function LiveWallInvitation({
  eventName,
  qrDataUrl,
  isFinalSlide,
  title,
  description,
}: LiveWallInvitationProps) {
  return (
    <div className="live-wall-player__invitation">
      <p className="live-wall-player__eyebrow">{eventName}</p>
      <div className="live-wall-player__qr-frame" aria-busy={!qrDataUrl}>
        {qrDataUrl ? (
          // QR data URLs are generated locally and must bypass optimization.
          // eslint-disable-next-line @next/next/no-img-element
          <img className="live-wall-player__qr" src={qrDataUrl} alt="" />
        ) : (
          <span className="live-wall-player__qr-loading" aria-hidden="true" />
        )}
      </div>
      <div className="live-wall-player__invitation-copy">
        {isFinalSlide && <h1>{title}</h1>}
        <p>{description}</p>
      </div>
    </div>
  );
}

function LiveWallStage({
  item,
  cloudItems,
  eventName,
  isPlaying,
  videoRef,
  onVideoEnded,
  onMediaError,
  onImageLoaded,
  isPortrait,
  retryAttempt,
  transitionMode = "cinematic",
  qrBadgeUrl,
  qrBadgeLabel,
}: {
  item: PlayerMedia;
  cloudItems: PlayerMedia[];
  eventName: string;
  isPlaying: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  onVideoEnded: () => void;
  onMediaError: (mediaID: string) => void;
  onImageLoaded: (
    mediaID: string,
    event: SyntheticEvent<HTMLImageElement>,
  ) => void;
  isPortrait: boolean;
  retryAttempt: number;
  transitionMode?: "classic" | "cinematic" | "float_3d" | "flash";
  qrBadgeUrl?: string;
  qrBadgeLabel?: string;
}) {
  const reduceMotion = useReducedMotion();
  const showBackdrop = !item.is_video && isPortrait;
  const mediaURL = getMediaRequestURL(item.url, retryAttempt);
  const cloudPhotos = useMemo<LiveWallPortalPhoto[]>(
    () =>
      cloudItems
        .filter((media) => !media.is_video)
        .map((media) => ({
          id: media.id,
          url:
            media.id === item.id ? mediaURL : media.thumbnail_url || media.url,
          focusUrl: media.id === item.id ? mediaURL : media.url,
          dominantColor: media.dominant_color,
        })),
    [cloudItems, item.id, mediaURL],
  );
  const transition = reduceMotion
    ? { duration: 0 }
    : item.is_video
      ? { duration: 0.48, ease: [0.22, 1, 0.36, 1] as const }
      : transitionMode === "classic"
        ? { duration: 0.28, ease: "easeOut" as const }
        : transitionMode === "flash"
          ? { duration: 0.46, ease: [0.16, 1, 0.3, 1] as const }
          : { type: "spring" as const, stiffness: 185, damping: 23, mass: 0.8 };

  return (
    <div
      className="live-wall-player__media-stage"
      data-portrait={showBackdrop || undefined}
      data-transition={transitionMode}
    >
      {showBackdrop && (
        <div className="live-wall-player__backdrop-frame" aria-hidden="true">
          {/* Decorative duplicate: foreground media remains uncropped and
              carries the accessible alternative text. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="live-wall-player__backdrop" src={mediaURL} alt="" />
        </div>
      )}
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={`${item.id}-${retryAttempt}`}
          className={`live-wall-player__media-shell${item.is_video ? " live-wall-player__media-shell--video" : ""}`}
          data-transition={transitionMode}
          initial={
            reduceMotion
              ? { opacity: 1 }
              : transitionMode === "flash"
                ? { opacity: 0, scale: 1.035, filter: "brightness(2.4)" }
                : transitionMode === "classic"
                  ? { opacity: 0 }
                  : transitionMode === "float_3d"
                    ? {
                        opacity: 0,
                        scale: 0.94,
                        rotateX: 8,
                        rotateY: -3,
                      }
                    : {
                        opacity: 0,
                        y: 72,
                        scale: 0.925,
                        rotateX: 5,
                        rotateZ: -1.4,
                      }
          }
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            filter: "brightness(1)",
          }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : transitionMode === "classic"
                ? { opacity: 0 }
                : transitionMode === "flash"
                  ? { opacity: 0, scale: 1.01, filter: "brightness(1.8)" }
                  : transitionMode === "float_3d"
                    ? { opacity: 0, scale: 1.035, rotateY: 4, rotateX: -3 }
                    : {
                        opacity: 0,
                        y: -28,
                        scale: 1.025,
                        rotateX: -1,
                        rotateZ: 0.7,
                      }
          }
          transition={transition}
          style={{ transformPerspective: 1600 }}
        >
          {item.is_video ? (
            <video
              ref={videoRef}
              src={mediaURL}
              autoPlay={isPlaying}
              muted
              playsInline
              preload="metadata"
              onEnded={onVideoEnded}
              onError={() => onMediaError(item.id)}
              className="live-wall-player__media live-wall-player__media--video"
            />
          ) : (
            // Signed media URLs must bypass the Next image optimizer.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaURL}
              alt={eventName}
              onLoad={(event) => onImageLoaded(item.id, event)}
              onError={() => onMediaError(item.id)}
              className="live-wall-player__media live-wall-player__media--image"
            />
          )}
        </motion.div>
      </AnimatePresence>
      {transitionMode === "float_3d" && !reduceMotion && !item.is_video && (
        <LiveWallPortal
          photos={cloudPhotos}
          focusedId={item.id}
          active={isPlaying}
        />
      )}
      {qrBadgeUrl && (
        <aside
          className="live-wall-player__corner-badge"
          aria-label={qrBadgeLabel || eventName}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrBadgeUrl}
            alt=""
            className="live-wall-player__corner-qr"
          />
          {qrBadgeLabel && (
            <span className="live-wall-player__corner-label">
              {qrBadgeLabel}
            </span>
          )}
        </aside>
      )}
    </div>
  );
}

function LiveWallMosaic({
  items,
  eventName,
  qrBadgeUrl,
  qrBadgeLabel,
}: {
  items: PlayerMedia[];
  eventName: string;
  qrBadgeUrl?: string;
  qrBadgeLabel?: string;
}) {
  return (
    <div
      className="live-wall-player__mosaic"
      aria-label={eventName}
      data-count={Math.min(items.length, 12)}
    >
      {items.slice(0, 12).map((item) => (
        <div className="live-wall-player__mosaic-tile" key={item.id}>
          {/* Thumbnail variants keep party mode fast on venue Wi-Fi. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.thumbnail_url || item.url}
            alt=""
            className="live-wall-player__mosaic-image"
          />
        </div>
      ))}
      {qrBadgeUrl && (
        <aside
          className="live-wall-player__corner-badge"
          aria-label={qrBadgeLabel || eventName}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrBadgeUrl}
            alt=""
            className="live-wall-player__corner-qr"
          />
          {qrBadgeLabel && (
            <span className="live-wall-player__corner-label">
              {qrBadgeLabel}
            </span>
          )}
        </aside>
      )}
    </div>
  );
}

export function LiveWallPlayer({ token }: { token: string }) {
  const t = useTranslations("event");
  const [payload, setPayload] = useState<PlayerPayload | null>(null);
  const [playlist, setPlaylist] = useState<PlayerMedia[]>([]);
  const [index, setIndex] = useState(0);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [portraitMediaID, setPortraitMediaID] = useState<string | null>(null);
  const [completedAutoCTAIndex, setCompletedAutoCTAIndex] = useState(-1);
  const [failedMediaIDs, setFailedMediaIDs] = useState<Set<string>>(
    () => new Set(),
  );
  const [mediaRetryAttempts, setMediaRetryAttempts] = useState<
    Map<string, number>
  >(() => new Map());
  const mediaRetryAttemptsRef = useRef<Map<string, number>>(new Map());
  const [streamStatus, setStreamStatus] =
    useState<StreamStatus>("reconnecting");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const currentMediaIDRef = useRef<string | null>(null);
  const nextCursorRef = useRef<string | null>(null);
  const hasMoreRef = useRef(false);
  const hasSnapshotRef = useRef(false);
  const fetchingPageRef = useRef(false);

  const requestURL = useCallback(
    (cursor?: string) => {
      const query = new URLSearchParams({ limit: String(PAGE_SIZE) });

      if (cursor) query.set("cursor", cursor);

      return `/api/v1/public/live-wall-sessions/${encodeURIComponent(token)}?${query.toString()}`;
    },
    [token],
  );

  const applySnapshot = useCallback(
    (response: PlayerPayload, resetPlaylist: boolean) => {
      setPayload((current) => ({
        ...response,
        presentation: {
          ...defaultPresentation,
          ...current?.presentation,
          ...response.presentation,
        },
      }));
      setPlaylist((existing) => {
        // Initial load: populate playlist and initialize pagination cursor
        if (!hasSnapshotRef.current) {
          const currentID = currentMediaIDRef.current;
          const currentIndex = currentID
            ? response.data.findIndex((item) => item.id === currentID)
            : -1;

          setIndex(currentIndex >= 0 ? currentIndex : 0);

          return response.data;
        }

        // Moderation / Policy update (resetPlaylist = true)
        if (resetPlaylist) {
          const incomingMap = new Map(
            response.data.map((item) => [item.id, item]),
          );
          const isFeaturedOnly =
            response.presentation?.content_policy === "featured_only";

          // Update existing media with incoming changes, while filtering out
          // media that have become hidden or ineligible under the active policy.
          const updated = existing
            .map((item) => incomingMap.get(item.id) ?? item)
            .filter((item) => {
              if (item.status === "hidden") return false;
              if (isFeaturedOnly && item.status !== "featured") return false;

              return true;
            });

          // Also merge any new incoming media not already in the existing list
          const existingIDs = new Set(updated.map((item) => item.id));
          const newItems = response.data.filter(
            (item) =>
              !existingIDs.has(item.id) &&
              item.status !== "hidden" &&
              (!isFeaturedOnly || item.status === "featured"),
          );

          const merged = [...newItems, ...updated];

          // Retain the current viewing position if the active item is still eligible.
          // This prevents the screen from jumping back to slide 0 when moderating items past page 1.
          const currentID = currentMediaIDRef.current;
          const newCurrentIndex = currentID
            ? merged.findIndex((item) => item.id === currentID)
            : -1;

          if (newCurrentIndex >= 0) {
            setIndex(newCurrentIndex);
          } else {
            setIndex((prev) => Math.min(prev, Math.max(0, merged.length - 1)));
          }

          return merged;
        }

        const fresh = response.data.filter(
          (item) => !existing.some((known) => known.id === item.id),
        );

        if (
          fresh.length &&
          response.presentation?.arrival_behavior === "next" &&
          currentMediaIDRef.current
        ) {
          const currentIndex = existing.findIndex(
            (item) => item.id === currentMediaIDRef.current,
          );

          if (currentIndex >= 0) {
            return [
              ...existing.slice(0, currentIndex + 1),
              ...fresh,
              ...existing.slice(currentIndex + 1),
            ];
          }
        }

        return mergeMedia(existing, response.data);
      });

      if (!hasSnapshotRef.current) {
        hasSnapshotRef.current = true;
        nextCursorRef.current = response.page.next_cursor ?? null;
        hasMoreRef.current = Boolean(response.page.has_more);
      }
    },
    [],
  );

  const loadSnapshot = useCallback(
    async (resetPlaylist = false) => {
      try {
        const response = await publicClient.get<PlayerPayload>(requestURL());

        applySnapshot(response.data, resetPlaylist);
      } catch {
        // Keep the last valid frame on screen during a transient network loss.
      }
    },
    [applySnapshot, requestURL],
  );

  const fetchNextPage = useCallback(async () => {
    const cursor = nextCursorRef.current;

    if (!hasMoreRef.current || !cursor || fetchingPageRef.current) return;

    fetchingPageRef.current = true;

    try {
      const response = await publicClient.get<PlayerPayload>(
        requestURL(cursor),
      );

      setPayload((current) =>
        current
          ? {
              ...current,
              presentation: {
                ...defaultPresentation,
                ...current.presentation,
                ...response.data.presentation,
              },
            }
          : response.data,
      );
      setPlaylist((current) => mergeMedia(current, response.data.data));
      nextCursorRef.current = response.data.page.next_cursor ?? null;
      hasMoreRef.current = Boolean(response.data.page.has_more);
    } finally {
      fetchingPageRef.current = false;
    }
  }, [requestURL]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadSnapshot(true), 0);
    // A slow snapshot remains as recovery when an SSE event is missed. Merge
    // here so Party mode keeps its "new photo is next" promise even after a
    // brief realtime interruption.
    const timer = window.setInterval(() => void loadSnapshot(), 30_000);

    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(timer);
    };
  }, [loadSnapshot]);

  useEffect(() => {
    const controller = new AbortController();

    void connectEventStream({
      url: `/api/v1/public/live-wall-sessions/${encodeURIComponent(token)}/stream`,
      mode: "public",
      signal: controller.signal,
      onOpen: () => {
        setStreamStatus("live");
        void loadSnapshot();
      },
      onClose: () => setStreamStatus("reconnecting"),
      onResync: () => void loadSnapshot(),
      onMessage: (frame) => {
        if (frame.kind !== "live_wall.presentation") {
          const shouldResetPlaylist =
            frame.kind !== "media.created" &&
            frame.kind !== "media.thumbnail.ready";

          // New assets merge into the queue (or directly after the live
          // slide in Party mode). Moderation/deletion events must replace the
          // playlist so ineligible media leaves the projector immediately.
          void loadSnapshot(shouldResetPlaylist);

          return;
        }

        try {
          const presentation = JSON.parse(frame.data) as PresentationMessage;

          if (presentation.command === "next") {
            setIndex((current) => current + 1);
          } else if (presentation.command === "previous") {
            setIndex((current) => Math.max(0, current - 1));
          }

          if (presentation.content_policy) {
            void loadSnapshot(true);
          }

          setPayload((current) =>
            current
              ? {
                  ...current,
                  presentation: {
                    ...defaultPresentation,
                    ...current.presentation,
                    ...presentation,
                  },
                }
              : current,
          );
        } catch {
          void loadSnapshot();
        }
      },
    });

    return () => controller.abort();
  }, [loadSnapshot, token]);

  const presentation = payload?.presentation ?? defaultPresentation;
  const presentationEventName = getPresentationEventName(
    payload?.event,
    t("liveWall.title"),
  );
  const isFinalSlide = presentation.status === "ended";
  const media = useMemo(
    () =>
      playlist.filter(
        (item) => item.status !== "hidden" && !failedMediaIDs.has(item.id),
      ),
    [failedMediaIDs, playlist],
  );
  const current = media[index % Math.max(media.length, 1)];
  const currentId = current?.id;

  useEffect(() => {
    currentMediaIDRef.current = currentId ?? null;
  }, [currentId]);

  const isCurrentVideo = current?.is_video ?? false;
  const ctaEveryMedia = getCTAEveryMedia(presentation.cta_every_media);
  const isAutoCTAVisible =
    Boolean(current) &&
    index > 0 &&
    index % ctaEveryMedia === 0 &&
    completedAutoCTAIndex !== index;
  const qrStrategy = presentation.qr_strategy ?? "interval";
  const isInvitationVisible =
    presentation.show_cta ||
    isFinalSlide ||
    !current ||
    (qrStrategy === "interval" && isAutoCTAVisible);

  const advanceMedia = useCallback(() => setIndex((value) => value + 1), []);

  const handleMediaError = useCallback((mediaID: string) => {
    const attempt = mediaRetryAttemptsRef.current.get(mediaID) ?? 0;

    if (attempt === 0) {
      const updated = new Map(mediaRetryAttemptsRef.current);

      updated.set(mediaID, 1);
      mediaRetryAttemptsRef.current = updated;
      setMediaRetryAttempts(updated);

      return;
    }

    setFailedMediaIDs((failed) => {
      if (failed.has(mediaID)) return failed;

      return new Set(failed).add(mediaID);
    });
  }, []);

  const handleImageLoaded = useCallback(
    (mediaID: string, event: SyntheticEvent<HTMLImageElement>) => {
      const { naturalHeight, naturalWidth } = event.currentTarget;

      setPortraitMediaID(naturalHeight > naturalWidth ? mediaID : null);
    },
    [],
  );
  const isPortrait = portraitMediaID === currentId;

  useEffect(() => {
    if (
      !hasMoreRef.current ||
      !media.length ||
      index < Math.max(0, media.length - PREFETCH_REMAINING)
    ) {
      return;
    }

    void fetchNextPage();
  }, [fetchNextPage, index, media.length]);

  useEffect(() => {
    if (!isAutoCTAVisible) return;

    const timer = window.setTimeout(
      () => setCompletedAutoCTAIndex(index),
      CTA_DURATION_MS,
    );

    return () => window.clearTimeout(timer);
  }, [index, isAutoCTAVisible]);

  useEffect(() => {
    const next = media[(index + 1) % Math.max(media.length, 1)];

    if (!next || next.is_video) return;

    const image = new Image();

    image.src = next.url;
  }, [index, media]);

  useEffect(() => {
    if (
      !currentId ||
      isCurrentVideo ||
      !presentation.is_playing ||
      isInvitationVisible ||
      isFinalSlide ||
      presentation.is_blackout
    ) {
      return;
    }

    // A Live Wall is an unattended presentation, so it must continue
    // advancing even when the display device requests reduced motion. The
    // corresponding CSS media query removes the visual transition instead.
    const timer = window.setTimeout(
      advanceMedia,
      getSlideDuration(presentation.slide_duration_seconds) * 1000,
    );

    return () => window.clearTimeout(timer);
  }, [
    advanceMedia,
    currentId,
    isCurrentVideo,
    presentation.is_blackout,
    presentation.is_playing,
    presentation.slide_duration_seconds,
    isInvitationVisible,
    isFinalSlide,
  ]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (
      presentation.is_playing &&
      !isInvitationVisible &&
      !presentation.is_blackout
    ) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [isInvitationVisible, presentation.is_blackout, presentation.is_playing]);

  // Video Watchdog: If a video gets stuck buffering or fails to fire onEnded,
  // automatically advance after a maximum timeout so the wall never hangs indefinitely.
  useEffect(() => {
    if (
      !currentId ||
      !isCurrentVideo ||
      !presentation.is_playing ||
      isInvitationVisible ||
      isFinalSlide ||
      presentation.is_blackout
    ) {
      return;
    }

    const MAX_VIDEO_STALL_MS = 45_000;
    const timer = window.setTimeout(advanceMedia, MAX_VIDEO_STALL_MS);

    return () => window.clearTimeout(timer);
  }, [
    advanceMedia,
    currentId,
    isCurrentVideo,
    isFinalSlide,
    isInvitationVisible,
    presentation.is_blackout,
    presentation.is_playing,
  ]);

  // Operator keyboard shortcuts for fullscreen, play/pause, next and previous
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        (event.target.isContentEditable ||
          event.target.tagName === "INPUT" ||
          event.target.tagName === "TEXTAREA" ||
          event.target.tagName === "SELECT")
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        setPayload((curr) =>
          curr
            ? {
                ...curr,
                presentation: {
                  ...defaultPresentation,
                  ...curr.presentation,
                  is_playing: !curr.presentation?.is_playing,
                },
              }
            : curr,
        );
      } else if (event.code === "ArrowRight") {
        event.preventDefault();
        advanceMedia();
      } else if (event.code === "ArrowLeft") {
        event.preventDefault();
        setIndex((curr) => Math.max(0, curr - 1));
      } else if (event.key === "f" || event.key === "F") {
        event.preventDefault();

        if (!document.fullscreenElement) {
          void document.documentElement.requestFullscreen().catch(() => {});
        } else {
          void document.exitFullscreen().catch(() => {});
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [advanceMedia]);

  useEffect(() => {
    let active = true;

    const needsQr = isInvitationVisible || qrStrategy === "always" || !current;

    if (!needsQr || !payload?.event.slug) return;

    void toDataURL(
      `${window.location.origin}/e/${encodeURIComponent(payload.event.slug)}?src=screen`,
      {
        width: 720,
        margin: 1.5,
        color: { dark: "#181e17", light: "#ffffff" },
        errorCorrectionLevel: "H",
      },
    )
      .then((value) => {
        if (active) setQrDataUrl(value);
      })
      .catch(() => {
        // Keep the invitation readable even if the browser cannot create a QR.
      });

    return () => {
      active = false;
    };
  }, [current, isInvitationVisible, payload?.event.slug, qrStrategy]);

  return (
    <main
      className="live-wall-player"
      aria-label={t("liveWall.title")}
      style={getLiveWallThemeStyles(payload?.event.guest_theme)}
      data-blackout={presentation.is_blackout || undefined}
      data-has-media={(Boolean(current) && !isInvitationVisible) || undefined}
    >
      {!presentation.is_blackout && (
        <header
          key={`${isInvitationVisible ? `invitation-${index}` : current?.id}-${streamStatus}`}
          className="live-wall-player__header"
        >
          <span className="live-wall-player__event-name">
            {presentationEventName}
          </span>
          <span
            className="live-wall-player__status"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-state={streamStatus}
          >
            <span className="live-wall-player__status-dot" aria-hidden="true" />
            {streamStatus === "live"
              ? t("liveWall.live")
              : t("liveWall.reconnecting")}
          </span>
        </header>
      )}
      <section className="live-wall-player__stage">
        {presentation.is_blackout ? null : isInvitationVisible ? (
          <LiveWallInvitation
            eventName={presentationEventName}
            qrDataUrl={qrDataUrl}
            isFinalSlide={isFinalSlide}
            title={t("liveWall.endedTitle")}
            description={
              isFinalSlide
                ? t("liveWall.endedDescription")
                : t("liveWall.scanPrompt")
            }
          />
        ) : presentation.layout_mode === "mosaic" && media.length ? (
          <LiveWallMosaic
            items={media}
            eventName={presentationEventName}
            qrBadgeUrl={qrStrategy === "always" ? qrDataUrl : undefined}
            qrBadgeLabel={t("liveWall.scanPrompt")}
          />
        ) : current ? (
          <LiveWallStage
            item={current}
            cloudItems={media}
            eventName={presentationEventName}
            isPlaying={presentation.is_playing}
            videoRef={videoRef}
            onVideoEnded={advanceMedia}
            onMediaError={handleMediaError}
            onImageLoaded={handleImageLoaded}
            isPortrait={isPortrait}
            retryAttempt={mediaRetryAttempts.get(current.id) ?? 0}
            transitionMode={presentation.transition_mode}
            qrBadgeUrl={qrStrategy === "always" ? qrDataUrl : undefined}
            qrBadgeLabel={t("liveWall.scanPrompt")}
          />
        ) : null}
      </section>
    </main>
  );
}
