"use client";

import { useState } from "react";
import {
  Check,
  Eye,
  PaintBrush,
  PencilSimple,
  SlidersHorizontal,
  Sparkle,
  Users,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import type { CandidEvent } from "../types/event";
import { useUpdateEvent } from "../hooks";
import { formatDate } from "@/i18n/format";
import type { AppLocale } from "@/i18n/locales";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
  Button,
  Input,
  Label,
} from "@/components/ui";

type EventSetupChecklistProps = {
  event: CandidEvent;
  onOpenPrintModal?: () => void;
  onPreviewClick?: () => void;
  onOpenCustomizeQr?: () => void;
  onOpenCustomizePage?: () => void;
  onOpenEditPage?: () => void;
};

const GUEST_PRESETS = [50, 100, 150, 200, 300];

export function EventSetupChecklist({
  event,
  onOpenPrintModal,
  onPreviewClick,
  onOpenCustomizeQr,
  onOpenCustomizePage,
  onOpenEditPage,
}: EventSetupChecklistProps) {
  const t = useTranslations("event");
  const tCommon = useTranslations("common");
  const locale = useLocale() as AppLocale;
  const { mutateAsync: updateEvent, isPending: isUpdating } = useUpdateEvent();
  const handleOpenCustomize = onOpenCustomizeQr || onOpenPrintModal;
  const handleOpenCustomizePage = onOpenCustomizePage || onOpenEditPage;

  const [guestCount, setGuestCount] = useState<string>(
    event.expected_guest_count ? String(event.expected_guest_count) : "",
  );

  const checklist = event.setup_checklist || {
    eventCreated: true,
    qrReady: true,
    testedGuestExperience: false,
    addedGuestCount: Boolean(event.expected_guest_count),
    customizedQr: false,
    customizedPage: false,
  };

  // Determine initial open accordion item: first incomplete actionable step
  const initialAccordion = !checklist.customizedQr
    ? ["customize-qr"]
    : !checklist.customizedPage
      ? ["customize-page"]
      : !event.expected_guest_count && !checklist.addedGuestCount
        ? ["guest-count"]
        : !checklist.testedGuestExperience
          ? ["preview-experience"]
          : [];

  const [activeAccordion, setActiveAccordion] =
    useState<string[]>(initialAccordion);

  // Calculate completion percentage
  const completedSteps = [
    true, // eventCreated
    true, // qrReady
    Boolean(checklist.customizedQr),
    Boolean(checklist.customizedPage),
    Boolean(checklist.addedGuestCount || event.expected_guest_count),
    Boolean(checklist.testedGuestExperience),
  ];
  const completedCount = completedSteps.filter(Boolean).length;
  const progressPercent = Math.round(
    (completedCount / completedSteps.length) * 100,
  );

  const handleSaveGuestCount = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const countNum = parseInt(guestCount.trim(), 10);

    if (Number.isNaN(countNum) || countNum < 1) {
      toast.error(t("guestCount.heading"));

      return;
    }

    try {
      await updateEvent({
        id: event.id,
        expected_guest_count: countNum,
        setup_checklist: {
          addedGuestCount: true,
        },
      });

      toast.success(t("guestCount.savedToast"));
      setActiveAccordion([]);
    } catch {
      toast.error(t("guestCount.heading"));
    }
  };

  const handleSkipGuestCount = () => {
    setActiveAccordion([]);
  };

  const handlePreview = () => {
    onPreviewClick?.();

    void updateEvent({
      id: event.id,
      setup_checklist: {
        testedGuestExperience: true,
      },
    });

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const publicPath = event.public_url || `/e/${event.slug}`;
    const testUrl = `${event.guest_url || `${origin}${publicPath}`}?is_test=true`;

    window.open(testUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      className="event-checklist space-y-5"
      aria-labelledby="checklist-title"
    >
      {/* Checklist Card */}
      <div className="event-checklist__card bg-surface border border-line rounded-2xl p-5 sm:p-6 shadow-card">
        {/* Header & Progress Meter */}
        <div className="event-checklist__header pb-4 border-b border-line/60">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2
                id="checklist-title"
                className="text-base sm:text-lg font-heading font-semibold text-ink"
              >
                {t("checklist.title")}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {t("checklist.subtitle")}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                progressPercent === 100
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {progressPercent}%
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full bg-line rounded-full h-1.5 mt-3.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                progressPercent === 100 ? "bg-emerald-500" : "bg-primary"
              }`}
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {/* Completed Prerequisites Strip */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-3 pt-2">
            <span className="inline-flex items-center gap-1.5 font-medium text-ink">
              <Check
                size={13}
                className="text-primary"
                weight="bold"
                aria-hidden="true"
              />
              <span>{t("checklist.itemCreated")}</span>
            </span>
            <span className="text-line" aria-hidden="true">
              ·
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-ink">
              <Check
                size={13}
                className="text-primary"
                weight="bold"
                aria-hidden="true"
              />
              <span>{t("checklist.itemQrReady")}</span>
            </span>
          </div>
        </div>

        {/* Refined Accordion for Setup Steps (Single open: opening one closes others) */}
        <div className="event-checklist__accordion mt-4">
          <Accordion
            value={activeAccordion}
            onValueChange={(val) => setActiveAccordion(val)}
            className="space-y-2.5"
          >
            {/* Step 1: Customize QR card */}
            <AccordionItem value="customize-qr">
              <AccordionTrigger
                badge={
                  checklist.customizedQr ? (
                    <span className="text-xs font-semibold text-primary">
                      {t("checklist.completed")}
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {t("qrCustomize.requiredBadge")}
                    </span>
                  )
                }
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    checklist.customizedQr
                      ? "bg-primary/15 text-primary"
                      : "bg-primary/10 text-primary border border-primary/20"
                  }`}
                >
                  {checklist.customizedQr ? (
                    <Check size={14} weight="bold" aria-hidden="true" />
                  ) : (
                    <PaintBrush size={14} weight="bold" aria-hidden="true" />
                  )}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-ink truncate">
                  {t("checklist.itemCustomizeQr")}
                </span>
              </AccordionTrigger>

              <AccordionPanel>
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("qrCustomize.subtitle")}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-line/40">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Sparkle
                        size={13}
                        className="text-primary shrink-0"
                        weight="fill"
                      />
                      <span>{t("qrCustomize.vectorBadge")}</span>
                    </div>

                    {handleOpenCustomize && (
                      <Button
                        type="button"
                        variant={checklist.customizedQr ? "outline" : "default"}
                        size="sm"
                        onClick={handleOpenCustomize}
                        className="h-8 px-3.5 text-xs font-medium inline-flex items-center gap-1.5 rounded-lg shadow-xs transition-all"
                      >
                        {checklist.customizedQr ? (
                          <>
                            <PencilSimple size={13} aria-hidden="true" />
                            <span>{tCommon("actions.edit")}</span>
                          </>
                        ) : (
                          <>
                            <PaintBrush
                              size={13}
                              weight="bold"
                              aria-hidden="true"
                            />
                            <span>{t("checklist.itemCustomizeQr")}</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>

            {/* Step 2: Customize guest page */}
            <AccordionItem value="customize-page">
              <AccordionTrigger
                badge={
                  checklist.customizedPage ? (
                    <span className="text-xs font-semibold text-primary">
                      {t("checklist.completed")}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {t("checklist.optional")}
                    </span>
                  )
                }
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    checklist.customizedPage
                      ? "bg-primary/15 text-primary"
                      : "bg-surface border border-line text-muted-foreground"
                  }`}
                >
                  {checklist.customizedPage ? (
                    <Check size={14} weight="bold" aria-hidden="true" />
                  ) : (
                    <SlidersHorizontal size={14} aria-hidden="true" />
                  )}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-ink truncate">
                  {t("checklist.itemCustomizePage")}
                </span>
              </AccordionTrigger>

              <AccordionPanel>
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("settings.sub")}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-line/40">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-soft border border-line/60 font-medium text-ink">
                        {t(`types.${event.event_type}`)}
                      </span>
                      {event.event_date && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-soft border border-line/60">
                          {formatDate(event.event_date, locale, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>

                    {handleOpenCustomizePage && (
                      <Button
                        type="button"
                        variant={
                          checklist.customizedPage ? "outline" : "default"
                        }
                        size="sm"
                        onClick={handleOpenCustomizePage}
                        className="h-8 px-3.5 text-xs font-medium inline-flex items-center gap-1.5 rounded-lg shadow-xs transition-all"
                      >
                        <PencilSimple size={13} aria-hidden="true" />
                        <span>
                          {checklist.customizedPage
                            ? tCommon("actions.edit")
                            : t("checklist.itemCustomizePage")}
                        </span>
                      </Button>
                    )}
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>

            {/* Step 3: Expected Guest Count */}
            <AccordionItem value="guest-count">
              <AccordionTrigger
                badge={
                  event.expected_guest_count ? (
                    <span className="text-xs font-semibold text-primary">
                      {event.expected_guest_count} {t("guestCount.countLabel")}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {t("checklist.optional")}
                    </span>
                  )
                }
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    checklist.addedGuestCount || event.expected_guest_count
                      ? "bg-primary/15 text-primary"
                      : "bg-surface border border-line text-muted-foreground"
                  }`}
                >
                  {checklist.addedGuestCount || event.expected_guest_count ? (
                    <Check size={14} weight="bold" aria-hidden="true" />
                  ) : (
                    <Users size={14} aria-hidden="true" />
                  )}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-ink truncate">
                  {t("checklist.itemGuestCount")}
                </span>
              </AccordionTrigger>

              <AccordionPanel>
                <form onSubmit={handleSaveGuestCount} className="space-y-3">
                  <div>
                    <Label
                      htmlFor="expected-guests-input"
                      className="text-xs font-semibold text-ink uppercase tracking-wider block"
                    >
                      {t("guestCount.heading")}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("guestCount.description")}
                    </p>
                  </div>

                  {/* Preset chips */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {GUEST_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setGuestCount(String(preset))}
                        className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                          guestCount === String(preset)
                            ? "bg-primary text-on-primary border-primary font-medium shadow-xs"
                            : "bg-surface border-line text-muted-foreground hover:text-ink hover:border-line-hover"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      id="expected-guests-input"
                      type="number"
                      size="sm"
                      min={1}
                      max={50000}
                      placeholder={t("guestCount.placeholder")}
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      className="w-28 h-8 text-xs bg-surface"
                    />

                    <Button
                      type="submit"
                      size="sm"
                      disabled={isUpdating}
                      className="h-8 text-xs px-3"
                    >
                      <span>{t("guestCount.save")}</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleSkipGuestCount}
                      className="h-8 text-xs px-2.5 text-muted-foreground hover:text-ink"
                    >
                      <span>{t("guestCount.skip")}</span>
                    </Button>
                  </div>
                </form>
              </AccordionPanel>
            </AccordionItem>

            {/* Step 3: Test Guest Experience */}
            <AccordionItem value="preview-experience">
              <AccordionTrigger
                badge={
                  checklist.testedGuestExperience ? (
                    <span className="text-xs font-semibold text-primary">
                      {t("checklist.completed")}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {t("checklist.optional")}
                    </span>
                  )
                }
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    checklist.testedGuestExperience
                      ? "bg-primary/15 text-primary"
                      : "bg-surface border border-line text-muted-foreground"
                  }`}
                >
                  {checklist.testedGuestExperience ? (
                    <Check size={14} weight="bold" aria-hidden="true" />
                  ) : (
                    <Eye size={14} aria-hidden="true" />
                  )}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-ink truncate">
                  {t("checklist.itemPreview")}
                </span>
              </AccordionTrigger>

              <AccordionPanel>
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("guest.testSessionBanner")}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePreview}
                    className="text-xs h-8 px-3 flex items-center gap-1.5 rounded-lg"
                  >
                    <Eye size={14} aria-hidden="true" />
                    <span>{t("checklist.itemPreview")}</span>
                  </Button>
                </div>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Host Guidance & Participation Card */}
      <div className="event-checklist__tips p-4 sm:p-5 rounded-2xl bg-surface border border-line shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <Sparkle
            size={16}
            className="text-primary"
            weight="fill"
            aria-hidden="true"
          />
          <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">
            {t("overview.collectMore")}
          </h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("ready.heroSubtitle")} {t("ready.noAppNeeded")}.
        </p>
      </div>
    </section>
  );
}
