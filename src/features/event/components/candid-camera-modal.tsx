"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowCounterClockwise,
  Camera,
  CameraRotate,
  CameraSlash,
  Check,
  FastForward,
  Images,
  Plus,
  SpeakerHigh,
  SpeakerSlash,
  Sparkle,
  Timer,
  X,
} from "@phosphor-icons/react";
import { trackEvent } from "@/lib/analytics";
import { applyEventFrameToCanvas } from "../lib/camera-frames";
import { useCameraShutterSound, useCameraStream } from "../hooks";
import type { EventMode } from "../types/event";
import "./candid-camera.css";

export interface CandidCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareCaptures: (files: File[]) => void;
  onFallbackToLibrary?: () => void;
  onFallbackToNativeCamera?: () => void;
  eventMode?: EventMode;
}

export function CandidCameraModal({
  isOpen,
  onClose,
  onShareCaptures,
  onFallbackToLibrary,
  onFallbackToNativeCamera,
  eventMode,
}: CandidCameraModalProps) {
  const t = useTranslations("event.camera");

  const [screen, setScreen] = useState<"viewfinder" | "review">("viewfinder");
  const [isFrameEnabled, setIsFrameEnabled] = useState(true);
  const [isFlashing, setIsFlashing] = useState(false);
  const [capturedFiles, setCapturedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedCaptureIndex, setSelectedCaptureIndex] = useState(0);
  const [isTimerMenuOpen, setIsTimerMenuOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isQuickCaptureEnabled, setIsQuickCaptureEnabled] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const {
    stream,
    permissionState,
    facingMode,
    requestCamera,
    stopTracks,
    flipFacingMode,
  } = useCameraStream(isOpen);
  const { isSoundEnabled, playCountdownTick, playShutterSound, toggleSound } =
    useCameraShutterSound(eventMode === "silent");

  // Clean up object URLs on unmount
  const cleanupPreviewUrls = useCallback(() => {
    previewUrls.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    });
  }, [previewUrls]);

  // Handle modal closing
  const handleClose = useCallback(() => {
    trackEvent("guest_camera_closed", {
      captured_count: capturedFiles.length,
    });
    cleanupPreviewUrls();
    setCapturedFiles([]);
    setPreviewUrls([]);
    setSelectedCaptureIndex(0);
    setCountdown(null);
    setIsTimerMenuOpen(false);
    setScreen("viewfinder");
    stopTracks();
    onClose();
  }, [capturedFiles.length, cleanupPreviewUrls, onClose, stopTracks]);

  // Lock body scroll & escape listener
  useEffect(() => {
    if (!isOpen) return;

    trackEvent("guest_camera_opened", {
      facing_mode: facingMode,
    });

    const prevOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    document.body.style.overflow = "hidden";

    window.setTimeout(() => {
      modalRef.current
        ?.querySelector<HTMLButtonElement>("button:not([disabled])")
        ?.focus();
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();

        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLButtonElement>(
            "button:not([disabled])",
          ),
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (!first || !last) return;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, handleClose, facingMode]);

  // Attach stream to video element when available
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {
        // Autoplay may need user gesture on certain browsers
      });
    }
  }, [stream, screen]);

  // Frame toggle handler
  const handleFrameToggle = () => {
    const nextState = !isFrameEnabled;

    setIsFrameEnabled(nextState);
    trackEvent("guest_camera_frame_toggled", {
      frame: nextState ? "event" : "none",
    });
  };

  // Camera flip handler
  const handleFlip = () => {
    const nextFacingMode =
      facingMode === "environment" ? "user" : "environment";

    flipFacingMode();
    trackEvent("guest_camera_flipped", {
      target_facing: nextFacingMode,
    });
  };

  // Shutter action
  const handleShutter = useCallback(async () => {
    const video = videoRef.current;

    if (!video || !isVideoReady || video.videoWidth === 0) return;

    playShutterSound();

    // Trigger visual flash
    setIsFlashing(true);
    window.setTimeout(() => setIsFlashing(false), 180);

    // Haptic feedback
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(25);
    }

    try {
      // Calculate exact visible viewport aspect ratio to guarantee 100% WYSIWYG
      const vf = video.parentElement;
      const vfWidth =
        vf && vf.clientWidth > 0 ? vf.clientWidth : video.videoWidth;
      const vfHeight =
        vf && vf.clientHeight > 0 ? vf.clientHeight : video.videoHeight;
      const targetAspect = vfWidth / vfHeight;
      const videoAspect = video.videoWidth / video.videoHeight;

      let srcX = 0;
      let srcY = 0;
      let srcW = video.videoWidth;
      let srcH = video.videoHeight;

      if (videoAspect > targetAspect) {
        // Video stream is wider than the visible viewfinder (e.g. 16:9 stream in 1:1 or 3:4 container)
        // Crop left and right sides symmetrically
        srcW = Math.round(video.videoHeight * targetAspect);
        srcX = Math.round((video.videoWidth - srcW) / 2);
      } else {
        // Video stream is taller than the visible viewfinder (e.g. 9:16 stream in 1:1 or 4:3 container)
        // Crop top and bottom sides symmetrically
        srcH = Math.round(video.videoWidth / targetAspect);
        srcY = Math.round((video.videoHeight - srcH) / 2);
      }

      const canvas = document.createElement("canvas");

      canvas.width = srcW;
      canvas.height = srcH;

      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      // Mirror front camera
      if (facingMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      // Draw ONLY the exact visible region from the video stream
      ctx.drawImage(
        video,
        srcX,
        srcY,
        srcW,
        srcH,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      // Reset transform and filter
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.filter = "none";

      // Apply event frame overlay if enabled
      if (isFrameEnabled) {
        applyEventFrameToCanvas(ctx, canvas.width, canvas.height);
      }

      // Export JPEG file
      canvas.toBlob(
        (blob) => {
          if (!blob) return;

          const fileName = `candid_${Date.now()}_${capturedFiles.length + 1}.jpg`;
          const file = new File([blob], fileName, { type: "image/jpeg" });
          const previewUrl = URL.createObjectURL(blob);

          setCapturedFiles((prev) => [...prev, file]);
          setPreviewUrls((prev) => [...prev, previewUrl]);
          setSelectedCaptureIndex(capturedFiles.length);
          setScreen(isQuickCaptureEnabled ? "viewfinder" : "review");

          trackEvent("guest_camera_shutter_pressed", {
            frame: isFrameEnabled ? "event" : "none",
            facing_mode: facingMode,
          });
        },
        "image/jpeg",
        0.92,
      );
    } catch {
      // Fallback if canvas rendering fails
    }
  }, [
    capturedFiles.length,
    facingMode,
    isFrameEnabled,
    isQuickCaptureEnabled,
    isVideoReady,
    playShutterSound,
  ]);

  useEffect(() => {
    if (countdown === null) return;

    const timeoutId = window.setTimeout(() => {
      if (countdown === 1) {
        setCountdown(null);

        handleShutter();

        return;
      }

      playCountdownTick();
      setCountdown((current) => (current ? current - 1 : null));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [countdown, handleShutter, playCountdownTick]);

  const handleTimerSelection = (seconds: number) => {
    setIsTimerMenuOpen(false);
    playCountdownTick();
    setCountdown(seconds);
    trackEvent("guest_camera_timer_started", { seconds });
  };

  const handleSoundToggle = () => {
    toggleSound();
    trackEvent("guest_camera_sound_toggled", {
      sound_enabled: !isSoundEnabled,
      event_mode: eventMode ?? "social",
    });
  };

  // Review: Retake latest photo
  const handleRetake = () => {
    trackEvent("guest_camera_retake", {
      total_shots: capturedFiles.length,
    });

    if (previewUrls.length > 0) {
      const selectedUrl = previewUrls[selectedCaptureIndex];

      URL.revokeObjectURL(selectedUrl);
      setPreviewUrls((prev) =>
        prev.filter((_, index) => index !== selectedCaptureIndex),
      );
      setCapturedFiles((prev) =>
        prev.filter((_, index) => index !== selectedCaptureIndex),
      );

      if (previewUrls.length === 1) {
        setScreen("viewfinder");
      } else {
        setSelectedCaptureIndex((index) => Math.max(0, index - 1));
      }
    }
  };

  // Review: Keep photo and take another
  const handleTakeAnother = () => {
    trackEvent("guest_camera_add_more", {
      accumulated_count: capturedFiles.length,
    });
    setScreen("viewfinder");
  };

  // Review: Share captures into the main upload queue
  const handleShareCaptures = () => {
    trackEvent("guest_camera_shared", {
      file_count: capturedFiles.length,
    });

    const filesToShare = [...capturedFiles];

    handleClose();
    onShareCaptures(filesToShare);
  };

  if (!isOpen) return null;

  const isCameraBlocked =
    permissionState === "denied" ||
    permissionState === "unavailable" ||
    permissionState === "error";

  const selectedPreviewUrl = previewUrls[selectedCaptureIndex] ?? null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("cameraTitle")}
      ref={modalRef}
      className="candid-camera"
    >
      {/* ─── CASE A: PERMISSION BLOCKED / ERROR ─── */}
      {isCameraBlocked ? (
        <div className="candid-camera__permission-card">
          <div className="candid-camera__permission-icon">
            <CameraSlash size={28} weight="bold" />
          </div>
          <h2 className="candid-camera__permission-title">
            {t("permissionDeniedTitle")}
          </h2>
          <p className="candid-camera__permission-desc">
            {t("permissionDeniedDesc")}
          </p>

          <div className="candid-camera__permission-actions">
            <button
              type="button"
              onClick={() => requestCamera(facingMode)}
              className="candid-camera__btn candid-camera__btn--primary"
            >
              {t("permissionRetry")}
            </button>

            {onFallbackToNativeCamera && (
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onFallbackToNativeCamera();
                }}
                className="candid-camera__btn candid-camera__btn--secondary"
              >
                <Camera size={18} weight="bold" />
                <span>{t("permissionNativeCamera")}</span>
              </button>
            )}

            {onFallbackToLibrary && (
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onFallbackToLibrary();
                }}
                className="candid-camera__btn candid-camera__btn--secondary"
              >
                <Images size={18} weight="bold" />
                <span>{t("permissionFallback")}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="candid-camera__btn candid-camera__btn--secondary"
            >
              {t("closeCamera")}
            </button>
          </div>
        </div>
      ) : screen === "review" && selectedPreviewUrl ? (
        /* ─── CASE B: REVIEW SCREEN ─── */
        <div className="candid-camera__review">
          {/* Top Bar with Close */}
          <div className="candid-camera__top-bar">
            <button
              type="button"
              onClick={handleClose}
              aria-label={t("closeCamera")}
              className="candid-camera__icon-btn"
            >
              <X size={20} weight="bold" />
            </button>

            <span className="candid-camera__batch-badge" role="status">
              {t("capturesCount", { count: capturedFiles.length })}
            </span>

            <div className="candid-camera__top-spacer" aria-hidden="true" />
          </div>

          {/* Captured Preview */}
          <div className="candid-camera__preview-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPreviewUrl}
              alt={t("reviewTitle")}
              className="candid-camera__preview-img"
            />
          </div>

          {previewUrls.length > 1 && (
            <div
              role="group"
              className="candid-camera__capture-tray"
              aria-label={t("capturesCount", { count: capturedFiles.length })}
            >
              {previewUrls.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setSelectedCaptureIndex(index)}
                  aria-label={t("reviewTitle")}
                  aria-pressed={selectedCaptureIndex === index}
                  className={`candid-camera__capture-thumb ${
                    selectedCaptureIndex === index
                      ? "candid-camera__capture-thumb--active"
                      : ""
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" />
                </button>
              ))}
            </div>
          )}

          {/* Review Actions */}
          <div className="candid-camera__review-actions">
            <div className="candid-camera__review-grid">
              <button
                type="button"
                onClick={handleRetake}
                className="candid-camera__btn candid-camera__btn--secondary"
              >
                <ArrowCounterClockwise size={18} weight="bold" />
                <span>{t("retakeBtn")}</span>
              </button>

              <button
                type="button"
                onClick={handleTakeAnother}
                className="candid-camera__btn candid-camera__btn--secondary"
              >
                <Plus size={18} weight="bold" />
                <span>{t("keepAndAddMoreBtn")}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleShareCaptures}
              className="candid-camera__btn candid-camera__btn--primary"
            >
              <Check size={18} weight="bold" />
              <span>
                {t("shareCaptureBtn")}
                {capturedFiles.length > 1 ? ` (${capturedFiles.length})` : ""}
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* ─── CASE C: LIVE VIEWFINDER ─── */
        <>
          {/* Top Control Bar */}
          <div className="candid-camera__top-bar">
            <button
              type="button"
              onClick={handleClose}
              aria-label={t("closeCamera")}
              className="candid-camera__icon-btn"
            >
              <X size={20} weight="bold" />
            </button>

            {/* Event Frame Pill Toggle */}
            <button
              type="button"
              onClick={handleFrameToggle}
              aria-pressed={isFrameEnabled}
              className={`candid-camera__frame-toggle ${
                isFrameEnabled ? "candid-camera__frame-toggle--active" : ""
              }`}
            >
              <Sparkle size={15} weight={isFrameEnabled ? "fill" : "bold"} />
              <span>{isFrameEnabled ? t("frameEvent") : t("frameNone")}</span>
            </button>

            <div className="candid-camera__top-actions">
              <button
                type="button"
                onClick={handleSoundToggle}
                aria-label={isSoundEnabled ? t("soundOn") : t("soundOff")}
                aria-pressed={isSoundEnabled}
                className="candid-camera__icon-btn candid-camera__sound-toggle"
              >
                {isSoundEnabled ? (
                  <SpeakerHigh size={21} weight="bold" />
                ) : (
                  <SpeakerSlash size={21} weight="bold" />
                )}
              </button>

              <button
                type="button"
                onClick={handleFlip}
                aria-label={t("flipCamera")}
                className="candid-camera__icon-btn"
              >
                <CameraRotate size={22} weight="bold" />
              </button>
            </div>
          </div>

          {/* Viewfinder Video Area */}
          <div className="candid-camera__viewfinder">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              onLoadStart={() => setIsVideoReady(false)}
              onCanPlay={() => setIsVideoReady(true)}
              className={`candid-camera__video ${
                facingMode === "user" ? "candid-camera__video--mirrored" : ""
              }`}
            />

            {/* Live Frame Preview Overlay */}
            {isFrameEnabled && (
              <div className="candid-camera__frame" aria-hidden="true">
                <span className="candid-camera__frame-ornament">
                  <span className="candid-camera__frame-ornament-line candid-camera__frame-ornament-line--left" />
                  <span className="candid-camera__frame-ornament-line candid-camera__frame-ornament-line--right" />
                  <span className="candid-camera__frame-sparkle candid-camera__frame-sparkle--large" />
                  <span className="candid-camera__frame-sparkle candid-camera__frame-sparkle--left" />
                  <span className="candid-camera__frame-sparkle candid-camera__frame-sparkle--right" />
                  <span className="candid-camera__frame-ornament-dot candid-camera__frame-ornament-dot--left" />
                  <span className="candid-camera__frame-ornament-dot candid-camera__frame-ornament-dot--right" />
                </span>
                <span className="candid-camera__frame-corner candid-camera__frame-corner--top-left" />
                <span className="candid-camera__frame-corner candid-camera__frame-corner--top-right" />
                <span className="candid-camera__frame-corner candid-camera__frame-corner--bottom-left" />
                <span className="candid-camera__frame-corner candid-camera__frame-corner--bottom-right" />
              </div>
            )}

            {/* Flash Effect on Capture */}
            {isFlashing && <div className="candid-camera__flash" />}

            {countdown !== null && (
              <div
                className="candid-camera__countdown"
                role="status"
                aria-live="assertive"
              >
                {countdown}
              </div>
            )}

            {previewUrls.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCaptureIndex(previewUrls.length - 1);
                  setScreen("review");
                }}
                aria-label={t("capturesCount", { count: capturedFiles.length })}
                className="candid-camera__capture-summary"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrls[previewUrls.length - 1]} alt="" />
                <span>{capturedFiles.length}</span>
              </button>
            )}
          </div>

          {/* Bottom Controls Area */}
          <div className="candid-camera__bottom-bar">
            {/* Circular Shutter Button */}
            <div className="candid-camera__shutter-row">
              <div className="candid-camera__timer-control">
                <button
                  type="button"
                  onClick={() => setIsTimerMenuOpen((isOpen) => !isOpen)}
                  aria-label={t("takePhoto")}
                  aria-expanded={isTimerMenuOpen}
                  aria-controls="camera-timer-options"
                  className={`candid-camera__timer-btn ${
                    isTimerMenuOpen ? "candid-camera__timer-btn--active" : ""
                  }`}
                >
                  <Timer size={21} weight="bold" aria-hidden="true" />
                </button>

                {isTimerMenuOpen && (
                  <div
                    id="camera-timer-options"
                    role="group"
                    aria-label={t("takePhoto")}
                    className="candid-camera__timer-menu"
                  >
                    {[3, 5, 10].map((seconds) => (
                      <button
                        key={seconds}
                        type="button"
                        onClick={() => handleTimerSelection(seconds)}
                        className="candid-camera__timer-option"
                      >
                        {seconds}s
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleShutter}
                aria-label={t("takePhoto")}
                disabled={countdown !== null || !isVideoReady}
                className="candid-camera__shutter-btn"
              >
                <div className="candid-camera__shutter-inner" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setIsQuickCaptureEnabled((isEnabled) => !isEnabled)
                }
                aria-label={t("quickCapture")}
                aria-pressed={isQuickCaptureEnabled}
                className={`candid-camera__quick-capture-btn ${
                  isQuickCaptureEnabled
                    ? "candid-camera__quick-capture-btn--active"
                    : ""
                }`}
              >
                <FastForward size={20} weight="bold" aria-hidden="true" />
                <span>{t("quickCapture")}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
