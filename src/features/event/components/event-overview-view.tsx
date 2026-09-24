"use client";

import { useEffect, useState } from "react";
import { ChartBar, Gear, Images, Megaphone, X } from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import "./event.css";
import type { CandidEvent, EventMediaItem, EventMode } from "../types/event";
import { getEventLifecycleStatus, getEventPublicCode } from "../types/event";
import {
  batchDeleteStoredMedia,
  batchUpdateStoredMediaStatus,
  deleteStoredMediaItem,
  toggleStoredMediaFeatured,
  toggleStoredMediaStatus,
  updateStoredEvent,
  updateStoredEventMode,
} from "../lib/event-store";
import { EventAnalyticsView } from "./event-analytics-view";
import { EventEditDialog } from "./event-edit-dialog";
import { EventEngageView } from "./event-engage-view";
import { EventGalleryView } from "./event-gallery-view";
import { EventHubHeader } from "./event-hub-header";
import { EventLiveWallModal } from "./event-live-wall-modal";
import { EventSharePopover } from "./event-share-popover";
import { EventPrintModal } from "./print";
import { formatDate } from "@/i18n/format";
import type { AppLocale } from "@/i18n/locales";
import { Button } from "@/components/ui";

type EventOverviewViewProps = {
  event: CandidEvent;
};

type ActiveTab = "memories" | "participation" | "engage" | "settings";

export function EventOverviewView({
  event: initialEvent,
}: EventOverviewViewProps) {
  const t = useTranslations("event");
  const tCommon = useTranslations("common");
  const locale = useLocale() as AppLocale;

  const [currentEvent, setCurrentEvent] = useState<CandidEvent>(initialEvent);
  const [activeTab, setActiveTab] = useState<ActiveTab>("memories");

  // Modals state
  const [isLiveWallOpen, setIsLiveWallOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRecoveryDismissed, setIsRecoveryDismissed] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const mediaItems = currentEvent.media_items || [];
  const activeMode = currentEvent.event_mode || "social";
  const lifecycleStatus = getEventLifecycleStatus(currentEvent);
  const publicCode = getEventPublicCode(currentEvent);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicPath = currentEvent.slug
    ? `/e/${currentEvent.slug}`
    : currentEvent.public_url || `/e/${publicCode}`;
  const fullGuestUrl = currentEvent.guest_url || `${origin}${publicPath}`;
  const testGuestUrl = `${fullGuestUrl}?is_test=true`;

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
  const expectedGuests = currentEvent.expected_guest_count || 100;
  const contributors = currentEvent.metrics?.contributors_count || 0;
  const memoriesCount =
    (currentEvent.metrics?.photos_count || 0) +
    (currentEvent.metrics?.videos_count || 0);
  const participationRate =
    expectedGuests > 0
      ? Math.min(100, Math.round((contributors / expectedGuests) * 100))
      : 0;

  // --- Handlers ---
  const handleModeChange = (newMode: EventMode) => {
    const updated = updateStoredEventMode(currentEvent.id, newMode);

    if (updated) setCurrentEvent(updated);
  };

  const handleToggleMediaStatus = (mediaId: string) => {
    const updated = toggleStoredMediaStatus(currentEvent.id, mediaId);

    if (updated) {
      setCurrentEvent(updated);

      const target = updated.media_items?.find((m) => m.id === mediaId);

      if (target?.status === "hidden") {
        toast.info(t("gallery.mediaHidden"));
      } else {
        toast.success(t("gallery.mediaVisible"));
      }
    }
  };

  const handleToggleMediaFavorite = (mediaId: string) => {
    const updated = toggleStoredMediaFeatured(currentEvent.id, mediaId);

    if (updated) {
      setCurrentEvent(updated);

      const target = updated.media_items?.find((m) => m.id === mediaId);

      if (target?.status === "featured") {
        toast.success(t("gallery.mediaFavorited"));
      } else {
        toast.info(t("gallery.mediaUnfavorited"));
      }
    }
  };

  const handleBatchStatusChange = (
    mediaIds: string[],
    status: EventMediaItem["status"],
  ) => {
    const updated = batchUpdateStoredMediaStatus(
      currentEvent.id,
      mediaIds,
      status,
    );

    if (updated) {
      setCurrentEvent(updated);
    }
  };

  const handleBatchDelete = (mediaIds: string[]) => {
    const updated = batchDeleteStoredMedia(currentEvent.id, mediaIds);

    if (updated) {
      setCurrentEvent(updated);
    }
  };

  const handleDeleteMedia = (mediaId: string) => {
    const updated = deleteStoredMediaItem(currentEvent.id, mediaId);

    if (updated) {
      setCurrentEvent(updated);
      toast.success(t("gallery.mediaDeleted"));
    }
  };

  const handleSaveSettings = (partial: Partial<CandidEvent>) => {
    const updated = updateStoredEvent(currentEvent.id, partial);

    if (updated) setCurrentEvent(updated);
  };

  const handleDownloadAll = () => {
    if (mediaItems.length === 0) return;

    toast.success(t("gallery.downloadAll", { count: mediaItems.length }));
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
        onLaunchLiveWall={() => setIsLiveWallOpen(true)}
        onDownloadAll={mediaItems.length > 0 ? handleDownloadAll : undefined}
      />

      {/* Tab Navigation — Memories | Participation | Engage | Settings */}
      <div
        className="event-hub__tabs"
        role="tablist"
        aria-label={t("hub.tabMemories")}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "memories"}
          onClick={() => setActiveTab("memories")}
          className={`event-hub__tab ${
            activeTab === "memories" ? "event-hub__tab--active" : ""
          }`}
        >
          <Images size={16} aria-hidden="true" />
          <span>{t("hub.tabMemories")}</span>
          {mediaItems.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-primary/10 text-primary font-semibold">
              {mediaItems.length}
            </span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "participation"}
          onClick={() => setActiveTab("participation")}
          className={`event-hub__tab ${
            activeTab === "participation" ? "event-hub__tab--active" : ""
          }`}
        >
          <ChartBar size={16} aria-hidden="true" />
          <span>{t("hub.tabParticipation")}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "engage"}
          onClick={() => setActiveTab("engage")}
          className={`event-hub__tab ${
            activeTab === "engage" ? "event-hub__tab--active" : ""
          }`}
        >
          <Megaphone size={16} aria-hidden="true" />
          <span>{t("hub.tabEngage")}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
          className={`event-hub__tab ${
            activeTab === "settings" ? "event-hub__tab--active" : ""
          }`}
        >
          <Gear size={16} aria-hidden="true" />
          <span>{t("hub.tabSettings")}</span>
        </button>
      </div>

      {/* ═══ TAB: MEMORIES ═══ */}
      {activeTab === "memories" && (
        <>
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
          {lifecycleStatus === "upcoming" && mediaItems.length === 0 && (
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
            items={mediaItems}
            eventName={currentEvent.name}
            publicCode={publicCode}
            onToggleStatus={handleToggleMediaStatus}
            onToggleFavorite={handleToggleMediaFavorite}
            onBatchStatusChange={handleBatchStatusChange}
            onBatchDelete={handleBatchDelete}
            onDeleteMedia={handleDeleteMedia}
            guestUrl={testGuestUrl}
            onOpenShare={() => setIsShareOpen(true)}
            onOpenPrint={() => setIsPrintModalOpen(true)}
          />
        </>
      )}

      {/* ═══ TAB: PARTICIPATION ═══ */}
      {activeTab === "participation" && (
        <EventAnalyticsView event={currentEvent} />
      )}

      {/* ═══ TAB: ENGAGE ═══ */}
      {activeTab === "engage" && (
        <EventEngageView
          activeMode={activeMode}
          onModeChange={handleModeChange}
          onLaunchLiveWall={() => setIsLiveWallOpen(true)}
        />
      )}

      {/* ═══ TAB: SETTINGS ═══ */}
      {activeTab === "settings" && (
        <div className="event-hub__settings">
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <div>
              <h3 className="font-heading text-base text-ink">
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
              className="text-xs h-9"
            >
              {t("hub.editEventBtn")}
            </Button>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-line/60">
              <span className="text-muted-foreground">
                {t("create.nameLabel")}
              </span>
              <span className="font-semibold text-ink">
                {currentEvent.name}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-line/60">
              <span className="text-muted-foreground">
                {t("create.typeLabel")}
              </span>
              <span className="font-semibold text-ink">
                {t(`types.${currentEvent.event_type}`)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-line/60">
              <span className="text-muted-foreground">
                {t("create.dateLabel")}
              </span>
              <span className="font-semibold text-ink">{formattedDate}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-line/60">
              <span className="text-muted-foreground">
                {t("guestCount.heading")}
              </span>
              <span className="font-semibold text-ink">
                {currentEvent.expected_guest_count || 100}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
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
      )}

      {/* Fullscreen Live Wall */}
      <EventLiveWallModal
        event={currentEvent}
        isOpen={isLiveWallOpen}
        onClose={() => setIsLiveWallOpen(false)}
      />

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
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
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
