"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChartBar,
  Gear,
  Images,
  Megaphone,
  PaintBrush,
  X,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { APIError, privateClient } from "@/lib/api-client";
import "./event.css";
import type { CandidEvent, EventMediaItem, EventMode } from "../types/event";
import { getEventLifecycleStatus, getEventPublicCode } from "../types/event";
import { findCachedMediaItem } from "../lib/realtime-cache";
import { EventAnalyticsView } from "./event-analytics-view";
import { EventEditDialog } from "./event-edit-dialog";
import { GuestThemeCustomizeModal } from "./guest-theme";
import { EventEngageView } from "./event-engage-view";
import { EventGalleryView } from "./event-gallery-view";
import { EventHubHeader } from "./event-hub-header";
import { EventSharePopover } from "./event-share-popover";
import { EventPrintModal } from "./print";
import { QRCustomizeModal } from "./qr-customize";
import {
  useBatchDeleteMedia,
  useBatchUpdateMediaStatus,
  useDeleteMedia,
  useEventMedia,
  useEventRealtime,
  useUpdateEvent,
  useUpdateMediaStatus,
} from "../hooks";
import { formatDate } from "@/i18n/format";
import type { AppLocale } from "@/i18n/locales";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Tabs,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "@/components/ui";

type EventOverviewViewProps = {
  event: CandidEvent;
};

type ActiveTab = "memories" | "participation" | "engage" | "settings";
type LiveWallCommand =
  | "play"
  | "pause"
  | "next"
  | "previous"
  | "show_cta"
  | "hide_cta"
  | "blackout"
  | "resume";
type LiveWallConfirmation = "blackout" | "end" | null;
type LiveWallContentPolicy = "featured_only" | "auto_approved";
type LiveWallLayoutMode = "spotlight" | "mosaic" | "featured";
type LiveWallQRStrategy = "interval" | "always" | "empty_only" | "hidden";
type LiveWallArrivalBehavior = "queue" | "next";

type LiveWallSessionState = {
  id: string;
  playerURL: string;
  isPlaying: boolean;
  isShowingCTA: boolean;
  contentPolicy: LiveWallContentPolicy;
  ctaEveryMedia: number;
  layoutMode: LiveWallLayoutMode;
  slideDuration: number;
  qrStrategy: LiveWallQRStrategy;
  arrivalBehavior: LiveWallArrivalBehavior;
  revision: number;
};

const LIVE_WALL_SESSION_STORAGE_PREFIX = "candid_live_wall_session_";

function getStoredLiveWallSession(
  eventId: string,
): LiveWallSessionState | null {
  if (typeof window === "undefined" || !eventId) {
    return null;
  }

  try {
    const stored = sessionStorage.getItem(
      `${LIVE_WALL_SESSION_STORAGE_PREFIX}${eventId}`,
    );

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as LiveWallSessionState;

    return parsed?.id && parsed?.playerURL ? parsed : null;
  } catch {
    return null;
  }
}

function saveStoredLiveWallSession(
  eventId: string,
  session: LiveWallSessionState,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(
      `${LIVE_WALL_SESSION_STORAGE_PREFIX}${eventId}`,
      JSON.stringify(session),
    );
  } catch {}
}

function clearStoredLiveWallSession(eventId: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.removeItem(`${LIVE_WALL_SESSION_STORAGE_PREFIX}${eventId}`);
  } catch {}
}

function getLiveWallPreset(mode: EventMode) {
  switch (mode) {
    case "silent":
      return {
        layout_mode: "spotlight" as const,
        slide_duration_seconds: 12,
        qr_strategy: "empty_only" as const,
        arrival_behavior: "queue" as const,
        cta_every_media: 12,
      };
    case "soft":
      return {
        layout_mode: "spotlight" as const,
        slide_duration_seconds: 8,
        qr_strategy: "interval" as const,
        arrival_behavior: "queue" as const,
        cta_every_media: 12,
      };
    case "party":
      return {
        layout_mode: "mosaic" as const,
        slide_duration_seconds: 5,
        qr_strategy: "interval" as const,
        arrival_behavior: "next" as const,
        cta_every_media: 5,
      };
    case "after":
      return {
        layout_mode: "spotlight" as const,
        slide_duration_seconds: 12,
        qr_strategy: "always" as const,
        arrival_behavior: "queue" as const,
        cta_every_media: 12,
      };
    default:
      return {
        layout_mode: "spotlight" as const,
        slide_duration_seconds: 8,
        qr_strategy: "interval" as const,
        arrival_behavior: "queue" as const,
        cta_every_media: 8,
      };
  }
}

export function EventOverviewView({
  event: initialEvent,
}: EventOverviewViewProps) {
  const t = useTranslations("event");
  const tCommon = useTranslations("common");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentEvent, setCurrentEvent] = useState<CandidEvent>(initialEvent);
  const [activeTab, setActiveTab] = useState<ActiveTab>("memories");
  const { mutateAsync: updateEvent, isPending: isUpdatingEvent } =
    useUpdateEvent();

  const updateMediaStatusMutation = useUpdateMediaStatus(currentEvent.id);
  const batchUpdateMediaStatusMutation = useBatchUpdateMediaStatus(
    currentEvent.id,
  );
  const deleteMediaMutation = useDeleteMedia(currentEvent.id);
  const batchDeleteMediaMutation = useBatchDeleteMedia(currentEvent.id);

  // Modals state
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isCustomizeQrOpen, setIsCustomizeQrOpen] = useState(false);
  const [qrConfigVersion, setQrConfigVersion] = useState(0);
  const [isCustomizeGuestPageOpen, setIsCustomizeGuestPageOpen] =
    useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRecoveryDismissed, setIsRecoveryDismissed] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [liveWallSession, setLiveWallSession] =
    useState<LiveWallSessionState | null>(() =>
      getStoredLiveWallSession(initialEvent.id),
    );
  const [isLaunchingLiveWall, setIsLaunchingLiveWall] = useState(false);
  const [isEndingLiveWall, setIsEndingLiveWall] = useState(false);
  const [isControllingLiveWall, setIsControllingLiveWall] = useState(false);
  const [isUpdatingLiveWallPolicy, setIsUpdatingLiveWallPolicy] =
    useState(false);
  const [isUpdatingLiveWallCadence, setIsUpdatingLiveWallCadence] =
    useState(false);
  const [liveWallConfirmation, setLiveWallConfirmation] =
    useState<LiveWallConfirmation>(null);
  const hasVerifiedLiveWallSessionRef = useRef(false);

  // Restore & verify live wall session across page reloads in the same browser session
  useEffect(() => {
    if (
      hasVerifiedLiveWallSessionRef.current ||
      !currentEvent.id ||
      !liveWallSession?.id
    ) {
      return;
    }

    hasVerifiedLiveWallSessionRef.current = true;

    const sessionId = liveWallSession.id;
    let isCancelled = false;

    void privateClient
      .get<{
        id: string;
        status?: string;
        show_cta?: boolean;
        content_policy?: LiveWallContentPolicy;
        cta_every_media?: number;
        layout_mode?: LiveWallLayoutMode;
        slide_duration_seconds?: number;
        qr_strategy?: LiveWallQRStrategy;
        arrival_behavior?: LiveWallArrivalBehavior;
        revision?: number;
      }>(
        `/api/v1/events/${encodeURIComponent(currentEvent.id)}/live-wall-sessions/${encodeURIComponent(sessionId)}`,
      )
      .then((response) => {
        if (isCancelled) {
          return;
        }

        if (
          response.data.status === "ended" ||
          response.data.status === "revoked"
        ) {
          clearStoredLiveWallSession(currentEvent.id);
          setLiveWallSession(null);
        } else {
          setLiveWallSession((current) => {
            if (!current || current.id !== sessionId) {
              return current;
            }

            const updated: LiveWallSessionState = {
              ...current,
              isShowingCTA: response.data.show_cta ?? current.isShowingCTA,
              contentPolicy:
                response.data.content_policy ?? current.contentPolicy,
              ctaEveryMedia:
                response.data.cta_every_media ?? current.ctaEveryMedia,
              layoutMode: response.data.layout_mode ?? current.layoutMode,
              slideDuration:
                response.data.slide_duration_seconds ?? current.slideDuration,
              qrStrategy: response.data.qr_strategy ?? current.qrStrategy,
              arrivalBehavior:
                response.data.arrival_behavior ?? current.arrivalBehavior,
              revision: response.data.revision ?? current.revision,
            };

            saveStoredLiveWallSession(currentEvent.id, updated);

            return updated;
          });
        }
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }

        if (
          error instanceof APIError &&
          (error.status === 404 || error.status === 410)
        ) {
          clearStoredLiveWallSession(currentEvent.id);
          setLiveWallSession(null);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [currentEvent.id, liveWallSession?.id]);

  const handleLaunchLiveWall = async () => {
    if (liveWallSession) {
      window.open(liveWallSession.playerURL, "candid-live-wall");

      return;
    }

    // Opening synchronously preserves the user's popup permission. The player
    // only receives its opaque, expiring token after the authenticated request
    // completes; the host JWT is never placed in the screen URL.
    const playerWindow = window.open(
      "/live-wall/launching",
      "candid-live-wall",
    );

    setIsLaunchingLiveWall(true);

    try {
      const response = await privateClient.post<{
        id: string;
        token: string;
        show_cta?: boolean;
        content_policy?: LiveWallContentPolicy;
        cta_every_media?: number;
        layout_mode?: LiveWallLayoutMode;
        slide_duration_seconds?: number;
        qr_strategy?: LiveWallQRStrategy;
        arrival_behavior?: LiveWallArrivalBehavior;
        revision?: number;
      }>(
        `/api/v1/events/${encodeURIComponent(currentEvent.id)}/live-wall-sessions`,
        undefined,
        { timeout: 15_000 },
      );
      const playerURL = `/live-wall/${encodeURIComponent(response.data.token)}`;

      const newSession: LiveWallSessionState = {
        id: response.data.id,
        playerURL,
        isPlaying: true,
        isShowingCTA: response.data.show_cta ?? false,
        contentPolicy: response.data.content_policy ?? "auto_approved",
        ctaEveryMedia: response.data.cta_every_media ?? 8,
        layoutMode: response.data.layout_mode ?? "spotlight",
        slideDuration: response.data.slide_duration_seconds ?? 5,
        qrStrategy: response.data.qr_strategy ?? "interval",
        arrivalBehavior: response.data.arrival_behavior ?? "queue",
        revision: response.data.revision ?? 0,
      };

      setLiveWallSession(newSession);
      saveStoredLiveWallSession(currentEvent.id, newSession);

      if (playerWindow) {
        playerWindow.location.replace(playerURL);
      } else {
        router.push(playerURL);
      }
    } catch (error) {
      const errorCode =
        error instanceof APIError ? error.code : "request_failed";

      playerWindow?.location.replace(
        `/live-wall/launching?error=${encodeURIComponent(errorCode)}`,
      );
      toast.error(t("gallery.actionFailed"));
    } finally {
      setIsLaunchingLiveWall(false);
    }
  };

  const runLiveWallCommand = async (command: LiveWallCommand) => {
    if (!liveWallSession) return;
    setIsControllingLiveWall(true);

    try {
      const response = await privateClient.post<{
        is_playing?: boolean;
        show_cta?: boolean;
      }>(
        `/api/v1/events/${encodeURIComponent(currentEvent.id)}/live-wall-sessions/${encodeURIComponent(liveWallSession.id)}/commands`,
        { command },
      );

      setLiveWallSession((current) => {
        if (!current) return null;

        const updated: LiveWallSessionState = {
          ...current,
          isPlaying:
            response.data.is_playing ??
            (command === "play"
              ? true
              : command === "pause"
                ? false
                : current.isPlaying),
          isShowingCTA:
            response.data.show_cta ??
            (command === "show_cta"
              ? true
              : command === "hide_cta"
                ? false
                : current.isShowingCTA),
        };

        saveStoredLiveWallSession(currentEvent.id, updated);

        return updated;
      });
    } catch {
      toast.error(t("gallery.actionFailed"));
    } finally {
      setIsControllingLiveWall(false);
    }
  };

  const handleLiveWallCommand = (command: LiveWallCommand) => {
    if (command === "blackout") {
      setLiveWallConfirmation("blackout");

      return;
    }

    void runLiveWallCommand(command);
  };

  const handleLiveWallContentPolicyChange = async (
    contentPolicy: LiveWallContentPolicy,
  ) => {
    if (!liveWallSession || liveWallSession.contentPolicy === contentPolicy)
      return;
    setIsUpdatingLiveWallPolicy(true);

    try {
      const response = await privateClient.patch<{ revision?: number }>(
        `/api/v1/events/${encodeURIComponent(currentEvent.id)}/live-wall-sessions/${encodeURIComponent(liveWallSession.id)}`,
        {
          content_policy: contentPolicy,
          expected_revision: liveWallSession.revision,
        },
      );

      setLiveWallSession((current) => {
        if (!current) return null;

        const updated: LiveWallSessionState = {
          ...current,
          contentPolicy,
          revision: response.data.revision ?? current.revision + 1,
        };

        saveStoredLiveWallSession(currentEvent.id, updated);

        return updated;
      });
    } catch {
      toast.error(t("gallery.actionFailed"));
    } finally {
      setIsUpdatingLiveWallPolicy(false);
    }
  };

  const handleLiveWallCTAEveryMediaChange = async (ctaEveryMedia: number) => {
    if (!liveWallSession || liveWallSession.ctaEveryMedia === ctaEveryMedia)
      return;
    setIsUpdatingLiveWallCadence(true);

    try {
      const response = await privateClient.patch<{ revision?: number }>(
        `/api/v1/events/${encodeURIComponent(currentEvent.id)}/live-wall-sessions/${encodeURIComponent(liveWallSession.id)}`,
        {
          cta_every_media: ctaEveryMedia,
          expected_revision: liveWallSession.revision,
        },
      );

      setLiveWallSession((current) => {
        if (!current) return null;

        const updated: LiveWallSessionState = {
          ...current,
          ctaEveryMedia,
          revision: response.data.revision ?? current.revision + 1,
        };

        saveStoredLiveWallSession(currentEvent.id, updated);

        return updated;
      });
    } catch {
      toast.error(t("gallery.actionFailed"));
    } finally {
      setIsUpdatingLiveWallCadence(false);
    }
  };

  const updateLiveWallPresentation = async (
    patch: Partial<{
      layout_mode: LiveWallLayoutMode;
      slide_duration_seconds: number;
      qr_strategy: LiveWallQRStrategy;
      arrival_behavior: LiveWallArrivalBehavior;
    }>,
  ) => {
    if (!liveWallSession) return;
    setIsControllingLiveWall(true);

    try {
      const response = await privateClient.patch<{
        layout_mode?: LiveWallLayoutMode;
        slide_duration_seconds?: number;
        qr_strategy?: LiveWallQRStrategy;
        arrival_behavior?: LiveWallArrivalBehavior;
        revision?: number;
      }>(
        `/api/v1/events/${encodeURIComponent(currentEvent.id)}/live-wall-sessions/${encodeURIComponent(liveWallSession.id)}`,
        { ...patch, expected_revision: liveWallSession.revision },
      );

      setLiveWallSession((current) => {
        if (!current) return null;

        const updated: LiveWallSessionState = {
          ...current,
          layoutMode: response.data.layout_mode ?? current.layoutMode,
          slideDuration:
            response.data.slide_duration_seconds ?? current.slideDuration,
          qrStrategy: response.data.qr_strategy ?? current.qrStrategy,
          arrivalBehavior:
            response.data.arrival_behavior ?? current.arrivalBehavior,
          revision: response.data.revision ?? current.revision + 1,
        };

        saveStoredLiveWallSession(currentEvent.id, updated);

        return updated;
      });
    } catch {
      toast.error(t("gallery.actionFailed"));
    } finally {
      setIsControllingLiveWall(false);
    }
  };

  const endLiveWall = async () => {
    if (!liveWallSession) return;
    setIsEndingLiveWall(true);

    try {
      await privateClient.post(
        `/api/v1/events/${encodeURIComponent(currentEvent.id)}/live-wall-sessions/${encodeURIComponent(liveWallSession.id)}/end`,
      );
      clearStoredLiveWallSession(currentEvent.id);
      setLiveWallSession(null);
    } catch {
      toast.error(t("gallery.actionFailed"));
    } finally {
      setIsEndingLiveWall(false);
    }
  };

  const handleEndLiveWall = () => setLiveWallConfirmation("end");

  const confirmLiveWallAction = () => {
    if (liveWallConfirmation === "blackout") {
      setLiveWallConfirmation(null);
      void runLiveWallCommand("blackout");

      return;
    }

    if (liveWallConfirmation === "end") {
      setLiveWallConfirmation(null);
      void endLiveWall();
    }
  };

  // One stream per event, mounted here. Every child reads the same query
  // cache, so the gallery and the live wall stay current without opening
  // connections of their own.
  const { isLive } = useEventRealtime(currentEvent.id);

  // Counters come from the gallery query, which the realtime cache keeps
  // current. They used to be read from a locally stored copy of the event,
  // which drifted from the server the moment anything changed elsewhere.
  const { data: mediaPages } = useEventMedia(currentEvent.id, {
    filter: "all",
    sort: "newest",
  });
  const mediaCount = mediaPages?.pages[0]?.counts?.all ?? 0;
  const liveWallEligibleMediaCount =
    liveWallSession?.contentPolicy === "featured_only"
      ? (mediaPages?.pages[0]?.counts?.favorites ?? 0)
      : mediaCount;

  const activeMode = currentEvent.event_mode || "social";
  const lifecycleStatus = getEventLifecycleStatus(currentEvent);
  const publicCode = getEventPublicCode(currentEvent);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicPath = currentEvent.slug
    ? `/e/${currentEvent.slug}`
    : currentEvent.public_url || `/e/${publicCode}`;
  const fullGuestUrl = currentEvent.guest_url || `${origin}${publicPath}`;

  // Pre-generate QR code for instant modal & print responsiveness
  useEffect(() => {
    let active = true;

    void import("qrcode")
      .then((qr) =>
        qr.toDataURL(fullGuestUrl, {
          width: 600,
          margin: 1.5,
          color: { dark: "#181e17", light: "#ffffff" },
          errorCorrectionLevel: "H",
        }),
      )
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [fullGuestUrl]);

  // --- Participation summary data ---
  const expectedGuests = currentEvent.expected_guest_count ?? 0;
  const contributors = currentEvent.metrics?.contributors_count || 0;
  const memoriesCount =
    (currentEvent.metrics?.photos_count || 0) +
    (currentEvent.metrics?.videos_count || 0);
  const participationRate =
    expectedGuests > 0
      ? Math.min(100, Math.round((contributors / expectedGuests) * 100))
      : 0;

  // --- Handlers ---
  const handleModeChange = async (newMode: EventMode) => {
    const updated = await updateEvent({
      id: currentEvent.id,
      event_mode: newMode,
    });

    setCurrentEvent((previous) => ({ ...previous, ...updated }));

    if (!liveWallSession) return;

    const preset = getLiveWallPreset(newMode);

    try {
      const response = await privateClient.patch<{
        layout_mode?: LiveWallLayoutMode;
        slide_duration_seconds?: number;
        qr_strategy?: LiveWallQRStrategy;
        arrival_behavior?: LiveWallArrivalBehavior;
        cta_every_media?: number;
        revision?: number;
      }>(
        `/api/v1/events/${encodeURIComponent(currentEvent.id)}/live-wall-sessions/${encodeURIComponent(liveWallSession.id)}`,
        { ...preset, expected_revision: liveWallSession.revision },
      );

      setLiveWallSession((current) => {
        if (!current) return null;

        const updated: LiveWallSessionState = {
          ...current,
          layoutMode: response.data.layout_mode ?? current.layoutMode,
          slideDuration:
            response.data.slide_duration_seconds ?? current.slideDuration,
          qrStrategy: response.data.qr_strategy ?? current.qrStrategy,
          arrivalBehavior:
            response.data.arrival_behavior ?? current.arrivalBehavior,
          ctaEveryMedia: response.data.cta_every_media ?? current.ctaEveryMedia,
          revision: response.data.revision ?? current.revision + 1,
        };

        saveStoredLiveWallSession(currentEvent.id, updated);

        return updated;
      });
    } catch {
      // The event mode has already been saved. Keep the running wall intact
      // and let the host retry its presentation settings separately.
    }
  };

  // Media state lives in the query cache, which the mutation and the realtime
  // stream both keep current. Writing a second copy to local storage here used
  // to fight both of them.
  //
  // The lookup spans every cached filter rather than just "all": that filter
  // excludes hidden media, so searching it alone would report a hidden item
  // as missing and turn "show again" back into "hide".
  const findMedia = (mediaId: string) =>
    findCachedMediaItem(queryClient, currentEvent.id, mediaId);

  const handleToggleMediaStatus = async (mediaId: string) => {
    const target = findMedia(mediaId);
    const nextStatus = target?.status === "hidden" ? "ready" : "hidden";

    try {
      await updateMediaStatusMutation.mutateAsync({
        mediaId,
        status: nextStatus,
      });

      if (nextStatus === "hidden") {
        toast.info(t("gallery.mediaHidden"));
      } else {
        toast.success(t("gallery.mediaVisible"));
      }
    } catch {
      toast.error(t("gallery.actionFailed"));
    }
  };

  const handleToggleMediaFavorite = async (mediaId: string) => {
    const target = findMedia(mediaId);
    const nextStatus = target?.status === "featured" ? "ready" : "featured";

    try {
      await updateMediaStatusMutation.mutateAsync({
        mediaId,
        status: nextStatus,
      });

      if (nextStatus === "featured") {
        toast.success(t("gallery.mediaFavorited"));
      } else {
        toast.info(t("gallery.mediaUnfavorited"));
      }
    } catch {
      toast.error(t("gallery.actionFailed"));
    }
  };

  const handleBatchStatusChange = (
    mediaIds: string[],
    status: EventMediaItem["status"],
  ) => {
    void batchUpdateMediaStatusMutation
      .mutateAsync({ mediaIds, status })
      .catch(() => toast.error(t("gallery.actionFailed")));
  };

  const handleBatchDelete = (mediaIds: string[]) => {
    void batchDeleteMediaMutation
      .mutateAsync(mediaIds)
      .catch(() => toast.error(t("gallery.actionFailed")));
  };

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      await deleteMediaMutation.mutateAsync(mediaId);
      toast.success(t("gallery.mediaDeleted"));
    } catch {
      toast.error(t("gallery.actionFailed"));
    }
  };

  const handleSaveSettings = async (partial: Partial<CandidEvent>) => {
    const updated = await updateEvent({
      id: currentEvent.id,
      name: partial.name,
      event_type: partial.event_type,
      event_date: partial.event_date,
      date_unknown: partial.date_unknown,
      expected_guest_count: partial.expected_guest_count,
      gallery_enabled: partial.gallery_enabled,
    });

    setCurrentEvent((previous) => ({ ...previous, ...updated, ...partial }));
  };

  const handleCopyReminder = async () => {
    try {
      const reminderText = `${t("overview.afterPromptHeading")} ${fullGuestUrl}`;

      await navigator.clipboard.writeText(reminderText);
      toast.success(t("overview.reminderCopied"));
    } catch {
      toast.error(t("overview.copyReminderLink"));
    }
  };

  const formattedDate = currentEvent.event_date
    ? formatDate(currentEvent.event_date, locale, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : t("ready.noDate");

  return (
    <div className="event-hub">
      {/* Compact Header */}
      <EventHubHeader
        event={currentEvent}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenEdit={() => setIsEditDialogOpen(true)}
        onLaunchLiveWall={handleLaunchLiveWall}
        onOpenCustomizeQr={() => setIsCustomizeQrOpen(true)}
        onOpenPrint={() => setIsPrintModalOpen(true)}
        onOpenCustomizeTheme={() => setIsCustomizeGuestPageOpen(true)}
      />

      {/* Tab Navigation — Memories | Participation | Engage | Settings */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as ActiveTab)}
        className="w-full"
      >
        <TabsList className="event-hub__tabs" aria-label={t("hub.tabMemories")}>
          <TabsTrigger value="memories" className="event-hub__tab">
            <Images size={16} aria-hidden="true" />
            <span>{t("hub.tabMemories")}</span>
            {mediaCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-primary/10 text-primary font-semibold">
                {mediaCount}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger value="participation" className="event-hub__tab">
            <ChartBar size={16} aria-hidden="true" />
            <span>{t("hub.tabParticipation")}</span>
          </TabsTrigger>

          <TabsTrigger value="engage" className="event-hub__tab">
            <Megaphone size={16} aria-hidden="true" />
            <span>{t("hub.tabEngage")}</span>
          </TabsTrigger>

          <TabsTrigger value="settings" className="event-hub__tab">
            <Gear size={16} aria-hidden="true" />
            <span>{t("hub.tabSettings")}</span>
          </TabsTrigger>

          <TabsIndicator className="event-hub__indicator" />
        </TabsList>
      </Tabs>

      {/* ═══ TAB: MEMORIES ═══ */}
      {activeTab === "memories" && (
        <div className="event-hub__panel">
          {/* Compact participation summary (only when media exists) */}
          {memoriesCount > 0 && (
            <button
              type="button"
              className="event-hub__participation-summary"
              onClick={() => setActiveTab("participation")}
              title={t("hub.tabParticipation")}
            >
              <span>
                {t("overview.participationSummary", {
                  memories: memoriesCount,
                  contributors,
                  rate: participationRate,
                })}
              </span>
            </button>
          )}

          {/* Lifecycle-aware banners */}
          {lifecycleStatus === "upcoming" && mediaCount === 0 && (
            <div className="event-hub__readiness-banner">
              <span>{t("overview.readinessBanner")}</span>
            </div>
          )}

          {lifecycleStatus === "ended" && !isRecoveryDismissed && (
            <div className="event-hub__recovery-banner">
              <div className="event-hub__recovery-banner-content">
                <span>{t("overview.recoveryBanner")}</span>
                <button
                  type="button"
                  className="event-hub__recovery-banner-action"
                  onClick={handleCopyReminder}
                >
                  {t("overview.collectMore")}
                </button>
              </div>
              <button
                type="button"
                className="event-hub__recovery-banner-close"
                onClick={() => setIsRecoveryDismissed(true)}
                aria-label={tCommon("actions.close")}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Gallery View */}
          <EventGalleryView
            eventId={currentEvent.id}
            isLive={isLive}
            eventName={currentEvent.name}
            publicCode={publicCode}
            onToggleStatus={handleToggleMediaStatus}
            onToggleFavorite={handleToggleMediaFavorite}
            onBatchStatusChange={handleBatchStatusChange}
            onBatchDelete={handleBatchDelete}
            onDeleteMedia={handleDeleteMedia}
            guestUrl={fullGuestUrl}
            onOpenShare={() => setIsShareOpen(true)}
            onOpenPrint={() => setIsPrintModalOpen(true)}
          />
        </div>
      )}

      {/* ═══ TAB: PARTICIPATION ═══ */}
      {activeTab === "participation" && (
        <div className="event-hub__panel">
          <EventAnalyticsView event={currentEvent} />
        </div>
      )}

      {/* ═══ TAB: ENGAGE ═══ */}
      {activeTab === "engage" && (
        <div className="event-hub__panel">
          <EventEngageView
            activeMode={activeMode}
            onModeChange={handleModeChange}
            isChangingMode={isUpdatingEvent}
            onLaunchLiveWall={handleLaunchLiveWall}
            isLaunchingLiveWall={isLaunchingLiveWall}
            isLiveWallActive={Boolean(liveWallSession)}
            onEndLiveWall={handleEndLiveWall}
            isEndingLiveWall={isEndingLiveWall}
            isLiveWallPlaying={liveWallSession?.isPlaying}
            isLiveWallShowingCTA={liveWallSession?.isShowingCTA}
            eligibleMediaCount={liveWallEligibleMediaCount}
            onLiveWallCommand={handleLiveWallCommand}
            isControllingLiveWall={isControllingLiveWall}
            liveWallCTAEveryMedia={liveWallSession?.ctaEveryMedia}
            onLiveWallCTAEveryMediaChange={handleLiveWallCTAEveryMediaChange}
            isUpdatingLiveWallCadence={isUpdatingLiveWallCadence}
            liveWallContentPolicy={liveWallSession?.contentPolicy}
            onLiveWallContentPolicyChange={handleLiveWallContentPolicyChange}
            isUpdatingLiveWallPolicy={isUpdatingLiveWallPolicy}
            liveWallLayoutMode={liveWallSession?.layoutMode}
            liveWallSlideDuration={liveWallSession?.slideDuration}
            liveWallQRStrategy={liveWallSession?.qrStrategy}
            liveWallArrivalBehavior={liveWallSession?.arrivalBehavior}
            onLiveWallPresentationChange={updateLiveWallPresentation}
          />
        </div>
      )}

      {/* ═══ TAB: SETTINGS ═══ */}
      {activeTab === "settings" && (
        <div className="event-hub__panel">
          <div className="event-hub__settings">
            {/* Main Event Configuration Card */}
            <div className="event-hub__settings-card">
              <div className="event-hub__settings-card-header">
                <div>
                  <h3 className="font-heading text-base font-semibold text-ink">
                    {t("settings.heading")}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("settings.description")}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="text-xs h-9 shrink-0"
                >
                  {t("hub.editEventBtn")}
                </Button>
              </div>

              <div className="event-hub__settings-list">
                <div className="event-hub__settings-row">
                  <span className="text-muted-foreground">
                    {t("create.nameLabel")}
                  </span>
                  <span className="font-semibold text-ink">
                    {currentEvent.name}
                  </span>
                </div>

                <div className="event-hub__settings-row">
                  <span className="text-muted-foreground">
                    {t("create.typeLabel")}
                  </span>
                  <span className="font-semibold text-ink">
                    {t(`types.${currentEvent.event_type}`)}
                  </span>
                </div>

                <div className="event-hub__settings-row">
                  <span className="text-muted-foreground">
                    {t("create.dateLabel")}
                  </span>
                  <span className="font-semibold text-ink">
                    {formattedDate}
                  </span>
                </div>

                <div className="event-hub__settings-row">
                  <span className="text-muted-foreground">
                    {t("guestCount.heading")}
                  </span>
                  <span className="font-semibold text-ink">
                    {currentEvent.expected_guest_count || 100}
                  </span>
                </div>

                <div className="event-hub__settings-row">
                  <span className="text-muted-foreground">
                    {t("settings.galleryVisibilityLabel")}
                  </span>
                  <span className="font-semibold text-primary">
                    {currentEvent.gallery_enabled !== false
                      ? t("checklist.completed")
                      : t("checklist.optional")}
                  </span>
                </div>
              </div>
            </div>

            {/* Guest Page Customization Card */}
            <div className="event-hub__settings-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <PaintBrush size={20} weight="bold" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-ink">
                      {t("settings.guestPageCardTitle")}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("settings.guestPageCardDesc")}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => setIsCustomizeGuestPageOpen(true)}
                  className="text-xs h-9 gap-1.5 shadow-xs shrink-0"
                >
                  <PaintBrush size={14} weight="bold" />
                  <span>{t("settings.customizeGuestPageBtn")}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={liveWallConfirmation !== null}
        onOpenChange={(open) => {
          if (!open) setLiveWallConfirmation(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogTitle className="mb-1 text-lg font-semibold text-ink">
            {liveWallConfirmation === "end"
              ? t("liveWall.endSessionTitle")
              : t("liveWall.blackoutTitle")}
          </DialogTitle>
          <DialogDescription className="mb-6 text-sm text-muted-foreground">
            {liveWallConfirmation === "end"
              ? t("liveWall.endSessionDescription")
              : t("liveWall.blackoutDescription")}
          </DialogDescription>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLiveWallConfirmation(null)}
            >
              {tCommon("actions.cancel")}
            </Button>
            <Button
              type="button"
              onClick={confirmLiveWallAction}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {liveWallConfirmation === "end"
                ? t("liveWall.endSessionAction")
                : t("liveWall.blackoutAction")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Popover */}
      <EventSharePopover
        event={currentEvent}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      {/* Print Sign Studio Modal */}
      <EventPrintModal
        event={currentEvent}
        qrDataUrl={qrDataUrl}
        configVersion={qrConfigVersion}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />

      {/* QR Card Customizer Modal */}
      <QRCustomizeModal
        event={currentEvent}
        guestUrl={fullGuestUrl}
        formattedDate={currentEvent.event_date ? formattedDate : null}
        isOpen={isCustomizeQrOpen}
        onClose={() => setIsCustomizeQrOpen(false)}
        onApplied={async (config) => {
          const updated = await updateEvent({
            id: currentEvent.id,
            qr_config: config,
            setup_checklist: {
              customizedQr: true,
            },
          });

          setCurrentEvent(updated);
          setQrConfigVersion((v) => v + 1);
        }}
      />

      {/* Guest Page Theme Customizer Modal */}
      <GuestThemeCustomizeModal
        event={currentEvent}
        isOpen={isCustomizeGuestPageOpen}
        onClose={() => setIsCustomizeGuestPageOpen(false)}
        onApplied={async (themeConfig) => {
          const updated = await updateEvent({
            id: currentEvent.id,
            guest_theme: themeConfig,
            setup_checklist: {
              customizedPage: true,
            },
          });

          setCurrentEvent(updated);
        }}
      />

      {/* Edit Event Dialog */}
      <EventEditDialog
        event={currentEvent}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
