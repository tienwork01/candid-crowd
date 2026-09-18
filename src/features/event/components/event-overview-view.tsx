"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarCheck,
  Camera,
  Check,
  Copy,
  DownloadSimple,
  Eye,
  Images,
  QrCode,
  ShareNetwork,
  Sparkle,
  Users,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import type { CandidEvent, EventLifecyclePhase } from "../types/event";
import { formatDate } from "@/i18n/format";
import type { AppLocale } from "@/i18n/locales";
import { Button, Card, CardContent } from "@/components/ui";

type EventOverviewViewProps = {
  event: CandidEvent;
};

export function EventOverviewView({ event }: EventOverviewViewProps) {
  const t = useTranslations("event");
  const locale = useLocale() as AppLocale;

  const [activePhase, setActivePhase] = useState<EventLifecyclePhase>(
    event.lifecycle_phase || "before",
  );
  const [copiedLink, setCopiedLink] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicPath = event.public_url || `/e/${event.slug}`;
  const fullGuestUrl = event.guest_url || `${origin}${publicPath}`;
  const testGuestUrl = `${fullGuestUrl}?is_test=true`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullGuestUrl);
      setCopiedLink(true);
      toast.success(t("ready.linkCopied"));
      setTimeout(() => setCopiedLink(false), 2400);
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

  const formattedDate = event.event_date
    ? formatDate(event.event_date, locale, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : t("ready.noDate");

  // Calculate days remaining if date is available
  let daysRemaining: number | null = null;

  if (event.event_date) {
    const target = new Date(event.event_date).getTime();
    const now = new Date().getTime();

    daysRemaining = Math.max(
      0,
      Math.ceil((target - now) / (1000 * 60 * 60 * 24)),
    );
  }

  const expectedGuests = event.expected_guest_count || 100;
  const mockContributors =
    activePhase === "during" ? 38 : activePhase === "after" ? 76 : 0;
  const mockMemories =
    activePhase === "during" ? 142 : activePhase === "after" ? 318 : 0;
  const mockScans =
    activePhase === "during" ? 88 : activePhase === "after" ? 124 : 0;
  const mockRate = Math.round((mockContributors / expectedGuests) * 100);

  return (
    <div className="event-overview-board max-w-5xl mx-auto pb-16">
      {/* Top Breadcrumb Navigation */}
      <nav aria-label={t("overview.breadcrumb")} className="mb-6">
        <Link
          href="/events"
          className="text-xs text-muted-foreground hover:text-ink inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>{t("overview.breadcrumb")}</span>
        </Link>
      </nav>

      {/* Main Header */}
      <div className="event-overview-board__header flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-line">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface border border-line text-muted-foreground">
              {t(`types.${event.event_type}`)}
            </span>
            <span className="text-xs text-subtle font-medium">
              {formattedDate}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading text-ink">
            {event.name}
          </h1>
        </div>

        {/* Header Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="text-xs h-9"
          >
            {copiedLink ? (
              <Check size={14} className="text-primary mr-1" />
            ) : (
              <Copy size={14} className="mr-1" />
            )}
            <span>{t("ready.copyLink")}</span>
          </Button>

          <Link
            href={`/events/${encodeURIComponent(event.id)}/ready`}
            className="button button--secondary text-xs h-9 inline-flex items-center gap-1.5 px-3 rounded-md"
          >
            <QrCode size={16} aria-hidden="true" />
            <span>{t("ready.downloadQr")}</span>
          </Link>

          <a
            href={testGuestUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button button--primary text-xs h-9 inline-flex items-center gap-1.5 px-3.5 rounded-md"
          >
            <Eye size={16} weight="bold" aria-hidden="true" />
            <span>{t("ready.previewAsGuest")}</span>
          </a>
        </div>
      </div>

      {/* Lifecycle Phase Switcher Tabs */}
      <div className="event-overview-board__lifecycle mt-8 p-1.5 bg-surface border border-line rounded-xl inline-flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setActivePhase("before")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activePhase === "before"
              ? "bg-primary text-primary-foreground shadow-subtle"
              : "text-muted-foreground hover:text-ink"
          }`}
        >
          {t("overview.lifecycleBefore")}
        </button>

        <button
          type="button"
          onClick={() => setActivePhase("during")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activePhase === "during"
              ? "bg-primary text-primary-foreground shadow-subtle"
              : "text-muted-foreground hover:text-ink"
          }`}
        >
          {t("overview.lifecycleDuring")}
        </button>

        <button
          type="button"
          onClick={() => setActivePhase("after")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activePhase === "after"
              ? "bg-primary text-primary-foreground shadow-subtle"
              : "text-muted-foreground hover:text-ink"
          }`}
        >
          {t("overview.lifecycleAfter")}
        </button>
      </div>
      <p className="text-xs text-subtle mt-2 ml-1">
        {t("overview.lifecycleNote")}
      </p>

      {/* PHASE CONTENT */}

      {/* Phase 1: Before Event */}
      {activePhase === "before" && (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Days remaining countdown */}
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

            {/* Expected guest count baseline */}
            <Card className="bg-surface border-line shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between text-muted-foreground mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    {t("guestCount.heading")}
                  </span>
                  <Users size={20} className="text-primary" />
                </div>
                <div className="text-2xl font-heading text-ink">
                  {event.expected_guest_count
                    ? `${event.expected_guest_count}`
                    : "100"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("guestCount.description")}
                </p>
              </CardContent>
            </Card>

            {/* Event readiness */}
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

          {/* Quick Share Callout */}
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
                href={`/events/${encodeURIComponent(event.id)}/ready`}
                className="button button--secondary text-xs h-10 w-full sm:w-auto inline-flex items-center justify-center gap-1.5"
              >
                <DownloadSimple size={16} />
                <span>{t("ready.downloadQr")}</span>
              </Link>
              <Button
                type="button"
                onClick={handleCopyLink}
                className="button text-xs h-10 w-full sm:w-auto inline-flex items-center justify-center gap-1.5"
              >
                <ShareNetwork size={16} />
                <span>{t("ready.copyLink")}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 2: During Event */}
      {activePhase === "during" && (
        <div className="mt-8 space-y-6">
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

          {/* Recent Uploads Grid */}
          <div className="bg-surface border border-line rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg text-ink flex items-center gap-2">
                <Images size={20} className="text-primary" />
                <span>{t("overview.recentUploads")}</span>
              </h3>
              <span className="text-xs text-muted-foreground">
                {t("ready.noAppNeeded")}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="aspect-square bg-muted/30 rounded-xl border border-line flex flex-col items-center justify-center p-3 text-center"
                >
                  <Camera size={28} className="text-subtle mb-1" />
                  <span className="text-[11px] text-muted-foreground">
                    #{index}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Phase 3: After Event */}
      {activePhase === "after" && (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="bg-surface border-line">
              <CardContent className="p-6">
                <span className="text-xs text-muted-foreground uppercase font-semibold">
                  {t("overview.statMemories")}
                </span>
                <div className="text-3xl font-heading text-ink mt-1">
                  {mockMemories}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface border-line">
              <CardContent className="p-6">
                <span className="text-xs text-muted-foreground uppercase font-semibold">
                  {t("overview.statContributors")}
                </span>
                <div className="text-3xl font-heading text-ink mt-1">
                  {mockContributors}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface border-line">
              <CardContent className="p-6">
                <span className="text-xs text-muted-foreground uppercase font-semibold">
                  {t("overview.statParticipation")}
                </span>
                <div className="text-3xl font-heading text-primary mt-1">
                  {mockRate}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Morning-After Recovery CTA */}
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
                  className="button h-11 px-5 text-sm font-medium inline-flex items-center gap-2"
                >
                  <Copy size={16} />
                  <span>{t("overview.copyReminderLink")}</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="h-11 px-4 text-sm"
                >
                  <span>{t("ready.copyLink")}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
