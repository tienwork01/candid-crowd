"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDots,
  Plus,
  QrCode,
  Users,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { useEvents } from "../hooks";
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
  Spinner,
} from "@/components/ui";

export function EventsListClient() {
  const t = useTranslations("host.pages");
  const tEvent = useTranslations("event");
  const locale = useLocale() as AppLocale;
  const { data: events, isLoading } = useEvents();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[40vh]">
        <Spinner size="lg" className="text-primary mb-3" />
        <p className="text-sm text-muted-foreground">
          {tEvent("create.creating")}
        </p>
      </div>
    );
  }

  if (!events || events.length === 0) {
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
    <div className="host-events__grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {events.map((ev) => {
        const dateString = ev.event_date
          ? formatDate(ev.event_date, locale, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : tEvent("ready.noDate");

        return (
          <Card
            key={ev.id}
            className="host-events__card hover:shadow-card transition-shadow duration-200 flex flex-col justify-between"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <Badge variant="secondary" className="text-[11px] font-medium">
                  {tEvent(`types.${ev.event_type}`)}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <CalendarDots size={14} aria-hidden="true" />
                  {dateString}
                </span>
              </div>
              <CardTitle className="text-xl font-heading font-semibold text-ink line-clamp-1">
                {ev.name}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                {Boolean(ev.expected_guest_count) && (
                  <span className="inline-flex items-center gap-1">
                    <Users size={14} aria-hidden="true" />
                    {ev.expected_guest_count}{" "}
                    {tEvent("checklist.itemGuestCount").toLowerCase()}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex items-center justify-between border-t border-border/40 mt-3 pt-3">
              <Link
                href={`/events/${encodeURIComponent(ev.id)}/ready`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                title={tEvent("checklist.itemQrReady")}
              >
                <QrCode size={16} aria-hidden="true" />
                <span>QR Code</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-medium text-primary hover:text-primary gap-1"
                render={<Link href={`/events/${encodeURIComponent(ev.id)}`} />}
              >
                <span>{tEvent("ready.goToOverview")}</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
