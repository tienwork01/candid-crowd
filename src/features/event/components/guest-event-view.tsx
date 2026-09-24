"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  ArrowCounterClockwise,
  Camera,
  ChatCircleText,
  CheckCircle,
  Eye,
  Heart,
  Images,
  DeviceMobile,
  Moon,
  Plus,
  Sparkle,
  SunHorizon,
  Trash,
  UploadSimple,
  User,
  VideoCamera,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import type { CandidEvent, EventMediaItem } from "../types/event";
import { formatDate } from "@/i18n/format";
import type { AppLocale } from "@/i18n/locales";
import { Spinner } from "@/components/ui";
import { EventMediaLightbox } from "./event-media-lightbox";
import { CandidCameraModal } from "./candid-camera-modal";
import { trackEvent } from "@/lib/analytics";
import { APIError } from "@/lib/api-client";
import { useGuestUpload } from "@/features/upload/hooks";
import { usePWA } from "@/features/pwa/components";
import { usePublicMedia } from "../hooks/use-public-media";
import "./guest-upload.css";

type GuestEventViewProps = {
  event: CandidEvent;
  isTest?: boolean;
};

type StagedFileStatus =
  "idle" | "uploading" | "success" | "error" | "duplicate";

type StagedFile = {
  id: string;
  file: File;
  previewUrl: string;
  isVideo: boolean;
  sizeFormatted: string;
  status: StagedFileStatus;
};

function newUploadID(): string {
  // All supported guest browsers have randomUUID. The fallback retains the
  // RFC4122 shape for older embedded browsers and backend UUID validation.
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const value = Math.floor(Math.random() * 16);

    return (char === "x" ? value : (value & 0x3) | 0x8).toString(16);
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type EventTypeCopy = {
  namePlaceholder: string;
  noteLabel: string;
  notePlaceholder: string;
  silentNotice: string;
};

function getEventTypeCopy(
  eventType: CandidEvent["event_type"],
  t: (key: string) => string,
): EventTypeCopy {
  switch (eventType) {
    case "Wedding":
      return {
        namePlaceholder: t("guest.guestNamePlaceholder_Wedding"),
        noteLabel: t("guest.guestNoteLabel_Wedding"),
        notePlaceholder: t("guest.guestNotePlaceholder_Wedding"),
        silentNotice: t("guest.silentModeNotice_Wedding"),
      };
    case "Birthday":
      return {
        namePlaceholder: t("guest.guestNamePlaceholder_Birthday"),
        noteLabel: t("guest.guestNoteLabel_Birthday"),
        notePlaceholder: t("guest.guestNotePlaceholder_Birthday"),
        silentNotice: t("guest.silentModeNotice"),
      };
    case "Anniversary":
      return {
        namePlaceholder: t("guest.guestNamePlaceholder"),
        noteLabel: t("guest.guestNoteLabel_Anniversary"),
        notePlaceholder: t("guest.guestNotePlaceholder_Anniversary"),
        silentNotice: t("guest.silentModeNotice"),
      };
    case "Baby Shower":
      return {
        namePlaceholder: t("guest.guestNamePlaceholder"),
        noteLabel: t("guest.guestNoteLabel_BabyShower"),
        notePlaceholder: t("guest.guestNotePlaceholder_BabyShower"),
        silentNotice: t("guest.silentModeNotice"),
      };
    case "Graduation":
      return {
        namePlaceholder: t("guest.guestNamePlaceholder"),
        noteLabel: t("guest.guestNoteLabel_Graduation"),
        notePlaceholder: t("guest.guestNotePlaceholder_Graduation"),
        silentNotice: t("guest.silentModeNotice"),
      };
    case "Corporate":
      return {
        namePlaceholder: t("guest.guestNamePlaceholder_Corporate"),
        noteLabel: t("guest.guestNoteLabel_Corporate"),
        notePlaceholder: t("guest.guestNotePlaceholder_Corporate"),
        silentNotice: t("guest.silentModeNotice"),
      };
    case "Conference":
      return {
        namePlaceholder: t("guest.guestNamePlaceholder_Conference"),
        noteLabel: t("guest.guestNoteLabel_Conference"),
        notePlaceholder: t("guest.guestNotePlaceholder_Conference"),
        silentNotice: t("guest.silentModeNotice"),
      };
    default:
      return {
        namePlaceholder: t("guest.guestNamePlaceholder"),
        noteLabel: t("guest.guestNoteLabel"),
        notePlaceholder: t("guest.guestNotePlaceholder"),
        silentNotice: t("guest.silentModeNotice"),
      };
  }
}

export function GuestEventView({ event, isTest = false }: GuestEventViewProps) {
  const t = useTranslations("event");
  const locale = useLocale() as AppLocale;
  const copy = getEventTypeCopy(event.event_type, t);

  const { canInstall, openInstallPrompt } = usePWA();

  const cameraInputId = useId();
  const libraryInputId = useId();

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const stagedFilesRef = useRef<StagedFile[]>([]);

  const [activeTab, setActiveTab] = useState<"upload" | "gallery">("upload");
  const [localGalleryMedia, setLocalGalleryMedia] = useState<EventMediaItem[]>(
    [],
  );
  const { data: remoteMedia = [] } = usePublicMedia(event.slug);
  const galleryMedia = useMemo(() => {
    const baseMedia =
      remoteMedia.length > 0
        ? remoteMedia
        : event.media_items?.filter((item) => item.status !== "hidden") || [];
    const combined = new Map(baseMedia.map((item) => [item.id, item]));

    localGalleryMedia.forEach((item) => combined.set(item.id, item));

    return Array.from(combined.values());
  }, [event.media_items, localGalleryMedia, remoteMedia]);

  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [guestName, setGuestName] = useState(() => {
    if (typeof window === "undefined") return "";

    try {
      return localStorage.getItem("candidcrowd_guest_name") || "";
    } catch {
      return "";
    }
  });
  const [guestNote, setGuestNote] = useState("");

  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<
    "idle" | "preparing" | "uploading" | "success" | "error"
  >("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadCurrentIndex, setUploadCurrentIndex] = useState(0);
  const [lastUploadedCount, setLastUploadedCount] = useState(0);
  const [restoredQueueReady, setRestoredQueueReady] = useState(false);

  const [guestLikes, setGuestLikes] = useState<Record<string, boolean>>({});
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const mode = event.event_mode || "social";
  const galleryAllowed = event.gallery_enabled !== false;
  const {
    uploadFile,
    restorePendingUploads,
    removePendingItem,
    clearPendingItems,
  } = useGuestUpload(event.slug);

  // Restore only files that have not reached server verification. They are
  // shown as retryable until the browser is online and the queue runs again.
  useEffect(() => {
    let cancelled = false;

    void restorePendingUploads().then((items) => {
      if (cancelled) return;

      if (items.length === 0) {
        setRestoredQueueReady(true);

        return;
      }

      setStagedFiles((previous) => [
        ...previous,
        ...items
          .filter((item) => !previous.some((file) => file.id === item.id))
          .map((item) => ({
            id: item.id,
            file: item.file,
            previewUrl: URL.createObjectURL(item.file),
            isVideo: item.mimeType.startsWith("video/"),
            sizeFormatted: formatFileSize(item.size),
            status: "error" as const,
          })),
      ]);
      setRestoredQueueReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [restorePendingUploads]);

  // Track event view on mount
  useEffect(() => {
    trackEvent("guest_event_opened", {
      event_id: event.id,
      event_mode: mode,
      is_test: isTest,
    });
  }, [event.id, mode, isTest]);

  // Prevent accidental tab closure or navigation during upload
  useEffect(() => {
    const isBusy = uploadPhase === "preparing" || uploadPhase === "uploading";

    if (!isBusy) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [uploadPhase]);

  // Keep object URLs alive while a staged item is rendered; revoke only when the
  // guest removes an item or the page actually unmounts.
  useEffect(() => {
    stagedFilesRef.current = stagedFiles;
  }, [stagedFiles]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      stagedFilesRef.current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  const formattedDate = event.event_date
    ? formatDate(event.event_date, locale, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : t("ready.noDate");

  // Calculate social proof metrics
  const uniqueContributorsCount = useMemo(() => {
    return new Set(
      galleryMedia
        .map((m) => m.guest_name?.trim())
        .filter((name) => Boolean(name) && name !== "Guest"),
    ).size;
  }, [galleryMedia]);

  // Process selected files into the staging tray
  const handleFilesSelected = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const newFiles: StagedFile[] = [];
      const supportedTypes = new Set([
        "image/jpeg",
        "image/png",
        "image/webp",
        "video/mp4",
        "video/quicktime",
      ]);
      let hasOversized = false;
      let hasUnsupported = false;

      Array.from(fileList).forEach((file) => {
        const maxFileBytes = file.type.startsWith("video/")
          ? 500 * 1024 * 1024
          : 25 * 1024 * 1024;

        if (!supportedTypes.has(file.type)) {
          hasUnsupported = true;

          return;
        }

        if (file.size > maxFileBytes) {
          hasOversized = true;

          return;
        }

        const isVideo = file.type.startsWith("video/");
        const previewUrl = URL.createObjectURL(file);

        newFiles.push({
          id: newUploadID(),
          file,
          previewUrl,
          isVideo,
          sizeFormatted: formatFileSize(file.size),
          status: "idle",
        });
      });

      if (hasOversized) {
        toast.error(t("guest.dropzoneSub"));
      }

      if (hasUnsupported) {
        toast.error("Please choose a JPEG, PNG, WebP, MP4, or MOV file.");
      }

      if (newFiles.length > 0) {
        setStagedFiles((prev) => [...prev, ...newFiles]);
        setUploadPhase("idle");

        trackEvent("guest_files_selected", {
          file_count: newFiles.length,
          total_bytes: newFiles.reduce((acc, cur) => acc + cur.file.size, 0),
        });

        // Light tactile feedback on mobile when available
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(10);
        }
      }

      // Reset inputs so the same file can be picked again if desired
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (libraryInputRef.current) libraryInputRef.current.value = "";
    },
    [t],
  );

  const removeStagedFile = (id: string) => {
    setStagedFiles((prev) => {
      const target = prev.find((item) => item.id === id);

      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }

      const remaining = prev.filter((item) => item.id !== id);

      if (
        remaining.length === 0 ||
        remaining.every(
          (item) => item.status === "idle" || item.status === "success",
        )
      ) {
        setUploadPhase("idle");
        setUploadProgress(0);
      }

      return remaining;
    });

    void removePendingItem(id);
  };

  const removeFailedFiles = () => {
    const failed = stagedFiles.filter((item) => item.status === "error");

    failed.forEach((item) => {
      URL.revokeObjectURL(item.previewUrl);
      void removePendingItem(item.id);
    });

    setStagedFiles((prev) => {
      const remaining = prev.filter((item) => item.status !== "error");

      if (
        remaining.length === 0 ||
        remaining.every(
          (item) => item.status === "idle" || item.status === "success",
        )
      ) {
        setUploadPhase("idle");
        setUploadProgress(0);
      }

      return remaining;
    });

    toast.success(t("guest.failedRemovedToast", { count: failed.length }));
  };

  const clearStagedFiles = () => {
    stagedFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setStagedFiles([]);
    setUploadPhase("idle");
    setUploadProgress(0);
    void clearPendingItems();
  };

  // Perform upload submission with per-item status & progressive feedback
  const handleUploadSubmit = async (
    onlyFailed = false,
    explicitFiles?: StagedFile[],
  ) => {
    const sourceFiles = explicitFiles ?? stagedFiles;

    if (sourceFiles.length === 0) return;
    if (uploadPhase === "preparing" || uploadPhase === "uploading") return;

    // Filter files to upload
    const targetFiles = onlyFailed
      ? sourceFiles.filter((f) => f.status === "error")
      : sourceFiles.filter(
          (f) => f.status !== "success" && f.status !== "duplicate",
        );

    if (targetFiles.length === 0) return;

    trackEvent(onlyFailed ? "guest_upload_retried" : "guest_upload_started", {
      file_count: targetFiles.length,
      retry_count: onlyFailed ? targetFiles.length : 0,
    });

    // Save name to localStorage for future uploads
    if (guestName.trim()) {
      try {
        localStorage.setItem("candidcrowd_guest_name", guestName.trim());
      } catch {
        // Ignore localStorage errors
      }
    }

    setUploadPhase("preparing");
    setUploadProgress(15);
    setUploadCurrentIndex(1);

    const total = targetFiles.length;
    const successfulUploadedItems: EventMediaItem[] = [];
    const failedIds: string[] = [];
    const duplicateIDs: string[] = [];

    // Progressive upload steps per file
    for (let i = 0; i < total; i++) {
      const currentTarget = targetFiles[i];

      setUploadCurrentIndex(i + 1);
      setUploadPhase("uploading");

      // Mark current file as uploading
      setStagedFiles((prev) =>
        prev.map((f) =>
          f.id === currentTarget.id ? { ...f, status: "uploading" } : f,
        ),
      );

      const currentPercent = Math.round(15 + ((i + 1) / total) * 80);

      setUploadProgress(currentPercent);

      try {
        const uploaded = await uploadFile(currentTarget.file, {
          id: currentTarget.id,
          onProgress: (percent) => {
            const overall = Math.round(15 + ((i + percent / 100) / total) * 80);

            setUploadProgress(overall);
          },
        });
        const mediaItem: EventMediaItem = {
          id: uploaded.id,
          url: uploaded.url,
          caption:
            guestNote.trim() ||
            currentTarget.file.name.replace(/\.[^/.]+$/, ""),
          guest_name: guestName.trim() || "Guest",
          created_at: new Date().toISOString(),
          status: "ready",
          is_video: currentTarget.isVideo,
          likes_count: 0,
        };

        successfulUploadedItems.push(mediaItem);
        setStagedFiles((prev) =>
          prev.map((f) =>
            f.id === currentTarget.id ? { ...f, status: "success" } : f,
          ),
        );
      } catch (error) {
        const isDuplicate =
          error instanceof APIError && error.code === "duplicate_media";

        if (isDuplicate) {
          duplicateIDs.push(currentTarget.id);
        } else {
          failedIds.push(currentTarget.id);
        }

        setStagedFiles((prev) =>
          prev.map((f) =>
            f.id === currentTarget.id
              ? { ...f, status: isDuplicate ? "duplicate" : "error" }
              : f,
          ),
        );
      }
    }

    setUploadProgress(100);

    if (failedIds.length === 0) {
      if (duplicateIDs.length > 0) {
        toast.error(t("guest.duplicateUpload", { count: duplicateIDs.length }));
      }

      if (successfulUploadedItems.length === 0) {
        setUploadPhase("idle");
        setUploadProgress(0);

        return;
      }

      // Complete success!
      setLocalGalleryMedia((prev) => [...successfulUploadedItems, ...prev]);
      setLastUploadedCount(successfulUploadedItems.length);
      setUploadPhase("success");
      sourceFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setStagedFiles([]);
      setGuestNote("");

      trackEvent("guest_upload_completed", {
        file_count: successfulUploadedItems.length,
      });

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([10, 40, 20]);
      }

      toast.success(t("guest.uploadSuccess"));
    } else {
      // Partial success
      setLocalGalleryMedia((prev) => [...successfulUploadedItems, ...prev]);
      setUploadPhase("error");

      trackEvent("guest_upload_failed", {
        failed_count: failedIds.length,
        success_count: successfulUploadedItems.length,
      });

      toast.error(
        t("guest.partialSuccessDesc", {
          successCount: successfulUploadedItems.length,
          totalCount: total,
        }),
      );
    }
  };

  const handleUploadSubmitRef = useRef(handleUploadSubmit);

  useEffect(() => {
    handleUploadSubmitRef.current = handleUploadSubmit;
  });

  // An already-persisted queue should continue without asking the guest to
  // choose the same photos again when they reopen the event with connectivity.
  useEffect(() => {
    if (!restoredQueueReady || !navigator.onLine) return;

    const timeout = window.setTimeout(() => {
      if (stagedFilesRef.current.some((file) => file.status === "error")) {
        handleUploadSubmitRef.current(true);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [restoredQueueReady]);

  const handleRetrySingleItem = (id: string) => {
    setStagedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "idle" } : f)),
    );
    handleUploadSubmit(true);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      const hasErrors = stagedFilesRef.current.some(
        (f) => f.status === "error",
      );

      if (hasErrors) {
        toast.info(t("guest.uploadRetry"));
        handleUploadSubmitRef.current(true);
      }
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [t]);

  const handleCameraShare = (files: File[]) => {
    if (files.length === 0) return;

    const newFiles: StagedFile[] = files.map((file) => ({
      id: newUploadID(),
      file,
      previewUrl: URL.createObjectURL(file),
      isVideo: false,
      sizeFormatted: formatFileSize(file.size),
      status: "idle",
    }));

    setStagedFiles((prev) => [...prev, ...newFiles]);
    setActiveTab("upload");

    void handleUploadSubmit(false, newFiles);
  };

  // Drag & drop handlers for desktop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  const toggleLike = (id: string) => {
    setGuestLikes((prev) => ({ ...prev, [id]: !prev[id] }));
    setLocalGalleryMedia((prev) => {
      const isLiked = guestLikes[id];
      const source =
        prev.find((item) => item.id === id) ||
        galleryMedia.find((item) => item.id === id);

      if (!source) return prev;

      const updatedItem = {
        ...source,
        likes_count: (source.likes_count || 0) + (isLiked ? -1 : 1),
      };

      return [updatedItem, ...prev.filter((item) => item.id !== id)];
    });
  };

  const handleRemoveTestUploads = () => {
    setLocalGalleryMedia([]);
    toast.success(t("guest.testRemovedToast"));
  };

  const totalStagedBytes = stagedFiles.reduce(
    (acc, cur) => acc + cur.file.size,
    0,
  );

  const failedFiles = stagedFiles.filter((f) => f.status === "error");
  const isAfterMode = mode === "after";
  const isCandidCameraEnabled =
    !isAfterMode && event.candid_camera_enabled !== false;

  return (
    <div className="guest-event-page">
      {/* Hidden file inputs: Multi-file library vs Direct camera */}
      <input
        id={libraryInputId}
        ref={libraryInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="sr-only"
        aria-label={t("guest.selectFiles")}
        onChange={(e) => handleFilesSelected(e.target.files)}
      />
      <input
        id={cameraInputId}
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        aria-label={t("guest.cameraSnap")}
        onChange={(e) => handleFilesSelected(e.target.files)}
      />

      {/* Test / Preview Mode Banner */}
      {isTest && (
        <aside
          aria-label={t("guest.testSessionBanner")}
          className="guest-event__banner guest-event__banner--test guest-event-card__test-banner"
        >
          <div className="guest-event__banner-info">
            <Eye
              size={15}
              className="text-primary shrink-0"
              aria-hidden="true"
            />
            <div className="guest-event__banner-text">
              <span className="guest-event__banner-title">
                {t("guest.previewBannerTitle")}
              </span>
              <span className="guest-event__banner-sub">
                · {t("guest.previewBannerSub")}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemoveTestUploads}
            className="guest-event__banner-action"
          >
            <Trash size={13} aria-hidden="true" />
            <span>{t("guest.removeTestUploads")}</span>
          </button>
        </aside>
      )}

      {/* Mode-Aware Context Notices */}
      {mode === "silent" && (
        <div className="guest-event__banner guest-event__banner--silent">
          <Moon size={16} className="text-primary shrink-0" />
          <span>{copy.silentNotice}</span>
        </div>
      )}

      {isAfterMode && (
        <div className="guest-event__banner guest-event__banner--after">
          <SunHorizon size={16} className="shrink-0" />
          <span>{t("guest.afterModeNotice")}</span>
        </div>
      )}

      <main className="guest-event__content">
        {/* Compact Event Header */}
        <header className="guest-event__header">
          <div className="guest-event__badge">
            <Sparkle size={12} weight="fill" className="text-primary" />
            <span>{t(`types.${event.event_type}`)}</span>
          </div>

          <h1 className="guest-event__title">{event.name}</h1>
          <time className="guest-event__date">{formattedDate}</time>

          {/* Subtle trust note (Replaces loud trust line) */}
          <p className="guest-event__trust-line" title={t("guest.trustLine")}>
            {t("guest.noSignInNeeded")}
          </p>

          {/* Light social proof indicator */}
          {galleryMedia.length > 0 && (
            <div className="guest-event__social-proof" role="status">
              <span>
                {t("guest.socialProofMemories", { count: galleryMedia.length })}
              </span>
              {uniqueContributorsCount > 0 && (
                <>
                  <span className="guest-event__social-dot" aria-hidden="true">
                    ·
                  </span>
                  <span>
                    {t("guest.socialProofContributors", {
                      count: uniqueContributorsCount,
                    })}
                  </span>
                </>
              )}
            </div>
          )}
        </header>

        {/* Tab Switcher (Share vs Memories) */}
        {galleryAllowed && (
          <nav className="guest-event__nav" aria-label={t("guest.tabMemories")}>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`guest-event__tab ${
                activeTab === "upload" ? "guest-event__tab--active" : ""
              }`}
            >
              <UploadSimple size={15} weight="bold" />
              <span>{t("guest.tabShare")}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("gallery");
                trackEvent("guest_gallery_opened", { from: activeTab });
              }}
              className={`guest-event__tab ${
                activeTab === "gallery" ? "guest-event__tab--active" : ""
              }`}
            >
              <Images size={15} weight="bold" />
              <span>
                {t("guest.tabMemoriesCount", { count: galleryMedia.length })}
              </span>
            </button>
          </nav>
        )}

        {/* TAB 1: UPLOAD EXPERIENCE */}
        {activeTab === "upload" && (
          <div className="guest-upload">
            {/* Case A: Initial Picker State (No files staged yet) */}
            {stagedFiles.length === 0 &&
              uploadPhase !== "uploading" &&
              uploadPhase !== "preparing" &&
              uploadPhase !== "success" && (
                <div
                  className={`guest-upload__picker-card ${
                    isDragOver ? "guest-upload__picker-card--dragover" : ""
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="guest-upload__icon-halo">
                    <Images size={32} weight="duotone" aria-hidden="true" />
                  </div>

                  <h2 className="guest-upload__heading">
                    {t("guest.welcomeCta")}
                  </h2>

                  {/* Dual Action Buttons (Mobile-First Hierarchy) */}
                  <div className="guest-upload__actions-grid">
                    {/* PRIMARY: Choose from library / camera roll */}
                    <button
                      type="button"
                      onClick={() => {
                        trackEvent("guest_upload_cta_clicked", {
                          source: "library",
                          mode,
                        });
                        libraryInputRef.current?.click();
                      }}
                      className="guest-upload__btn guest-upload__btn--primary guest-upload__btn--library"
                    >
                      <Images size={19} weight="bold" aria-hidden="true" />
                      <span>{t("guest.selectFiles")}</span>
                    </button>

                    {/* SECONDARY: Candid Camera (De-emphasized/hidden in after mode or if disabled by host) */}
                    {isCandidCameraEnabled && (
                      <button
                        type="button"
                        onClick={() => {
                          trackEvent("guest_upload_cta_clicked", {
                            source: "camera",
                            mode,
                          });
                          setIsCameraOpen(true);
                        }}
                        className="guest-upload__btn guest-upload__btn--secondary guest-upload__btn--camera"
                      >
                        <Camera size={18} weight="bold" aria-hidden="true" />
                        <span>{t("camera.candidCameraBtn")}</span>
                      </button>
                    )}
                  </div>

                  <span className="guest-upload__drag-hint">
                    {t("guest.dragDropHint")}
                  </span>
                </div>
              )}

            {/* Case B: Staged Review Tray (Files Selected, Pre-Upload) */}
            {stagedFiles.length > 0 &&
              uploadPhase !== "uploading" &&
              uploadPhase !== "preparing" && (
                <div className="guest-upload__staging">
                  <div className="guest-upload__staging-header">
                    <div className="guest-upload__staging-title">
                      <span>
                        {t("guest.selectedSummary", {
                          count: stagedFiles.length,
                        })}
                      </span>
                      <span className="guest-upload__staging-size">
                        · {formatFileSize(totalStagedBytes)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={clearStagedFiles}
                      className="guest-upload__clear-btn"
                    >
                      {t("guest.clearAll")}
                    </button>
                  </div>

                  {/* Staged Thumbnails Grid */}
                  <div className="guest-upload__grid">
                    {stagedFiles.map((item) => (
                      <div
                        key={item.id}
                        className={`guest-upload__thumb ${
                          item.status === "error"
                            ? "guest-upload__thumb--error"
                            : item.status === "duplicate"
                              ? "guest-upload__thumb--duplicate"
                              : ""
                        }`}
                      >
                        {item.isVideo ? (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white">
                            <VideoCamera size={24} weight="fill" />
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.previewUrl}
                            alt="Staged preview"
                            className="guest-upload__thumb-img"
                          />
                        )}

                        <button
                          type="button"
                          onClick={() => removeStagedFile(item.id)}
                          aria-label={t("guest.removeFile")}
                          className={`guest-upload__remove-btn ${
                            item.status === "error"
                              ? "guest-upload__remove-btn--error"
                              : ""
                          }`}
                          title={t("guest.removeFile")}
                        >
                          <X size={14} weight="bold" />
                        </button>

                        {item.status === "error" && (
                          <button
                            type="button"
                            onClick={() => handleRetrySingleItem(item.id)}
                            aria-label={t("guest.uploadRetry")}
                            className="guest-upload__retry-item-btn"
                            title={t("guest.uploadRetry")}
                          >
                            <ArrowCounterClockwise size={16} weight="bold" />
                          </button>
                        )}

                        <div
                          className={`guest-upload__thumb-badge ${
                            item.status === "error"
                              ? "guest-upload__thumb-badge--error"
                              : ""
                          }`}
                        >
                          {item.status === "error" ? (
                            <>
                              <WarningCircle size={10} weight="fill" />
                              <span>{t("guest.statusFailed")}</span>
                            </>
                          ) : item.isVideo ? (
                            <VideoCamera size={10} weight="fill" />
                          ) : (
                            item.sizeFormatted
                          )}
                        </div>

                        {item.status === "duplicate" && (
                          <span className="guest-upload__duplicate-label">
                            {t("guest.duplicateBadge")}
                          </span>
                        )}
                      </div>
                    ))}

                    {/* "+ Add" tile in the grid */}
                    <button
                      type="button"
                      onClick={() => libraryInputRef.current?.click()}
                      className="guest-upload__add-more"
                      title={t("guest.addMore")}
                    >
                      <Plus size={20} weight="bold" />
                      <span>{t("guest.addMore")}</span>
                    </button>
                  </div>

                  {/* Failure Notice if any file had error */}
                  {failedFiles.length > 0 && (
                    <div className="guest-upload__error-box mb-4">
                      <div className="flex items-center gap-2 text-crimson font-medium text-xs mb-2.5">
                        <WarningCircle
                          size={16}
                          weight="fill"
                          className="shrink-0"
                        />
                        <span>
                          {stagedFiles.length === failedFiles.length
                            ? t("guest.allFailedDesc", {
                                count: failedFiles.length,
                              })
                            : t("guest.partialSuccessDesc", {
                                successCount:
                                  stagedFiles.length - failedFiles.length,
                                totalCount: stagedFiles.length,
                              })}
                        </span>
                      </div>
                      <div className="guest-upload__error-actions">
                        <button
                          type="button"
                          onClick={() => handleUploadSubmit(true)}
                          className="guest-upload__btn guest-upload__btn--secondary guest-upload__btn--retry text-xs py-2"
                        >
                          <ArrowCounterClockwise size={14} weight="bold" />
                          <span>
                            {t("guest.retryFailedCount", {
                              count: failedFiles.length,
                            })}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={removeFailedFiles}
                          className="guest-upload__btn guest-upload__btn--danger-outline text-xs py-2"
                        >
                          <Trash size={14} weight="bold" />
                          <span>
                            {t("guest.removeFailedCount", {
                              count: failedFiles.length,
                            })}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Optional Personalization Fields */}
                  <div className="guest-upload__fields">
                    <div className="guest-upload__field">
                      <label
                        htmlFor="guest-name-input"
                        className="guest-upload__label"
                      >
                        <User size={13} aria-hidden="true" />
                        <span>{t("guest.guestNameLabel")}</span>
                      </label>
                      <input
                        id="guest-name-input"
                        type="text"
                        value={guestName}
                        maxLength={50}
                        placeholder={copy.namePlaceholder}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="guest-upload__input"
                      />
                    </div>

                    <div className="guest-upload__field">
                      <label
                        htmlFor="guest-note-input"
                        className="guest-upload__label"
                      >
                        <ChatCircleText size={13} aria-hidden="true" />
                        <span>{copy.noteLabel}</span>
                      </label>
                      <textarea
                        id="guest-note-input"
                        value={guestNote}
                        maxLength={200}
                        placeholder={copy.notePlaceholder}
                        onChange={(e) => setGuestNote(e.target.value)}
                        className="guest-upload__textarea"
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Submit Action */}
                  <div className="guest-upload__bottom-bar">
                    <button
                      type="button"
                      onClick={() => handleUploadSubmit(false)}
                      className="guest-upload__submit-btn"
                    >
                      <UploadSimple
                        size={18}
                        weight="bold"
                        aria-hidden="true"
                      />
                      <span>
                        {t("guest.uploadCta", { count: stagedFiles.length })}
                      </span>
                    </button>
                  </div>
                </div>
              )}

            {/* Case C: Upload Progress State */}
            {(uploadPhase === "preparing" || uploadPhase === "uploading") && (
              <div
                className="guest-upload__progress-wrap"
                role="status"
                aria-live="polite"
              >
                <Spinner size="md" className="text-primary mb-3" />

                <h3 className="guest-upload__progress-status">
                  {t("guest.uploadingOverall", { count: stagedFiles.length })}
                </h3>

                <p className="guest-upload__progress-fraction">
                  {uploadPhase === "preparing"
                    ? t("guest.uploadingStagePreparing")
                    : t("guest.uploadingFraction", {
                        completed: uploadCurrentIndex,
                        total: stagedFiles.length,
                      })}
                </p>

                <div className="guest-upload__progress-bar">
                  <div
                    className="guest-upload__progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>

                <p className="guest-upload__progress-sub">
                  {uploadPhase === "preparing"
                    ? t("guest.uploading")
                    : t("guest.uploadingStageProgress", {
                        current: uploadCurrentIndex,
                        total: stagedFiles.length,
                        percent: uploadProgress,
                      })}
                </p>
              </div>
            )}

            {/* Case D: Warm Success Confirmation State */}
            {uploadPhase === "success" && (
              <div className="guest-upload__success-card">
                <div className="guest-upload__success-icon">
                  <CheckCircle size={36} weight="fill" aria-hidden="true" />
                </div>

                <h2 className="guest-upload__success-title">
                  {t("guest.uploadSuccessTitle", { count: lastUploadedCount })}
                </h2>
                <p className="guest-upload__success-desc">
                  {t("guest.uploadSuccessWarmMessage")}
                </p>

                <div className="guest-upload__success-actions">
                  <button
                    type="button"
                    onClick={() => {
                      trackEvent("guest_share_more_clicked");
                      setUploadPhase("idle");
                      libraryInputRef.current?.click();
                    }}
                    className="guest-upload__btn guest-upload__btn--primary"
                  >
                    <Plus size={16} weight="bold" aria-hidden="true" />
                    <span>{t("guest.shareMoreBtn")}</span>
                  </button>

                  {galleryAllowed && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("gallery");
                        setUploadPhase("idle");
                        trackEvent("guest_gallery_opened", { from: "success" });
                      }}
                      className="guest-upload__btn guest-upload__btn--secondary"
                    >
                      <Images size={17} weight="bold" aria-hidden="true" />
                      <span>{t("guest.viewMemoriesBtn")}</span>
                    </button>
                  )}

                  {canInstall && (
                    <button
                      type="button"
                      onClick={() => {
                        trackEvent("guest_save_event_pwa_clicked");
                        openInstallPrompt();
                      }}
                      className="guest-upload__btn guest-upload__btn--secondary"
                    >
                      <DeviceMobile
                        size={17}
                        weight="bold"
                        aria-hidden="true"
                      />
                      <span>{t("guest.saveEventBtn")}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SHARED MEMORIES GALLERY */}
        {activeTab === "gallery" && galleryAllowed && (
          <div className="guest-gallery">
            <div className="guest-gallery__header">
              <h2 className="guest-gallery__title">
                <Images size={18} className="text-primary" />
                <span>
                  {t("guest.tabMemoriesCount", { count: galleryMedia.length })}
                </span>
              </h2>

              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className="guest-gallery__add-btn"
                aria-label={t("guest.uploadMoreBtn")}
              >
                <Plus size={14} weight="bold" />
                <span>{t("guest.addMore")}</span>
              </button>
            </div>

            {galleryMedia.length === 0 ? (
              <div className="guest-gallery__empty">
                <h3 className="guest-gallery__empty-title">
                  {t("guest.emptyMemoriesTitle")}
                </h3>
                <p className="guest-gallery__empty-text">
                  {t("guest.emptyMemoriesDesc")}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className="guest-upload__btn guest-upload__btn--primary"
                  aria-label={t("guest.welcomeCta")}
                >
                  <Images size={18} weight="bold" />
                  <span>{t("guest.tabShare")}</span>
                </button>
              </div>
            ) : (
              <div className="guest-gallery__grid">
                {galleryMedia.map((item, index) => (
                  <div key={item.id} className="guest-gallery__item">
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(index)}
                      className="guest-gallery__media-button"
                      aria-label={
                        item.caption ||
                        t("guest.tabMemoriesCount", { count: index + 1 })
                      }
                    >
                      {item.is_video ? (
                        <video
                          src={item.url}
                          className="guest-gallery__img"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <Image
                          src={item.url}
                          alt=""
                          fill
                          unoptimized
                          className="guest-gallery__img"
                          sizes="(max-width: 640px) 50vw, 33vw"
                        />
                      )}
                    </button>

                    <div className="guest-gallery__overlay" aria-hidden="true">
                      <span className="guest-gallery__uploader-name">
                        {item.guest_name || "Guest"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleLike(item.id)}
                      aria-label="Like memory"
                      aria-pressed={Boolean(guestLikes[item.id])}
                      className={`guest-gallery__like-btn ${
                        guestLikes[item.id]
                          ? "guest-gallery__like-btn--active"
                          : ""
                      }`}
                    >
                      <Heart
                        size={15}
                        weight={guestLikes[item.id] ? "fill" : "regular"}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Mobile Floating Action Button to return to upload while browsing gallery */}
            {galleryMedia.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className="guest-gallery__fab"
              >
                <Images size={18} weight="bold" />
                <span>{t("guest.tabShare")}</span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* Lightbox for browsing full-resolution photos */}
      {lightboxIndex !== null && (
        <EventMediaLightbox
          item={galleryMedia[lightboxIndex] || null}
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          onNext={() =>
            setLightboxIndex((prev) =>
              prev !== null && prev < galleryMedia.length - 1 ? prev + 1 : prev,
            )
          }
          onPrev={() =>
            setLightboxIndex((prev) =>
              prev !== null && prev > 0 ? prev - 1 : prev,
            )
          }
          hasNext={lightboxIndex < galleryMedia.length - 1}
          hasPrev={lightboxIndex > 0}
          currentIndex={lightboxIndex}
          totalItems={galleryMedia.length}
        />
      )}

      {/* Candid Camera Modal */}
      {isCandidCameraEnabled && (
        <CandidCameraModal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onShareCaptures={handleCameraShare}
          onFallbackToLibrary={() => libraryInputRef.current?.click()}
          onFallbackToNativeCamera={() => cameraInputRef.current?.click()}
          eventMode={mode}
        />
      )}
    </div>
  );
}
