"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  ChartBar,
  ClockAfternoon,
  Copy,
  DownloadSimple,
  Gear,
  Images,
  QrCode,
  ShareNetwork,
  Sparkle,
  Users,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import "./event.css";
import type {
  CandidEvent,
  EventLifecyclePhase,
  EventMediaItem,
  EventMode,
} from "../types/event";
import {
  deleteStoredMediaItem,
  toggleStoredMediaStatus,
  updateStoredEvent,
  updateStoredEventMode,
} from "../lib/event-store";
import { EventAnalyticsView } from "./event-analytics-view";
import { EventEditDialog } from "./event-edit-dialog";
import { EventGalleryView } from "./event-gallery-view";
import { EventHubHeader } from "./event-hub-header";
import { EventLiveWallModal } from "./event-live-wall-modal";
import { EventMediaLightbox } from "./event-media-lightbox";
import { EventModeSelector } from "./event-mode-selector";
import { EventQrDialog } from "./event-qr-dialog";
import { formatDate } from "@/i18n/format";
import type { AppLocale } from "@/i18n/locales";
import { Button, Card, CardContent } from "@/components/ui";

type EventOverviewViewProps = {
  event: CandidEvent;
};

type ActiveTab = "gallery" | "analytics" | "timeline" | "settings";

export function EventOverviewView({
  event: initialEvent,
}: EventOverviewViewProps) {
  const t = useTranslations("event");
  const locale = useLocale() as AppLocale;

  const [currentEvent, setCurrentEvent] = useState<CandidEvent>(initialEvent);
  const [activeTab, setActiveTab] = useState<ActiveTab>("gallery");
  const [activePhase, setActivePhase] = useState<EventLifecyclePhase>(
    currentEvent.lifecycle_phase || "during",
  );

  // Modals state
  const [lightboxItem, setLightboxItem] = useState<EventMediaItem | null>(null);
  const [isLiveWallOpen, setIsLiveWallOpen] = useState(false);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const mediaItems = currentEvent.media_items || [];
  const activeMode = currentEvent.event_mode || "social";

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicPath = currentEvent.public_url || `/e/${currentEvent.slug}`;
  const fullGuestUrl = currentEvent.guest_url || `${origin}${publicPath}`;

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

  const handleDeleteMedia = (mediaId: string) => {
    const updated = deleteStoredMediaItem(currentEvent.id, mediaId);

    if (updated) {
      setCurrentEvent(updated);
      toast.success(t("gallery.mediaDeleted"));

      if (lightboxItem?.id === mediaId) {
        setLightboxItem(null);
      }
    }
  };

  const handleSaveSettings = (partial: Partial<CandidEvent>) => {
    const updated = updateStoredEvent(currentEvent.id, partial);

    if (updated) setCurrentEvent(updated);
  };

  // Lightbox navigation
  const visibleItems = mediaItems.filter((m) => m.status !== "hidden");
  const lightboxIndex = lightboxItem
    ? visibleItems.findIndex((m) => m.id === lightboxItem.id)
    : -1;
  const hasPrev = lightboxIndex > 0;
  const hasNext = lightboxIndex >= 0 && lightboxIndex < visibleItems.length - 1;

  const handlePrevLightbox = () => {
    if (hasPrev) setLightboxItem(visibleItems[lightboxIndex - 1]);
  };

  const handleNextLightbox = () => {
    if (hasNext) setLightboxItem(visibleItems[lightboxIndex + 1]);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullGuestUrl);
      toast.success(t("ready.linkCopied"));
    } catch {
      toast.error(t("ready.copyLink"));
    }
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

  let daysRemaining: number | null = null;

  if (currentEvent.event_date) {
    const target = new Date(currentEvent.event_date).getTime();
    const now = new Date().getTime();

    daysRemaining = Math.max(
      0,
      Math.ceil((target - now) / (1000 * 60 * 60 * 24)),
    );
  }

  const expectedGuests = currentEvent.expected_guest_count || 100;
  const mockContributors =
    activePhase === "during" ? 38 : activePhase === "after" ? 76 : 0;
  const mockMemories =
    activePhase === "during" ? 142 : activePhase === "after" ? 318 : 0;
  const mockScans =
    activePhase === "during" ? 88 : activePhase === "after" ? 124 : 0;
  const mockRate = Math.round((mockContributors / expectedGuests) * 100);

  return (
    <div className="event-hub">
      {/* Top Editorial Header */}
      <EventHubHeader
        event={currentEvent}
        onOpenQr={() => setIsQrDialogOpen(true)}
        onOpenEdit={() => setIsEditDialogOpen(true)}
        onLaunchLiveWall={() => setIsLiveWallOpen(true)}
      />

      {/* 5 Event Modes Selector Bar */}
      <EventModeSelector
        activeMode={activeMode}
        onModeChange={handleModeChange}
      />

      {/* Event Navigation Tabs */}
      <div className="event-hub__tabs" role="tablist" aria-label="Event views">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "gallery"}
          onClick={() => setActiveTab("gallery")}
          className={`event-hub__tab ${
            activeTab === "gallery" ? "event-hub__tab--active" : ""
          }`}
        >
          <Images size={16} aria-hidden="true" />
          <span>{t("hub.tabGallery")}</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-primary/10 text-primary font-semibold">
            {mediaItems.length}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "analytics"}
          onClick={() => setActiveTab("analytics")}
          className={`event-hub__tab ${
            activeTab === "analytics" ? "event-hub__tab--active" : ""
          }`}
        >
          <ChartBar size={16} aria-hidden="true" />
          <span>{t("hub.tabAnalytics")}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "timeline"}
          onClick={() => setActiveTab("timeline")}
          className={`event-hub__tab ${
            activeTab === "timeline" ? "event-hub__tab--active" : ""
          }`}
        >
          <ClockAfternoon size={16} aria-hidden="true" />
          <span>{t("hub.tabTimeline")}</span>
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

      {/* TAB CONTENT 1: GALLERY & MEDIA */}
      {activeTab === "gallery" && (
        <EventGalleryView
          items={mediaItems}
          onOpenLightbox={(item) => setLightboxItem(item)}
          onToggleStatus={handleToggleMediaStatus}
          onDeleteMedia={handleDeleteMedia}
        />
      )}

      {/* TAB CONTENT 2: PARTICIPATION & QR ANALYTICS */}
      {activeTab === "analytics" && <EventAnalyticsView event={currentEvent} />}

      {/* TAB CONTENT 3: TIMELINE & PHASES */}
      {activeTab === "timeline" && (
        <div className="mt-8 space-y-6">
          <div
            role="tablist"
            className="p-1.5 bg-surface border border-line rounded-xl inline-flex flex-wrap gap-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activePhase === "before"}
              onClick={() => setActivePhase("before")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activePhase === "before"
                  ? "bg-primary text-primary-foreground shadow-subtle"
                  : "text-muted-foreground hover:text-ink"
              }`}
            >
              {t("overview.lifecycleBefore")}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activePhase === "during"}
              onClick={() => setActivePhase("during")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activePhase === "during"
                  ? "bg-primary text-primary-foreground shadow-subtle"
                  : "text-muted-foreground hover:text-ink"
              }`}
            >
              {t("overview.lifecycleDuring")}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activePhase === "after"}
              onClick={() => setActivePhase("after")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activePhase === "after"
                  ? "bg-primary text-primary-foreground shadow-subtle"
                  : "text-muted-foreground hover:text-ink"
              }`}
            >
              {t("overview.lifecycleAfter")}
            </button>
          </div>
          <p className="text-xs text-subtle ml-1">
            {t("overview.lifecycleNote")}
          </p>

          {/* Phase: Before */}
          {activePhase === "before" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Card className="bg-surface border-line shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between text-muted-foreground mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        {t("create.dateLabel")}
                      </span>
                      <CalendarCheck size={20} className="text-primary" />
                    </div>
                    <div className="text-2xl font-heading text-ink">
                      {daysRemaining !== null
                        ? t("overview.daysUntil", { count: daysRemaining })
                        : t("ready.noDate")}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formattedDate}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-surface border-line shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between text-muted-foreground mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        {t("guestCount.heading")}
                      </span>
                      <Users size={20} className="text-primary" />
                    </div>
                    <div className="text-2xl font-heading text-ink">
                      {currentEvent.expected_guest_count
                        ? `${currentEvent.expected_guest_count}`
                        : "100"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("guestCount.description")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-surface border-line shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between text-muted-foreground mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        {t("checklist.title")}
                      </span>
                      <Sparkle size={20} className="text-primary" />
                    </div>
                    <div className="text-2xl font-heading text-primary">
                      {t("checklist.completed")}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("overview.eventReadyBanner")}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="p-6 bg-surface border border-line rounded-2xl shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <QrCode size={26} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg text-ink">
                      {t("ready.qrCta")}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t("ready.noAppNeeded")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <Link
                    href={`/events/${encodeURIComponent(currentEvent.id)}/ready`}
                    className="button button--secondary text-xs h-9 px-3.5 w-full sm:w-auto inline-flex items-center justify-center gap-1.5"
                  >
                    <DownloadSimple size={16} />
                    <span>{t("ready.downloadQr")}</span>
                  </Link>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCopyLink}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5"
                  >
                    <ShareNetwork size={16} />
                    <span>{t("ready.copyLink")}</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Phase: During */}
          {activePhase === "during" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-surface border-line">
                  <CardContent className="p-5">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">
                      {t("overview.statMemories")}
                    </span>
                    <div className="text-3xl font-heading text-ink mt-1">
                      {mockMemories}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-surface border-line">
                  <CardContent className="p-5">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">
                      {t("overview.statContributors")}
                    </span>
                    <div className="text-3xl font-heading text-ink mt-1">
                      {mockContributors}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-surface border-line">
                  <CardContent className="p-5">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">
                      {t("overview.statParticipation")}
                    </span>
                    <div className="text-3xl font-heading text-primary mt-1">
                      {mockRate}%
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-surface border-line">
                  <CardContent className="p-5">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">
                      {t("overview.statScans")}
                    </span>
                    <div className="text-3xl font-heading text-ink mt-1">
                      {mockScans}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Phase: After */}
          {activePhase === "after" && (
            <div className="space-y-6">
              <div className="p-6 sm:p-8 bg-surface border border-line rounded-2xl shadow-raised">
                <div className="max-w-xl">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    {t("overview.lifecycleAfter")}
                  </span>
                  <h3 className="font-heading text-2xl text-ink mt-1">
                    {t("overview.afterPromptHeading")}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t("overview.afterPromptSub")}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button
                      type="button"
                      onClick={handleCopyReminder}
                      className="inline-flex items-center gap-2"
                    >
                      <Copy size={16} />
                      <span>{t("overview.copyReminderLink")}</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCopyLink}
                    >
                      <span>{t("ready.copyLink")}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: SETTINGS */}
      {activeTab === "settings" && (
        <div className="mt-8 max-w-xl bg-surface border border-line rounded-2xl p-6 sm:p-8 shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <div>
              <h3 className="font-heading text-xl text-ink font-medium">
                {t("settings.title")}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("settings.sub")}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              className="text-xs h-9"
            >
              <Gear size={15} className="mr-1.5" />
              <span>{t("hub.editEventBtn")}</span>
            </Button>
          </div>

          <div className="mt-6 space-y-4 text-xs">
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
                {currentEvent.expected_guest_count || 100} guests
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">
                {t("settings.galleryVisibilityLabel")}
              </span>
              <span className="font-semibold text-primary">
                {currentEvent.gallery_enabled !== false
                  ? "Enabled"
                  : "Upload-only"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      <EventMediaLightbox
        item={lightboxItem}
        isOpen={Boolean(lightboxItem)}
        onClose={() => setLightboxItem(null)}
        onPrev={handlePrevLightbox}
        onNext={handleNextLightbox}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onToggleStatus={handleToggleMediaStatus}
      />

      {/* Fullscreen Live Wall */}
      <EventLiveWallModal
        event={currentEvent}
        isOpen={isLiveWallOpen}
        onClose={() => setIsLiveWallOpen(false)}
      />

      {/* Quick QR Code Dialog */}
      <EventQrDialog
        event={currentEvent}
        isOpen={isQrDialogOpen}
        onClose={() => setIsQrDialogOpen(false)}
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
