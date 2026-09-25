"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDots,
  Images,
  MagnifyingGlass,
  Plus,
  QrCode,
  TrendUp,
  Users,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { useEventListParams, useEvents, useEventsTotals } from "../hooks";
import { formatDate } from "@/i18n/format";
import type { AppLocale } from "@/i18n/locales";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { EventsToolbar } from "./events-toolbar";
import { PaginationBar } from "./pagination-bar";
import { EventCardSkeletonGrid } from "./event-card-skeleton";

export function EventsListClient() {
  const t = useTranslations("host.pages");
  const tEvent = useTranslations("event");
  const locale = useLocale() as AppLocale;

  // URL-driven params
  const {
    params,
    inputValue,
    setSearch,
    setPage,
    setType,
    setSort,
    toggleDirection,
    clearSearch,
  } = useEventListParams();

  // Paginated query
  const { data, isLoading, isFetching } = useEvents(params);

  // Global totals (all events, independent of current filter/page)
  const { totalEvents, totalMemories, totalContributors } = useEventsTotals();

  const events = data?.data ?? [];
  const pagination = data?.pagination;
  const effectiveTotalEvents = Math.max(
    totalEvents,
    pagination?.total ?? 0,
    events.length,
  );

  const hasActiveSearch = Boolean(params.q?.trim()) || Boolean(params.type);

  // First load — show skeleton
  if (isLoading && !data) {
    return (
      <div className="host-events__content">
        <EventCardSkeletonGrid count={6} />
      </div>
    );
  }

  // No events at all (no search active)
  if (!isLoading && effectiveTotalEvents === 0 && !hasActiveSearch) {
    return (
      <Card className="host-events__empty border-dashed">
        <CardContent className="flex flex-col items-center p-0">
          <span className="host-events__empty-icon">
            <CalendarDots size={24} aria-hidden="true" />
          </span>
          <h2>{t("shelfWaiting")}</h2>
          <p>{t("shelfDescription")}</p>
          <Link className="text-button" href="/events/new">
            {t("createFirstEvent")} <Plus size={16} aria-hidden="true" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="host-events__content">
      {/* Overview Metrics Strip */}
      <div className="host-events__metrics-strip">
        <div className="host-events__metric-card">
          <div className="host-events__metric-icon">
            <CalendarDots size={20} aria-hidden="true" />
          </div>
          <div className="host-events__metric-info">
            <span className="host-events__metric-value">
              {effectiveTotalEvents}
            </span>
            <span className="host-events__metric-label">
              {t("metricEvents")}
            </span>
          </div>
        </div>

        <div className="host-events__metric-card">
          <div className="host-events__metric-icon">
            <Images size={20} aria-hidden="true" />
          </div>
          <div className="host-events__metric-info">
            <span className="host-events__metric-value">{totalMemories}</span>
            <span className="host-events__metric-label">
              {t("metricMemories")}
            </span>
          </div>
        </div>

        <div className="host-events__metric-card">
          <div className="host-events__metric-icon">
            <Users size={20} aria-hidden="true" />
          </div>
          <div className="host-events__metric-info">
            <span className="host-events__metric-value">
              {totalContributors}
            </span>
            <span className="host-events__metric-label">
              {t("metricContributors")}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <EventsToolbar
        inputValue={inputValue}
        onSearchChange={setSearch}
        onSearchClear={clearSearch}
        selectedType={params.type}
        onTypeChange={setType}
        selectedSort={params.sort}
        onSortChange={setSort}
        selectedDirection={params.direction}
        onDirectionToggle={toggleDirection}
      />

      {/* Grid or Skeleton or Empty State */}
      <div className="host-events__grid-wrapper">
        {isLoading && !data ? (
          <EventCardSkeletonGrid count={6} />
        ) : events.length === 0 && hasActiveSearch ? (
          <div className="host-events__search-empty">
            <MagnifyingGlass
              size={32}
              className="host-events__search-empty-icon"
              aria-hidden="true"
            />
            <p className="host-events__search-empty-text">
              {t("noResultsFound")}
            </p>
            <button
              type="button"
              onClick={clearSearch}
              className="host-events__search-empty-btn"
            >
              {t("clearSearch")}
            </button>
          </div>
        ) : (
          /* Events Grid */
          <div
            className={`host-events__grid grid grid-cols-1 sm:grid-cols-2 gap-5 transition-opacity duration-200 ${
              isFetching ? "opacity-75" : ""
            }`}
          >
            {events.map((ev) => {
              const dateString = ev.event_date
                ? formatDate(ev.event_date, locale, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : tEvent("ready.noDate");

              const expectedGuests = ev.expected_guest_count || 100;
              const contributors = ev.metrics?.contributors_count || 0;
              const mediaCount =
                (ev.metrics?.photos_count || 0) +
                (ev.metrics?.videos_count || 0);
              const rate = Math.min(
                100,
                Math.round((contributors / expectedGuests) * 100),
              );

              return (
                <Card
                  key={ev.id}
                  className="host-events__card hover:shadow-card transition-all duration-200 flex flex-col justify-between border-line bg-surface"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className="text-[11px] font-medium"
                        >
                          {tEvent(`types.${ev.event_type}`)}
                        </Badge>
                        {ev.event_mode && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-soft text-muted-foreground border border-line">
                            {ev.event_mode}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarDots size={13} aria-hidden="true" />
                        <span>{dateString}</span>
                      </span>
                    </div>

                    <CardTitle className="text-xl font-heading font-semibold text-ink line-clamp-1">
                      {ev.name}
                    </CardTitle>

                    <CardDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-3 mt-1.5">
                      {Boolean(ev.expected_guest_count) && (
                        <span className="inline-flex items-center gap-1">
                          <Users size={13} aria-hidden="true" />
                          <span>{ev.expected_guest_count} guests</span>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Images size={13} aria-hidden="true" />
                        <span>{mediaCount} memories</span>
                      </span>
                    </CardDescription>

                    {/* Participation Progress Bar */}
                    <div className="mt-3.5 pt-3 border-t border-line/50">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <TrendUp
                            size={12}
                            className="text-primary"
                            aria-hidden="true"
                          />
                          <span>Participation</span>
                        </span>
                        <span className="font-semibold text-primary">
                          {rate}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-soft rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 flex items-center justify-between border-t border-border/40 mt-3 pt-3">
                    <Link
                      href={`/events/${encodeURIComponent(ev.id)}/ready`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                      title={tEvent("checklist.itemQrReady")}
                    >
                      <QrCode size={15} aria-hidden="true" />
                      <span>QR Code</span>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      nativeButton={false}
                      className="text-xs font-medium text-primary hover:text-primary gap-1"
                      render={
                        <Link href={`/events/${encodeURIComponent(ev.id)}`} />
                      }
                    >
                      <span>{tEvent("ready.goToOverview")}</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {pagination && (
        <PaginationBar pagination={pagination} onPageChange={setPage} />
      )}
    </div>
  );
}
