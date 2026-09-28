"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowsIn,
  ArrowsOut,
  CaretLeft,
  CaretRight,
  Eye,
  EyeSlash,
  MonitorPlay,
  Pause,
  Play,
  QrCode,
  Sparkle,
  User,
  X,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import type { CandidEvent } from "../types/event";
import { useEventMedia } from "../hooks/use-event-media";

type EventLiveWallModalProps = {
  event: CandidEvent;
  isOpen: boolean;
  onClose: () => void;
  isRealtimeLive?: boolean;
};

type ContentPolicy = "featured_only" | "auto_approved";

const PRELOAD_AHEAD = 5;

function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT")
  );
}

export function EventLiveWallModal({
  event,
  isOpen,
  onClose,
  isRealtimeLive = false,
}: EventLiveWallModalProps) {
  const t = useTranslations("event");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [contentPolicy, setContentPolicy] =
    useState<ContentPolicy>("auto_approved");
  const [isCtaVisible, setIsCtaVisible] = useState(false);
  const [isBlackout, setIsBlackout] = useState(false);
  const [isWaitingForMore, setIsWaitingForMore] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const currentIdRef = useRef<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const {
    data: mediaPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useEventMedia(event.id, {
    // Newly uploaded, ready media should appear in the preview by default.
    // The host can still switch to the curated featured-only playlist.
    filter: contentPolicy === "featured_only" ? "favorites" : "all",
    sort: "newest",
  });

  const mediaItems = useMemo(
    () =>
      (mediaPages?.pages.flatMap((page) => page.data) || []).filter(
        (item) => item.status !== "hidden",
      ),
    [mediaPages],
  );

  const currentIndex = useMemo(() => {
    if (mediaItems.length === 0) return -1;

    const found = mediaItems.findIndex((item) => item.id === currentId);

    return found >= 0 ? found : 0;
  }, [currentId, mediaItems]);
  const activeMedia = mediaItems[currentIndex];

  useEffect(() => {
    currentIdRef.current = currentId;
  }, [currentId]);

  const goToNext = useCallback(() => {
    if (mediaItems.length === 0) {
      setIsCtaVisible(true);

      return;
    }

    const index = mediaItems.findIndex(
      (item) => item.id === currentIdRef.current,
    );
    const resolvedIndex = index >= 0 ? index : 0;
    const next = resolvedIndex + 1;

    if (next < mediaItems.length) {
      setCurrentId(mediaItems[next].id);
      setIsCtaVisible(false);

      return;
    }

    // Do not replay page one while another cursor page is available. It is
    // preferable to wait briefly for the requested page than repeat media.
    if (hasNextPage || isFetchingNextPage) {
      setIsWaitingForMore(true);
      if (hasNextPage && !isFetchingNextPage) void fetchNextPage();

      return;
    }

    setCurrentId(mediaItems[0].id);
    setIsCtaVisible(false);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, mediaItems]);

  const goToPrevious = useCallback(() => {
    if (mediaItems.length === 0) return;

    const index = mediaItems.findIndex(
      (item) => item.id === currentIdRef.current,
    );
    const resolvedIndex = index >= 0 ? index : 0;
    const previous =
      (resolvedIndex - 1 + mediaItems.length) % mediaItems.length;

    setCurrentId(mediaItems[previous].id);
    setIsCtaVisible(false);
  }, [mediaItems]);

  // Cursor-pagination buffer: this supports large events without a separate
  // unbounded client playlist, and prevents looping only the first 24 items.
  useEffect(() => {
    if (!isOpen || !hasNextPage || isFetchingNextPage || currentIndex < 0)
      return;
    if (currentIndex >= mediaItems.length - PRELOAD_AHEAD) void fetchNextPage();
  }, [
    currentIndex,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isOpen,
    mediaItems.length,
  ]);

  useEffect(() => {
    if (!isWaitingForMore || isFetchingNextPage || mediaItems.length === 0)
      return;

    const index = mediaItems.findIndex(
      (item) => item.id === currentIdRef.current,
    );

    if (index >= 0 && index < mediaItems.length - 1) {
      setCurrentId(mediaItems[index + 1].id);
      setIsWaitingForMore(false);
    }
  }, [isFetchingNextPage, isWaitingForMore, mediaItems]);

  // Preload one upcoming item. Videos only fetch metadata, avoiding a burst
  // of large files on venue Wi-Fi.
  useEffect(() => {
    if (!isOpen || currentIndex < 0) return;

    const nextItem = mediaItems[currentIndex + 1];

    if (!nextItem) return;

    const source = nextItem.thumbnail_url || nextItem.url;

    if (nextItem.is_video) {
      const video = document.createElement("video");

      video.preload = "metadata";
      video.src = source;

      return () => {
        video.removeAttribute("src");
        video.load();
      };
    }

    const image = new window.Image();

    image.src = source;
  }, [currentIndex, isOpen, mediaItems]);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const origin = window.location.origin;
    const publicPath = event.public_url || `/e/${event.slug}`;
    const liveGuestUrl = `${event.guest_url || `${origin}${publicPath}`}?src=screen`;

    void import("qrcode")
      .then((qr) =>
        qr.toDataURL(liveGuestUrl, {
          width: 560,
          margin: 2,
          color: { dark: "#181e17", light: "#ffffff" },
        }),
      )
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [isOpen, event.guest_url, event.public_url, event.slug]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updatePreference = () => {
      setReduceMotion(mediaQuery.matches);
      if (mediaQuery.matches) setIsPlaying(false);
    };

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !activeMedia?.is_video) return;

    if (isPlaying) {
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [activeMedia?.id, activeMedia?.is_video, isPlaying]);

  useEffect(() => {
    const currentMedia = mediaItems[currentIndex];

    if (
      !isOpen ||
      !isPlaying ||
      reduceMotion ||
      isCtaVisible ||
      isBlackout ||
      mediaItems.length <= 1 ||
      currentMedia?.is_video
    ) {
      return;
    }

    const timer = window.setTimeout(goToNext, 5500);

    return () => window.clearTimeout(timer);
  }, [
    currentIndex,
    goToNext,
    isBlackout,
    isCtaVisible,
    isOpen,
    isPlaying,
    mediaItems,
    reduceMotion,
  ]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      if (event.key === "Escape") onClose();
      else if (event.key === " ") {
        event.preventDefault();
        setIsPlaying((value) => !value);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPrevious();
      } else if (event.key.toLowerCase() === "b") {
        event.preventDefault();
        setIsBlackout((value) => !value);
      } else if (event.key.toLowerCase() === "c") {
        event.preventDefault();
        setIsCtaVisible(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious, isOpen, onClose]);

  useEffect(() => {
    const syncFullscreen = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));

    document.addEventListener("fullscreenchange", syncFullscreen);

    return () =>
      document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement)
      await document.documentElement.requestFullscreen().catch(() => {});
    else await document.exitFullscreen().catch(() => {});
  };

  if (!isOpen) return null;

  const currentMedia = activeMedia;
  const isEmpty = !currentMedia;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("liveWall.title")}
      className={`event-live-wall${isBlackout ? " event-live-wall--blackout" : ""}`}
    >
      <div className="event-live-wall__top">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Sparkle size={18} weight="fill" className="text-amber-400" />
          </div>
          <div className="min-w-0">
            <h2 className="font-heading text-xl text-white font-medium truncate">
              {event.name}
            </h2>
            <p className="text-xs text-white/70 flex items-center gap-2">
              <span className="event-live-wall__connection" role="status">
                <span
                  aria-hidden="true"
                  className={`event-live-wall__connection-dot${isRealtimeLive ? " event-live-wall__connection-dot--live" : ""}`}
                />
                {isRealtimeLive
                  ? t("liveWall.live")
                  : t("liveWall.reconnecting")}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {Math.max(currentIndex, 0) + 1} / {mediaItems.length || 1}
              </span>
            </p>
          </div>
        </div>

        <div className="event-live-wall__controls">
          <div
            className="event-live-wall__policy"
            aria-label={t("liveWall.contentPolicy")}
          >
            <button
              type="button"
              aria-pressed={contentPolicy === "featured_only"}
              onClick={() => setContentPolicy("featured_only")}
              className={`event-live-wall__policy-button${contentPolicy === "featured_only" ? " event-live-wall__policy-button--active" : ""}`}
            >
              {t("liveWall.featuredOnly")}
            </button>
            <button
              type="button"
              aria-pressed={contentPolicy === "auto_approved"}
              onClick={() => setContentPolicy("auto_approved")}
              className={`event-live-wall__policy-button${contentPolicy === "auto_approved" ? " event-live-wall__policy-button--active" : ""}`}
            >
              {t("liveWall.autoApproved")}
            </button>
          </div>
          <button
            type="button"
            onClick={goToPrevious}
            className="event-live-wall__control"
            title={t("liveWall.previous")}
            aria-label={t("liveWall.previous")}
          >
            <CaretLeft size={20} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying((value) => !value)}
            className="event-live-wall__control"
            title={isPlaying ? t("liveWall.pause") : t("liveWall.play")}
            aria-label={isPlaying ? t("liveWall.pause") : t("liveWall.play")}
          >
            {isPlaying ? (
              <Pause size={18} weight="fill" />
            ) : (
              <Play size={18} weight="fill" />
            )}
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="event-live-wall__control"
            title={t("liveWall.next")}
            aria-label={t("liveWall.next")}
          >
            <CaretRight size={20} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => setIsCtaVisible(true)}
            className="event-live-wall__control"
            title={t("liveWall.showCta")}
            aria-label={t("liveWall.showCta")}
          >
            <MonitorPlay size={19} />
          </button>
          <button
            type="button"
            onClick={() => setIsBlackout((value) => !value)}
            className={`event-live-wall__control${isBlackout ? " event-live-wall__control--active" : ""}`}
            title={
              isBlackout ? t("liveWall.exitBlackout") : t("liveWall.blackout")
            }
            aria-label={
              isBlackout ? t("liveWall.exitBlackout") : t("liveWall.blackout")
            }
          >
            {isBlackout ? <Eye size={19} /> : <EyeSlash size={19} />}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="event-live-wall__control"
            title={t("liveWall.fullscreen")}
            aria-label={t("liveWall.fullscreen")}
          >
            {isFullscreen ? <ArrowsIn size={18} /> : <ArrowsOut size={18} />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="event-live-wall__control"
            title={t("liveWall.exit")}
            aria-label={t("liveWall.exit")}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="event-live-wall__stage">
        {isBlackout ? (
          <p className="sr-only">{t("liveWall.blackout")}</p>
        ) : isCtaVisible || isEmpty ? (
          <div className="event-live-wall__cta-slide">
            <div className="event-live-wall__cta-mark">
              <Sparkle size={28} weight="fill" aria-hidden="true" />
            </div>
            <p className="event-live-wall__cta-eyebrow">{event.name}</p>
            <h3 className="event-live-wall__cta-heading">
              {t("liveWall.scanPrompt")}
            </h3>
            <div className="event-live-wall__cta-qr">
              {qrDataUrl ? (
                <Image
                  src={qrDataUrl}
                  alt={t("liveWall.scanPrompt")}
                  width={280}
                  height={280}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              ) : (
                <QrCode size={120} aria-hidden="true" />
              )}
            </div>
            <p className="event-live-wall__cta-note">
              {t("ready.noAppNeeded")}
            </p>
            {!isEmpty && (
              <button
                type="button"
                className="event-live-wall__cta-resume"
                onClick={() => setIsCtaVisible(false)}
              >
                {t("liveWall.resume")}
              </button>
            )}
          </div>
        ) : (
          <div className="event-live-wall__media-frame">
            <div
              key={currentMedia.id}
              className="event-live-wall__media event-live-wall__media--enter"
            >
              {currentMedia.is_video ? (
                <video
                  ref={videoRef}
                  src={currentMedia.url}
                  className="event-live-wall__image event-live-wall__image--video"
                  autoPlay={isPlaying}
                  muted
                  playsInline
                  preload="metadata"
                  onEnded={goToNext}
                  onError={goToNext}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentMedia.url}
                  alt={currentMedia.caption || event.name}
                  className="event-live-wall__image event-live-wall__image--image"
                />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="event-live-wall__bottom">
        <div className="max-w-xl min-w-0">
          {currentMedia?.caption && !isCtaVisible && !isBlackout && (
            <p className="font-heading text-xl text-white font-medium drop-shadow line-clamp-2">
              “{currentMedia.caption}”
            </p>
          )}
          {currentMedia?.guest_name && !isCtaVisible && !isBlackout && (
            <p className="text-xs text-white/80 mt-1 flex items-center gap-1.5 font-medium">
              <User size={13} aria-hidden="true" />
              <span>
                {t("gallery.uploadedBy", { name: currentMedia.guest_name })}
              </span>
            </p>
          )}
        </div>
        <p className="event-live-wall__shortcut-hint" aria-hidden="true">
          {t("liveWall.shortcuts")}
        </p>
      </div>
    </div>
  );
}
