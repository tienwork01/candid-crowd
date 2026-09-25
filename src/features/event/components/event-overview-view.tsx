"use client";

import { useEffect, useState } from "react";
import {
  ChartBar,
  Gear,
  Images,
  Megaphone,
  PaintBrush,
  X,
} from "@phosphor-icons/react";
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
import { GuestThemeCustomizeModal } from "./guest-theme";
import { EventEngageView } from "./event-engage-view";
import { EventGalleryView } from "./event-gallery-view";
import { EventHubHeader } from "./event-hub-header";
import { EventLiveWallModal } from "./event-live-wall-modal";
import { EventSharePopover } from "./event-share-popover";
import { EventPrintModal } from "./print";
import { QRCustomizeModal } from "./qr-customize";
import {
  useBatchDeleteMedia,
  useBatchUpdateMediaStatus,
  useDeleteMedia,
  useUpdateEvent,
  useUpdateMediaStatus,
} from "../hooks";
import { formatDate } from "@/i18n/format";
import type { AppLocale } from "@/i18n/locales";
import {
  Button,
  Tabs,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "@/components/ui";

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
  const { mutateAsync: updateEvent } = useUpdateEvent();

  const updateMediaStatusMutation = useUpdateMediaStatus(currentEvent.id);
  const batchUpdateMediaStatusMutation = useBatchUpdateMediaStatus(
    currentEvent.id,
  );
  const deleteMediaMutation = useDeleteMedia(currentEvent.id);
  const batchDeleteMediaMutation = useBatchDeleteMedia(currentEvent.id);

  // Modals state
  const [isLiveWallOpen, setIsLiveWallOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isCustomizeQrOpen, setIsCustomizeQrOpen] = useState(false);
  const [qrConfigVersion, setQrConfigVersion] = useState(0);
  const [isCustomizeGuestPageOpen, setIsCustomizeGuestPageOpen] =
    useState(false);
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
    const target = currentEvent.media_items?.find((m) => m.id === mediaId);
    const nextStatus = target?.status === "hidden" ? "ready" : "hidden";
    const updated = toggleStoredMediaStatus(currentEvent.id, mediaId);

    if (updated) {
      setCurrentEvent(updated);

      if (nextStatus === "hidden") {
        toast.info(t("gallery.mediaHidden"));
      } else {
        toast.success(t("gallery.mediaVisible"));
      }
    }

    void updateMediaStatusMutation
      .mutateAsync({
        mediaId,
        status: nextStatus,
      })
      .catch(() => {});
  };

  const handleToggleMediaFavorite = (mediaId: string) => {
    const target = currentEvent.media_items?.find((m) => m.id === mediaId);
    const nextStatus = target?.status === "featured" ? "ready" : "featured";
    const updated = toggleStoredMediaFeatured(currentEvent.id, mediaId);

    if (updated) {
      setCurrentEvent(updated);

      if (nextStatus === "featured") {
        toast.success(t("gallery.mediaFavorited"));
      } else {
        toast.info(t("gallery.mediaUnfavorited"));
      }
    }

    void updateMediaStatusMutation
      .mutateAsync({
        mediaId,
        status: nextStatus,
      })
      .catch(() => {});
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

    void batchUpdateMediaStatusMutation
      .mutateAsync({
        mediaIds,
        status,
      })
      .catch(() => {});
  };

  const handleBatchDelete = (mediaIds: string[]) => {
    const updated = batchDeleteStoredMedia(currentEvent.id, mediaIds);

    if (updated) {
      setCurrentEvent(updated);
    }

    void batchDeleteMediaMutation.mutateAsync(mediaIds).catch(() => {});
  };

  const handleDeleteMedia = (mediaId: string) => {
    const updated = deleteStoredMediaItem(currentEvent.id, mediaId);

    if (updated) {
      setCurrentEvent(updated);
      toast.success(t("gallery.mediaDeleted"));
    }

    void deleteMediaMutation.mutateAsync(mediaId).catch(() => {});
  };

  const handleSaveSettings = (partial: Partial<CandidEvent>) => {
    const updated = updateStoredEvent(currentEvent.id, partial);

    if (updated) setCurrentEvent(updated);
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
            {mediaItems.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-primary/10 text-primary font-semibold">
                {mediaItems.length}
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
            eventId={currentEvent.id}
            items={mediaItems}
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
            onLaunchLiveWall={() => setIsLiveWallOpen(true)}
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
        onApplied={() => {
          setQrConfigVersion((v) => v + 1);

          if (currentEvent && !currentEvent.setup_checklist?.customizedQr) {
            void updateEvent({
              id: currentEvent.id,
              setup_checklist: {
                customizedQr: true,
              },
            });
          }
        }}
      />

      {/* Guest Page Theme Customizer Modal */}
      <GuestThemeCustomizeModal
        event={currentEvent}
        isOpen={isCustomizeGuestPageOpen}
        onClose={() => setIsCustomizeGuestPageOpen(false)}
        onApplied={(themeConfig) => {
          setCurrentEvent((prev) => ({
            ...prev,
            guest_theme: themeConfig,
            setup_checklist: {
              ...(prev.setup_checklist || {
                eventCreated: true,
                qrReady: true,
                testedGuestExperience: false,
                addedGuestCount: false,
                customizedQr: false,
                customizedPage: false,
              }),
              customizedPage: true,
            },
          }));
          void updateEvent({
            id: currentEvent.id,
            guest_theme: themeConfig,
            setup_checklist: {
              customizedPage: true,
            },
          });
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
