"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowCounterClockwise,
  Camera,
  CameraRotate,
  CameraSlash,
  Check,
  Images,
  Plus,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import { trackEvent } from "@/lib/analytics";
import {
  cameraEffectList,
  cameraEffects,
  type CameraEffectId,
} from "../lib/camera-effects";
import { applyEventFrameToCanvas } from "../lib/camera-frames";
import { useCameraStream } from "../hooks/use-camera-stream";
import "./candid-camera.css";

export interface CandidCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareCaptures: (files: File[]) => void;
  onFallbackToLibrary?: () => void;
  onFallbackToNativeCamera?: () => void;
  eventName: string;
  eventDate?: string | null;
  eventType?: string;
}

export function CandidCameraModal({
  isOpen,
  onClose,
  onShareCaptures,
  onFallbackToLibrary,
  onFallbackToNativeCamera,
  eventName,
  eventDate,
  eventType,
}: CandidCameraModalProps) {
  const t = useTranslations("event.camera");

  const [screen, setScreen] = useState<"viewfinder" | "review">("viewfinder");
  const [activeEffectId, setActiveEffectId] =
    useState<CameraEffectId>("original");
  const [isFrameEnabled, setIsFrameEnabled] = useState(true);
  const [isFlashing, setIsFlashing] = useState(false);
  const [capturedFiles, setCapturedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    stream,
    permissionState,
    facingMode,
    requestCamera,
    stopTracks,
    flipFacingMode,
  } = useCameraStream(isOpen);

  // Active effect configuration
  const currentEffect = useMemo(
    () => cameraEffects[activeEffectId] || cameraEffects.original,
    [activeEffectId],
  );

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

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
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

  // Effect change handler
  const handleEffectChange = (effectId: CameraEffectId) => {
    setActiveEffectId(effectId);
    trackEvent("guest_camera_effect_changed", {
      effect: effectId,
    });
  };

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
    flipFacingMode();
    trackEvent("guest_camera_flipped", {
      target_facing: facingMode === "environment" ? "user" : "environment",
    });
  };

  // Shutter action
  const handleShutter = () => {
    const video = videoRef.current;

    if (!video || video.videoWidth === 0) return;

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

      // Apply effect filter
      if (currentEffect.canvasFilter && currentEffect.canvasFilter !== "none") {
        ctx.filter = currentEffect.canvasFilter;
      }

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
      if (isFrameEnabled && eventName) {
        applyEventFrameToCanvas(ctx, canvas.width, canvas.height, {
          eventName,
          eventDate,
          eventType,
        });
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
          setScreen("review");

          trackEvent("guest_camera_shutter_pressed", {
            effect: activeEffectId,
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
  };

  // Review: Retake latest photo
  const handleRetake = () => {
    trackEvent("guest_camera_retake", {
      total_shots: capturedFiles.length,
    });

    if (previewUrls.length > 0) {
      const lastUrl = previewUrls[previewUrls.length - 1];

      URL.revokeObjectURL(lastUrl);
      setPreviewUrls((prev) => prev.slice(0, -1));
      setCapturedFiles((prev) => prev.slice(0, -1));
    }

    setScreen("viewfinder");
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

  const latestPreviewUrl =
    previewUrls.length > 0 ? previewUrls[previewUrls.length - 1] : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("cameraTitle")}
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
      ) : screen === "review" && latestPreviewUrl ? (
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

            {capturedFiles.length > 1 && (
              <span className="candid-camera__batch-badge">
                {t("capturesCount", { count: capturedFiles.length })}
              </span>
            )}

            <div style={{ width: 44 }} />
          </div>

          {/* Captured Preview */}
          <div className="candid-camera__preview-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={latestPreviewUrl}
              alt={t("reviewTitle")}
              className="candid-camera__preview-img"
            />
          </div>

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
              className={`candid-camera__frame-toggle ${
                isFrameEnabled ? "candid-camera__frame-toggle--active" : ""
              }`}
            >
              <Sparkle size={15} weight={isFrameEnabled ? "fill" : "bold"} />
              <span>{isFrameEnabled ? t("frameEvent") : t("frameNone")}</span>
            </button>

            {/* Flip Camera Button */}
            <button
              type="button"
              onClick={handleFlip}
              aria-label={t("flipCamera")}
              className="candid-camera__icon-btn"
            >
              <CameraRotate size={22} weight="bold" />
            </button>
          </div>

          {/* Viewfinder Video Area */}
          <div className="candid-camera__viewfinder">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className={`candid-camera__video ${
                facingMode === "user" ? "candid-camera__video--mirrored" : ""
              }`}
              style={{ filter: currentEffect.cssFilter }}
            />

            {/* Live Frame Preview Overlay */}
            {isFrameEnabled && eventName && (
              <div className="candid-camera__frame" aria-hidden="true">
                {/* Bottom Frosted-Glass Plaque */}
                <div className="candid-camera__frame-plaque">
                  <span className="candid-camera__frame-title">
                    {eventName}
                  </span>
                  {eventDate && (
                    <span className="candid-camera__frame-date">
                      {eventDate}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Flash Effect on Capture */}
            {isFlashing && <div className="candid-camera__flash" />}
          </div>

          {/* Bottom Controls Area */}
          <div className="candid-camera__bottom-bar">
            {/* Curated Effects Carousel */}
            <div
              role="radiogroup"
              aria-label="Photo looks"
              className="candid-camera__effects-carousel"
            >
              {cameraEffectList.map((effect) => {
                const isActive = effect.id === activeEffectId;
                // leaf translation key lookup
                const effectNameKey = effect.labelKey.replace("camera.", "") as
                  | "effectOriginal"
                  | "effectFilm"
                  | "effectBlackAndWhite"
                  | "effectWarm"
                  | "effectVintage"
                  | "effectDisposable";

                return (
                  <button
                    key={effect.id}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => handleEffectChange(effect.id)}
                    className={`candid-camera__effect-pill ${
                      isActive ? "candid-camera__effect-pill--active" : ""
                    }`}
                  >
                    {t(effectNameKey)}
                  </button>
                );
              })}
            </div>

            {/* Circular Shutter Button */}
            <div className="candid-camera__shutter-row">
              <button
                type="button"
                onClick={handleShutter}
                aria-label={t("takePhoto")}
                className="candid-camera__shutter-btn"
              >
                <div className="candid-camera__shutter-inner" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
