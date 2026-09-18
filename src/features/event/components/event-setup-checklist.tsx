"use client";

import { useState } from "react";
import { Check, Eye, PaintBrush, Palette, Users } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { CandidEvent } from "../types/event";
import { useUpdateEvent } from "../hooks";
import { Button, Input, Label } from "@/components/ui";

type EventSetupChecklistProps = {
  event: CandidEvent;
  onPreviewClick?: () => void;
};

export function EventSetupChecklist({
  event,
  onPreviewClick,
}: EventSetupChecklistProps) {
  const t = useTranslations("event");
  const { mutateAsync: updateEvent, isPending: isUpdating } = useUpdateEvent();

  const [showGuestCountInput, setShowGuestCountInput] = useState(
    !event.expected_guest_count,
  );
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

      setShowGuestCountInput(false);
      toast.success(t("guestCount.savedToast"));
    } catch {
      toast.error(t("guestCount.heading"));
    }
  };

  const handleSkipGuestCount = () => {
    setShowGuestCountInput(false);
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
      className="event-checklist mt-12 pt-8 border-t border-line"
      aria-labelledby="checklist-title"
    >
      <div className="event-checklist__header mb-6">
        <h2
          id="checklist-title"
          className="text-xl sm:text-2xl font-heading text-ink"
        >
          {t("checklist.title")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("checklist.subtitle")}
        </p>
      </div>

      <div className="event-checklist__items space-y-3.5 max-w-xl">
        {/* Item 1: Event created */}
        <div className="event-checklist__item flex items-center justify-between p-3.5 bg-surface border border-line rounded-xl">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Check size={14} weight="bold" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-ink">
              {t("checklist.itemCreated")}
            </span>
          </div>
          <span className="text-xs font-semibold text-primary">
            {t("checklist.completed")}
          </span>
        </div>

        {/* Item 2: QR ready */}
        <div className="event-checklist__item flex items-center justify-between p-3.5 bg-surface border border-line rounded-xl">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Check size={14} weight="bold" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-ink">
              {t("checklist.itemQrReady")}
            </span>
          </div>
          <span className="text-xs font-semibold text-primary">
            {t("checklist.completed")}
          </span>
        </div>

        {/* Item 3: Test guest experience */}
        <div className="event-checklist__item flex items-center justify-between p-3.5 bg-surface border border-line rounded-xl">
          <div className="flex items-center gap-3">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                checklist.testedGuestExperience
                  ? "bg-primary/15 text-primary"
                  : "border border-line text-subtle"
              }`}
            >
              {checklist.testedGuestExperience ? (
                <Check size={14} weight="bold" aria-hidden="true" />
              ) : (
                <Eye size={13} aria-hidden="true" />
              )}
            </span>
            <span className="text-sm font-medium text-ink">
              {t("checklist.itemPreview")}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePreview}
            className="text-xs h-8 px-3"
          >
            {checklist.testedGuestExperience ? (
              <span>{t("checklist.completed")}</span>
            ) : (
              <span>{t("ready.previewAsGuest")}</span>
            )}
          </Button>
        </div>

        {/* Item 4: Expected guest count */}
        <div className="event-checklist__item p-3.5 bg-surface border border-line rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  checklist.addedGuestCount
                    ? "bg-primary/15 text-primary"
                    : "border border-line text-subtle"
                }`}
              >
                {checklist.addedGuestCount ? (
                  <Check size={14} weight="bold" aria-hidden="true" />
                ) : (
                  <Users size={13} aria-hidden="true" />
                )}
              </span>
              <div>
                <span className="text-sm font-medium text-ink block">
                  {t("checklist.itemGuestCount")}
                </span>
                {event.expected_guest_count ? (
                  <span className="text-xs text-muted-foreground">
                    {event.expected_guest_count}
                  </span>
                ) : null}
              </div>
            </div>

            {!checklist.addedGuestCount && !showGuestCountInput && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowGuestCountInput(true)}
                className="text-xs h-8 px-3"
              >
                <span>{t("checklist.optional")}</span>
              </Button>
            )}

            {checklist.addedGuestCount && !showGuestCountInput && (
              <button
                type="button"
                onClick={() => setShowGuestCountInput(true)}
                className="text-xs text-muted-foreground hover:text-ink underline"
              >
                {t("checklist.completed")}
              </button>
            )}
          </div>

          {/* Collapsible Guest Count Form */}
          {showGuestCountInput && (
            <form
              onSubmit={handleSaveGuestCount}
              className="mt-4 pt-3 border-t border-line/60"
            >
              <Label
                htmlFor="expected-guests-input"
                className="text-xs font-semibold text-ink uppercase tracking-wider block"
              >
                {t("guestCount.heading")}
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-2.5">
                {t("guestCount.description")}
              </p>

              <div className="flex items-center gap-2">
                <Input
                  id="expected-guests-input"
                  type="number"
                  min={1}
                  max={50000}
                  placeholder={t("guestCount.placeholder")}
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="h-9 w-32 text-sm bg-background"
                />

                <Button
                  type="submit"
                  size="sm"
                  disabled={isUpdating}
                  className="h-9 px-3 text-xs button"
                >
                  <span>{t("guestCount.save")}</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSkipGuestCount}
                  className="h-9 px-2.5 text-xs text-muted-foreground hover:text-ink"
                >
                  <span>{t("guestCount.skip")}</span>
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Item 5: Customize QR card */}
        <div className="event-checklist__item flex items-center justify-between p-3.5 bg-surface border border-line rounded-xl">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full border border-line text-subtle flex items-center justify-center shrink-0">
              <Palette size={13} aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-ink">
              {t("checklist.itemCustomizeQr")}
            </span>
          </div>
          <span className="text-xs text-muted-foreground bg-background px-2.5 py-1 rounded-md border border-line">
            {t("checklist.comingSoon")}
          </span>
        </div>

        {/* Item 6: Customize guest page */}
        <div className="event-checklist__item flex items-center justify-between p-3.5 bg-surface border border-line rounded-xl">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full border border-line text-subtle flex items-center justify-center shrink-0">
              <PaintBrush size={13} aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-ink">
              {t("checklist.itemCustomizePage")}
            </span>
          </div>
          <span className="text-xs text-muted-foreground bg-background px-2.5 py-1 rounded-md border border-line">
            {t("checklist.comingSoon")}
          </span>
        </div>
      </div>
    </section>
  );
}
