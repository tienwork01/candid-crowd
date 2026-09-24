"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, PencilSimple, Plus, Sparkle } from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { useEvent, useMounted, useUpdateEvent } from "../hooks";
import "./event.css";
import { EventReadyCard } from "./event-ready-card";
import { EventSetupChecklist } from "./event-setup-checklist";
import { EventPrintModal } from "./print";
import { QRCustomizeModal } from "./qr-customize";
import { GuestThemeCustomizeModal } from "./guest-theme";
import { EventEditDialog } from "./event-edit-dialog";
import { formatDate } from "@/i18n/format";
import type { AppLocale } from "@/i18n/locales";
import { Spinner } from "@/components/ui";

type ReadyPageClientProps = {
  eventId: string;
};

export function ReadyPageClient({ eventId }: ReadyPageClientProps) {
  const t = useTranslations("event");
  const tCommon = useTranslations("common.errors");
  const locale = useLocale() as AppLocale;
  const mounted = useMounted();

  const { data: event, isLoading } = useEvent(eventId);
  const { mutateAsync: updateEvent } = useUpdateEvent();

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isCustomizeQrOpen, setIsCustomizeQrOpen] = useState(false);
  const [isCustomizeGuestPageOpen, setIsCustomizeGuestPageOpen] =
    useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [qrConfigVersion, setQrConfigVersion] = useState(0);

  // Compute guest URL for QR pre-generation
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicPath =
    event?.public_url || (event?.slug ? `/e/${event.slug}` : "");
  const fullGuestUrl = event?.guest_url || `${origin}${publicPath}`;

  useEffect(() => {
    if (!fullGuestUrl) return;

    let active = true;

    void import("qrcode")
      .then((qr) =>
        qr.toDataURL(fullGuestUrl, {
          width: 512,
          margin: 1.5,
          color: {
            dark: "#181e17",
            light: "#ffffff",
          },
          errorCorrectionLevel: "H",
        }),
      )
      .then((dataUrl) => {
        if (active) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        // Fallback handled gracefully in card
      });

    return () => {
      active = false;
    };
  }, [fullGuestUrl]);

  const handlePreviewOpened = () => {
    if (event && !event.setup_checklist?.testedGuestExperience) {
      void updateEvent({
        id: event.id,
        setup_checklist: {
          testedGuestExperience: true,
        },
      });
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
        <Spinner size="lg" className="text-primary mb-3" />
        <p className="text-sm text-muted-foreground">{t("create.creating")}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h2 className="text-2xl font-heading text-ink mb-2">
          {tCommon("EVENT_NOT_FOUND")}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {t("create.pageSubtitle")}
        </p>
        <Link
          href="/events/new"
          className="button inline-flex items-center gap-2"
        >
          <Plus size={16} />
          <span>{t("create.cta")}</span>
        </Link>
      </div>
    );
  }

  const formattedDate = event.event_date
    ? formatDate(event.event_date, locale, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : t("ready.noDate");

  return (
    <div className="event-ready-page max-w-6xl mx-auto px-4 sm:px-6">
      {/* Unified Compact Header */}
      <div className="event-ready-page__header pb-3 mb-6 sm:mb-8 border-b border-line">
        {/* Breadcrumb Hierarchy & Status Tag */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-1.5">
          <Link
            href="/events"
            className="inline-flex items-center gap-1 hover:text-ink transition-colors font-medium"
          >
            <ArrowLeft size={13} aria-hidden="true" />
            <span>{t("overview.breadcrumb")}</span>
          </Link>
          <span className="text-line-hover" aria-hidden="true">
            /
          </span>
          <Link
            href={`/events/${encodeURIComponent(event.id)}`}
            className="font-medium text-muted-foreground hover:text-ink hover:underline underline-offset-4 transition-colors truncate max-w-[200px] sm:max-w-xs"
            title={t("ready.goToOverview")}
          >
            {event.name}
          </Link>
          <span className="text-line-hover" aria-hidden="true">
            /
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full text-[11px]">
            <Sparkle size={11} weight="fill" aria-hidden="true" />
            <span>{t("ready.heroBadge")}</span>
          </span>
        </div>

        {/* Heading & Meta Subtitle */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-lg sm:text-xl lg:text-2xl text-ink font-semibold tracking-tight">
              {t("ready.heroTitle")}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t(`types.${event.event_type}`)}
              {event.event_date ? ` · ${formattedDate}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditEventOpen(true)}
            className="text-xs text-muted-foreground hover:text-ink flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line hover:border-line-hover transition-colors bg-surface shrink-0"
            title="Edit event name and date"
          >
            <PencilSimple size={13} />
            <span className="hidden sm:inline">Edit Details</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Bento Grid */}
      <div className="event-ready-page__grid grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: QR Code & Guest Launchpad Card (Purely focuses on QR & Logo preview) */}
        <div className="lg:col-span-5 w-full">
          <EventReadyCard
            event={event}
            qrDataUrl={qrDataUrl}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
            configVersion={qrConfigVersion}
          />
        </div>

        {/* Right Column: Setup Checklist & Next Steps Card (With Prominent Customize QR CTA) */}
        <div className="lg:col-span-7 w-full">
          <EventSetupChecklist
            event={event}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
            onOpenCustomizeQr={() => setIsCustomizeQrOpen(true)}
            onOpenCustomizePage={() => setIsCustomizeGuestPageOpen(true)}
            onOpenEditPage={() => setIsEditEventOpen(true)}
            onPreviewClick={handlePreviewOpened}
          />
        </div>
      </div>

      {/* Printable Signage Modal */}
      <EventPrintModal
        event={event}
        qrDataUrl={qrDataUrl}
        configVersion={qrConfigVersion}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />

      {/* QR Card Customizer Modal */}
      <QRCustomizeModal
        event={event}
        guestUrl={fullGuestUrl}
        formattedDate={event.event_date ? formattedDate : null}
        isOpen={isCustomizeQrOpen}
        onClose={() => setIsCustomizeQrOpen(false)}
        onApplied={() => {
          setQrConfigVersion((v) => v + 1);

          if (event && !event.setup_checklist?.customizedQr) {
            void updateEvent({
              id: event.id,
              setup_checklist: {
                customizedQr: true,
              },
            });
          }
        }}
      />

      {/* Guest Page Theme Customizer Modal */}
      <GuestThemeCustomizeModal
        event={event}
        isOpen={isCustomizeGuestPageOpen}
        onClose={() => setIsCustomizeGuestPageOpen(false)}
        onApplied={(themeConfig) => {
          if (event) {
            void updateEvent({
              id: event.id,
              guest_theme: themeConfig,
              setup_checklist: {
                customizedPage: true,
              },
            });
          }
        }}
      />

      {/* Edit Event Details Dialog */}
      <EventEditDialog
        event={event}
        isOpen={isEditEventOpen}
        onClose={() => setIsEditEventOpen(false)}
        onSave={async (updated) => {
          try {
            await updateEvent({
              id: event.id,
              ...updated,
              setup_checklist: {
                customizedPage: true,
                ...(updated.expected_guest_count
                  ? { addedGuestCount: true }
                  : {}),
              },
            });
          } catch {
            // Handled gracefully
          }
        }}
      />
    </div>
  );
}
