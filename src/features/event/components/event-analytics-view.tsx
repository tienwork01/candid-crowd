"use client";

import {
  ChartBar,
  ChartPieSlice,
  Funnel,
  Images,
  QrCode,
  Sparkle,
  TrendUp,
  Users,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import type { CandidEvent } from "../types/event";
import { useEventAnalytics } from "../hooks";

type EventAnalyticsViewProps = {
  event: CandidEvent;
};

export function EventAnalyticsView({ event }: EventAnalyticsViewProps) {
  const t = useTranslations("event");
  const { data: analytics, isLoading } = useEventAnalytics(event.id);

  // Analytics values come from the event-scoped backend endpoint. Until it
  // responds, contribution numbers remain zero rather than being invented.
  const expectedGuests =
    analytics?.expected_guest_count ?? event.expected_guest_count ?? 0;
  const contributors = analytics?.contributors ?? 0;
  const photosCount = analytics?.photos ?? 0;
  const videosCount = analytics?.videos ?? 0;
  const memoriesCount = analytics?.media ?? 0;
  const scansCount = analytics?.scans ?? 0;
  const visitorsCount = scansCount;
  const qrSources = analytics?.sources ?? [];

  const rate =
    expectedGuests > 0
      ? Math.min(100, Math.round((contributors / expectedGuests) * 100))
      : 0;

  const scanToVisitRate =
    scansCount > 0 ? Math.round((visitorsCount / scansCount) * 100) : 0;

  const yetToShare = Math.max(0, expectedGuests - contributors);

  const avgPerContributor =
    contributors > 0 ? (memoriesCount / contributors).toFixed(1) : "0";

  return (
    <div
      className="event-analytics"
      aria-labelledby="analytics-heading"
      aria-busy={isLoading}
    >
      {isLoading && (
        <span className="sr-only" role="status" aria-atomic="true">
          {t("analytics.loading")}
        </span>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 id="analytics-heading" className="font-heading text-2xl text-ink">
            {t("analytics.participationHeading")}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("analytics.participationSub")}
          </p>
        </div>
      </div>

      {/* Top Grid: Circular Meter & Key Stat Cards */}
      <div className="event-analytics__top-grid">
        {/* Participation Meter */}
        <div className="event-analytics__rate-card">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <TrendUp size={15} className="text-primary" aria-hidden="true" />
            <span>{t("analytics.rateLabel")}</span>
          </span>

          <div className="event-analytics__meter-circle">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="var(--soft)"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="var(--primary)"
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${rate * 2.51} 251.2`}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="event-analytics__meter-val">{rate}%</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {t("analytics.rateDesc", {
              contributors,
              expected: expectedGuests,
            })}
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="event-analytics__stat-grid">
          {/* Memories */}
          <div className="event-analytics__stat-card">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Images size={14} className="text-primary" aria-hidden="true" />
              <span>{t("overview.statMemories")}</span>
            </span>
            <div className="event-analytics__stat-num">{memoriesCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {photosCount} photos, {videosCount} videos
            </p>
          </div>

          {/* Contributors */}
          <div className="event-analytics__stat-card">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Users size={14} className="text-primary" aria-hidden="true" />
              <span>{t("overview.statContributors")}</span>
            </span>
            <div className="event-analytics__stat-num">{contributors}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {yetToShare} yet to share
            </p>
          </div>

          {/* Scans */}
          <div className="event-analytics__stat-card">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <QrCode size={14} className="text-primary" aria-hidden="true" />
              <span>{t("overview.statScans")}</span>
            </span>
            <div className="event-analytics__stat-num">{scansCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {visitorsCount} unique visitors
            </p>
          </div>

          {/* Avg per contributor */}
          <div className="event-analytics__stat-card">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <ChartBar size={14} className="text-primary" aria-hidden="true" />
              <span>{t("analytics.avgPerContributor")}</span>
            </span>
            <div className="event-analytics__stat-num">{avgPerContributor}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Memories per guest
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Funnel View */}
      <div className="p-6 bg-surface border border-line rounded-2xl shadow-card">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink mb-4 flex items-center gap-2">
          <Funnel size={16} className="text-primary" aria-hidden="true" />
          <span>{t("analytics.funnelHeading")}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-background border border-line rounded-xl text-center">
            <span className="text-xs text-muted-foreground">01. QR Scans</span>
            <div className="font-heading text-2xl text-ink mt-0.5">
              {scansCount}
            </div>
            <span className="text-[11px] text-subtle">100% Top of funnel</span>
          </div>

          <div className="p-3.5 bg-background border border-line rounded-xl text-center">
            <span className="text-xs text-muted-foreground">
              02. Page Visits
            </span>
            <div className="font-heading text-2xl text-ink mt-0.5">
              {visitorsCount}
            </div>
            <span className="text-[11px] text-subtle">
              {scanToVisitRate}% scan-to-visit
            </span>
          </div>

          <div className="p-3.5 bg-primary/10 border border-primary/20 rounded-xl text-center">
            <span className="text-xs font-semibold text-primary">
              03. Contributed
            </span>
            <div className="font-heading text-2xl text-primary mt-0.5">
              {contributors}
            </div>
            <span className="text-[11px] text-primary/80 font-medium">
              {rate}% participation
            </span>
          </div>
        </div>
      </div>

      {/* Bottom: QR Sources Breakdown */}
      {qrSources.length > 0 && (
        <div className="event-analytics__sources-card">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink mb-4 flex items-center gap-2">
            <ChartPieSlice
              size={16}
              className="text-primary"
              aria-hidden="true"
            />
            <span>{t("analytics.sourcesHeading")}</span>
          </h3>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-muted-foreground uppercase tracking-wider font-semibold">
                  <th className="pb-3 pr-4">{t("analytics.sourceCol")}</th>
                  <th className="pb-3 px-4">{t("analytics.scansCol")}</th>
                  <th className="pb-3 px-4">
                    {t("analytics.contributorsCol")}
                  </th>
                  <th className="pb-3 px-4">{t("analytics.uploadsCol")}</th>
                  <th className="pb-3 pl-4">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {qrSources.map((source) => {
                  const convRate =
                    source.scans > 0
                      ? Math.round((source.contributors / source.scans) * 100)
                      : 0;

                  return (
                    <tr
                      key={source.code}
                      className="hover:bg-soft/40 transition-colors"
                    >
                      <td className="py-3 pr-4 font-medium text-ink flex items-center gap-2">
                        <Sparkle
                          size={13}
                          className="text-primary"
                          aria-hidden="true"
                        />
                        <span>{source.name}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {source.scans}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-semibold">
                        {source.contributors}
                      </td>
                      <td className="py-3 px-4 text-primary font-semibold">
                        {source.uploads}
                      </td>
                      <td className="py-3 pl-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-soft rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${convRate}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {convRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
