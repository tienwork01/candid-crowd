"use client";

import { useId, useState } from "react";
import Image from "next/image";
import {
  Camera,
  CheckCircle,
  Eye,
  Heart,
  Images,
  Moon,
  Sparkle,
  SunHorizon,
  Trash,
  UploadSimple,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import type { CandidEvent, EventMediaItem } from "../types/event";
import { addStoredMediaItem } from "../lib/event-store";
import { formatDate } from "@/i18n/format";
import type { AppLocale } from "@/i18n/locales";
import { Alert, AlertDescription, Button, Spinner } from "@/components/ui";

type GuestEventViewProps = {
  event: CandidEvent;
  isTest?: boolean;
};

export function GuestEventView({ event, isTest = false }: GuestEventViewProps) {
  const t = useTranslations("event");
  const locale = useLocale() as AppLocale;
  const fileInputId = useId();

  const [activeTab, setActiveTab] = useState<"upload" | "gallery">("upload");
  const [galleryMedia, setGalleryMedia] = useState<EventMediaItem[]>(
    event.media_items?.filter((m) => m.status !== "hidden") || [],
  );
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [guestLikes, setGuestLikes] = useState<Record<string, boolean>>({});

  const formattedDate = event.event_date
    ? formatDate(event.event_date, locale, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : t("ready.noDate");

  const mode = event.event_mode || "social";
  const galleryAllowed = event.gallery_enabled !== false;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    setUploading(true);
    setSuccess(false);

    setTimeout(() => {
      const newMediaItems: EventMediaItem[] = Array.from(files).map(
        (file, idx) => ({
          id: `guest_up_${Date.now()}_${idx}`,
          url: URL.createObjectURL(file),
          caption: file.name.replace(/\.[^/.]+$/, ""),
          guest_name: "You",
          created_at: new Date().toISOString(),
          status: "ready",
          is_video: file.type.startsWith("video/"),
          likes_count: 0,
        }),
      );

      for (const item of newMediaItems) {
        addStoredMediaItem(event.id, item);
      }

      setGalleryMedia((prev) => [...newMediaItems, ...prev]);
      setUploading(false);
      setSuccess(true);
      toast.success(t("guest.uploadSuccess"));
    }, 1200);
  };

  const toggleLike = (id: string) => {
    setGuestLikes((prev) => ({ ...prev, [id]: !prev[id] }));
    setGalleryMedia((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const isLiked = guestLikes[id];

          return {
            ...item,
            likes_count: (item.likes_count || 0) + (isLiked ? -1 : 1),
          };
        }

        return item;
      }),
    );
  };

  return (
    <div className="guest-event-page min-h-screen bg-background text-foreground flex flex-col items-center pb-16">
      {/* Test session banner if in test/preview mode */}
      {isTest && (
        <aside
          aria-label={t("guest.testSessionBanner")}
          className="guest-event-card__test-banner w-full bg-sage/50 border-b border-line px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-ink"
        >
          <div className="flex items-center gap-2">
            <Eye
              size={16}
              className="text-primary shrink-0"
              aria-hidden="true"
            />
            <span className="font-medium">{t("guest.testSessionBanner")}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setGalleryMedia(
                event.media_items?.filter((m) => m.status !== "hidden") || [],
              );
              setSuccess(false);
              toast.success(t("guest.testRemovedToast"));
            }}
            className="text-xs text-crimson hover:underline inline-flex items-center gap-1 font-medium shrink-0"
          >
            <Trash size={13} aria-hidden="true" />
            <span>{t("guest.removeTestUploads")}</span>
          </button>
        </aside>
      )}

      {/* Mode-Aware Context Notice */}
      {mode === "silent" && (
        <div className="w-full bg-surface border-b border-line py-2.5 px-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Moon size={15} className="text-primary" />
          <span>
            Ceremony in progress. Enjoy the moment with us. Feel free to
            contribute afterwards.
          </span>
        </div>
      )}

      {mode === "after" && (
        <div className="w-full bg-primary/10 border-b border-primary/20 py-2.5 px-4 text-center text-xs text-primary font-medium flex items-center justify-center gap-2">
          <SunHorizon size={16} />
          <span>
            {t("overview.afterPromptHeading")} Share the memories still on your
            camera roll!
          </span>
        </div>
      )}

      <main className="w-full max-w-lg px-4 sm:px-6 py-8 flex flex-col items-center text-center">
        {/* Event Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface border border-line text-muted-foreground mb-3">
            <Sparkle size={12} weight="fill" className="text-primary" />
            <span>{t(`types.${event.event_type}`)}</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl text-ink leading-tight">
            {event.name}
          </h1>

          <p className="text-xs text-muted-foreground mt-1.5">
            {formattedDate}
          </p>
          <p className="text-xs text-subtle mt-2">{t("guest.trustLine")}</p>
        </div>

        {/* Guest View Tab Switcher (Upload vs Gallery) */}
        {galleryAllowed && (
          <div className="flex items-center gap-1 p-1 bg-soft border border-line rounded-xl mb-6 w-full max-w-xs">
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "upload"
                  ? "bg-surface text-ink shadow-subtle"
                  : "text-muted-foreground hover:text-ink"
              }`}
            >
              <UploadSimple size={14} className="inline mr-1.5" />
              <span>Share Photos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("gallery")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "gallery"
                  ? "bg-surface text-ink shadow-subtle"
                  : "text-muted-foreground hover:text-ink"
              }`}
            >
              <Images size={14} className="inline mr-1.5" />
              <span>Gallery ({galleryMedia.length})</span>
            </button>
          </div>
        )}

        {/* Tab 1: Upload Action Area */}
        {activeTab === "upload" && (
          <div className="w-full bg-surface border border-line rounded-2xl p-6 sm:p-8 shadow-card flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Camera size={32} aria-hidden="true" />
            </div>

            <h2 className="font-heading text-xl text-ink font-medium">
              {t("guest.welcomeCta")}
            </h2>

            <p className="text-xs text-muted-foreground mt-1.5 mb-6 max-w-xs">
              {t("guest.dropzoneSub")}
            </p>

            <input
              id={fileInputId}
              type="file"
              multiple
              accept="image/*,video/*"
              className="sr-only"
              onChange={handleFileChange}
              disabled={uploading}
            />

            <Button
              type="button"
              disabled={uploading}
              onClick={() => document.getElementById(fileInputId)?.click()}
              className="button button--primary w-full h-12 text-base font-semibold shadow-subtle flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Spinner size="sm" />
                  <span>{t("guest.uploading")}</span>
                </>
              ) : (
                <>
                  <UploadSimple size={18} weight="bold" aria-hidden="true" />
                  <span>{t("guest.selectFiles")}</span>
                </>
              )}
            </Button>

            {success && (
              <Alert className="mt-4 bg-primary/10 border-primary/20 text-ink">
                <CheckCircle size={18} className="text-primary shrink-0" />
                <AlertDescription className="text-xs font-medium">
                  {t("guest.uploadSuccess")}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Tab 2: Shared Gallery */}
        {activeTab === "gallery" && galleryAllowed && (
          <div className="w-full text-left">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-ink flex items-center gap-1.5">
                <Images size={16} className="text-primary" />
                <span>Shared Gallery ({galleryMedia.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
              >
                <UploadSimple size={13} />
                <span>Add more</span>
              </button>
            </div>

            {galleryMedia.length === 0 ? (
              <div className="p-8 text-center bg-surface border border-line rounded-xl">
                <p className="text-xs text-muted-foreground">
                  No memories shared yet. Be the first to share one!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {galleryMedia.map((item) => (
                  <div
                    key={item.id}
                    className="group relative aspect-square bg-muted/20 rounded-xl overflow-hidden border border-line shadow-subtle"
                  >
                    <Image
                      src={item.url}
                      alt={item.caption || "Event memory"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />

                    {/* Like button overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2 text-white">
                      <span className="text-[10px] truncate max-w-[80px]">
                        {item.guest_name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(item.id);
                        }}
                        className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Heart
                          size={14}
                          weight={guestLikes[item.id] ? "fill" : "regular"}
                          className={
                            guestLikes[item.id] ? "text-rose-400" : "text-white"
                          }
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
