"use client";

import { useId, useState } from "react";
import Image from "next/image";
import {
  Camera,
  CheckCircle,
  Eye,
  Images,
  Sparkle,
  Trash,
  UploadSimple,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import type { CandidEvent } from "../types/event";
import { formatDate } from "@/i18n/format";
import type { AppLocale } from "@/i18n/locales";
import { Alert, AlertDescription, Button, Spinner } from "@/components/ui";

type GuestEventViewProps = {
  event: CandidEvent;
  isTest?: boolean;
};

type UploadedItem = {
  id: string;
  url: string;
  name: string;
  isTest: boolean;
};

export function GuestEventView({ event, isTest = false }: GuestEventViewProps) {
  const t = useTranslations("event");
  const locale = useLocale() as AppLocale;
  const fileInputId = useId();

  const [uploads, setUploads] = useState<UploadedItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const formattedDate = event.event_date
    ? formatDate(event.event_date, locale, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : t("ready.noDate");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    setUploading(true);
    setSuccess(false);

    // Simulate upload
    setTimeout(() => {
      const newItems: UploadedItem[] = Array.from(files).map((file, idx) => ({
        id: `upload_${Date.now()}_${idx}`,
        url: URL.createObjectURL(file),
        name: file.name,
        isTest,
      }));

      setUploads((prev) => [...newItems, ...prev]);
      setUploading(false);
      setSuccess(true);
      toast.success(t("guest.uploadSuccess"));
    }, 1200);
  };

  const handleRemoveTestUploads = () => {
    setUploads([]);
    setSuccess(false);
    toast.success(t("guest.testRemovedToast"));
  };

  return (
    <div className="guest-event-page min-h-screen bg-background text-foreground flex flex-col items-center">
      {/* Test session banner if in test/preview mode */}
      {isTest && (
        <aside
          aria-label={t("guest.testSessionBanner")}
          className="w-full bg-sage/50 border-b border-line px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-ink"
        >
          <div className="flex items-center gap-2">
            <Eye
              size={16}
              className="text-primary shrink-0"
              aria-hidden="true"
            />
            <span className="font-medium">{t("guest.testSessionBanner")}</span>
          </div>

          {uploads.length > 0 && (
            <button
              type="button"
              onClick={handleRemoveTestUploads}
              className="text-xs text-crimson hover:underline inline-flex items-center gap-1 font-medium shrink-0"
            >
              <Trash size={13} aria-hidden="true" />
              <span>{t("guest.removeTestUploads")}</span>
            </button>
          )}
        </aside>
      )}

      <main className="w-full max-w-md px-5 py-8 sm:py-12 flex flex-col items-center text-center">
        {/* Event Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface border border-line text-muted-foreground mb-3">
            <Sparkle size={12} weight="fill" className="text-primary" />
            <span>{t(`types.${event.event_type}`)}</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl text-ink leading-tight">
            {event.name}
          </h1>

          <p className="text-sm text-muted-foreground mt-2">{formattedDate}</p>

          <p className="text-xs text-subtle mt-3">{t("guest.trustLine")}</p>
        </div>

        {/* Upload Action Area */}
        <div className="w-full bg-surface border border-line rounded-2xl p-6 sm:p-8 shadow-card flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Camera size={32} aria-hidden="true" />
          </div>

          <h2 className="font-heading text-xl text-ink">
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

        {/* Uploaded Photos Grid in Test/Guest view */}
        {uploads.length > 0 && (
          <div className="w-full mt-8 text-left">
            <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-1.5">
              <Images size={16} className="text-primary" />
              <span>
                {t("overview.recentUploads")} ({uploads.length})
              </span>
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {uploads.map((item) => (
                <div
                  key={item.id}
                  className="aspect-square relative rounded-lg overflow-hidden border border-line bg-muted/20"
                >
                  <Image
                    src={item.url}
                    alt={item.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
