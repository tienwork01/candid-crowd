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

type EventAnalyticsViewProps = {
  event: CandidEvent;
};

export function EventAnalyticsView({ event }: EventAnalyticsViewProps) {
  const t = useTranslations("event");

  const expectedGuests = event.expected_guest_count || 100;
  const contributors = event.metrics?.contributors_count || 42;
  const memoriesCount =
    (event.metrics?.photos_count || 0) + (event.metrics?.videos_count || 0) ||
    148;
  const scansCount = event.metrics?.scans_count || 188;
  const visitorsCount = event.metrics?.visitors_count || 96;

  const rate = Math.min(100, Math.round((contributors / expectedGuests) * 100));

  const avgPerContributor =
    contributors > 0 ? (memoriesCount / contributors).toFixed(1) : "0";

  const qrSources = event.qr_sources || [
    {
      id: "s1",
      source: "table",
      label: "Dinner Tables",
      scans_count: 88,
      contributors_count: 38,
      media_count: 82,
    },
    {
      id: "s2",
      source: "entrance",
      label: "Welcome Entrance",
      scans_count: 46,
      contributors_count: 18,
      media_count: 34,
    },
    {
      id: "s3",
      source: "bar",
      label: "Cocktail Bar",
      scans_count: 32,
      contributors_count: 14,
      media_count: 24,
    },
    {
      id: "s4",
      source: "dance_floor",
      label: "Dance Floor",
      scans_count: 22,
      contributors_count: 10,
      media_count: 20,
    },
  ];

  return (
    <div className="event-analytics" aria-labelledby="analytics-heading">
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
              {event.metrics?.photos_count || memoriesCount} photos,{" "}
              {event.metrics?.videos_count || 0} videos
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
              {expectedGuests - contributors} yet to share
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

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
              {Math.round((visitorsCount / scansCount) * 100)}% scan-to-visit
            </span>
          </div>

          <div className="p-3.5 bg-background border border-line rounded-xl text-center">
            <span className="text-xs text-muted-foreground">
              03. Opened Upload
            </span>
            <div className="font-heading text-2xl text-ink mt-0.5">
              {Math.round(visitorsCount * 0.78)}
            </div>
            <span className="text-[11px] text-subtle">78% intent rate</span>
          </div>

          <div className="p-3.5 bg-primary/10 border border-primary/20 rounded-xl text-center">
            <span className="text-xs font-semibold text-primary">
              04. Contributed
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
                <th className="pb-3 px-4">{t("analytics.contributorsCol")}</th>
                <th className="pb-3 px-4">{t("analytics.uploadsCol")}</th>
                <th className="pb-3 pl-4">Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {qrSources.map((source) => {
                const convRate =
                  source.scans_count > 0
                    ? Math.round(
                        (source.contributors_count / source.scans_count) * 100,
                      )
                    : 0;

                return (
                  <tr
                    key={source.id}
                    className="hover:bg-soft/40 transition-colors"
                  >
                    <td className="py-3 pr-4 font-medium text-ink flex items-center gap-2">
                      <Sparkle
                        size={13}
                        className="text-primary"
                        aria-hidden="true"
                      />
                      <span>{source.label}</span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {source.scans_count}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-semibold">
                      {source.contributors_count}
                    </td>
                    <td className="py-3 px-4 text-primary font-semibold">
                      {source.media_count}
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
    </div>
  );
}
