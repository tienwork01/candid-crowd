"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowsIn,
  ArrowsOut,
  Pause,
  Play,
  QrCode,
  Sparkle,
  User,
  X,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import type { CandidEvent } from "../types/event";

type EventLiveWallModalProps = {
  event: CandidEvent;
  isOpen: boolean;
  onClose: () => void;
};

export function EventLiveWallModal({
  event,
  isOpen,
  onClose,
}: EventLiveWallModalProps) {
  const t = useTranslations("event");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const mediaItems =
    event.media_items?.filter((m) => m.status !== "hidden") || [];

  // Generate QR code for live wall
  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const publicPath = event.public_url || `/e/${event.slug}`;
    const liveGuestUrl = `${event.guest_url || `${origin}${publicPath}`}?src=screen`;

    void import("qrcode")
      .then((qr) =>
        qr.toDataURL(liveGuestUrl, {
          width: 280,
          margin: 1,
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

  // Slideshow timer
  useEffect(() => {
    if (!isOpen || !isPlaying || mediaItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, mediaItems.length]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!isOpen) return null;

  const currentMedia = mediaItems[currentIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("liveWall.title")}
      className="event-live-wall"
    >
      {/* Top Bar */}
      <div className="event-live-wall__top">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <Sparkle size={18} weight="fill" className="text-amber-400" />
          </div>
          <div>
            <h2 className="font-heading text-xl text-white font-medium">
              {event.name}
            </h2>
            <p className="text-xs text-white/70 flex items-center gap-2">
              <span>{t("liveWall.title")}</span>
              <span>·</span>
              <span>
                {currentIndex + 1} / {mediaItems.length || 1}
              </span>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
            title={isPlaying ? t("liveWall.paused") : t("liveWall.playing")}
            aria-label={
              isPlaying ? t("liveWall.paused") : t("liveWall.playing")
            }
          >
            {isPlaying ? (
              <Pause size={18} weight="fill" />
            ) : (
              <Play size={18} weight="fill" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <ArrowsIn size={18} /> : <ArrowsOut size={18} />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
            title={t("liveWall.exit")}
            aria-label={t("liveWall.exit")}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Center Stage: Photo Display */}
      <div className="event-live-wall__stage">
        {currentMedia ? (
          <div className="relative w-full h-full max-w-5xl max-h-[75vh] flex items-center justify-center">
            <Image
              src={currentMedia.url}
              alt={currentMedia.caption || event.name}
              fill
              className="object-contain drop-shadow-2xl rounded-xl transition-opacity duration-700"
              sizes="100vw"
              priority
            />
          </div>
        ) : (
          <div className="text-center text-white/60">
            <Sparkle size={48} className="mx-auto mb-3 text-white/30" />
            <p className="font-heading text-2xl">{t("liveWall.scanPrompt")}</p>
          </div>
        )}
      </div>

      {/* Bottom Bar: QR Code & Caption */}
      <div className="event-live-wall__bottom">
        {/* Caption & Credit */}
        <div className="max-w-xl">
          {currentMedia?.caption && (
            <p className="font-heading text-xl text-white font-medium drop-shadow">
              &ldquo;{currentMedia.caption}&rdquo;
            </p>
          )}
          {currentMedia?.guest_name && (
            <p className="text-xs text-white/80 mt-1 flex items-center gap-1.5 font-medium">
              <User size={13} aria-hidden="true" />
              <span>
                {t("gallery.uploadedBy", { name: currentMedia.guest_name })}
              </span>
            </p>
          )}
        </div>

        {/* Live QR Badge for venue attendees */}
        <div className="event-live-wall__qr-card">
          <div className="w-16 h-16 bg-white p-1 rounded-lg flex items-center justify-center shrink-0">
            {qrDataUrl ? (
              <Image
                src={qrDataUrl}
                alt="Scan to share"
                width={64}
                height={64}
                className="w-full h-full object-contain"
                unoptimized
              />
            ) : (
              <QrCode size={36} className="text-ink" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider">
              {t("ready.qrCta")}
            </p>
            <p className="text-[11px] text-white/70 mt-0.5">
              {t("ready.noAppNeeded")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
