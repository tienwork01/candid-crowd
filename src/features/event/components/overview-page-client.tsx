"use client";

import Link from "next/link";
import { Plus } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useEvent, useMounted } from "../hooks";
import { EventOverviewView } from "./event-overview-view";
import { EventHubSkeleton } from "./event-hub-skeleton";

type OverviewPageClientProps = {
  eventId: string;
};

export function OverviewPageClient({ eventId }: OverviewPageClientProps) {
  const t = useTranslations("event");
  const tCommon = useTranslations("common.errors");
  const mounted = useMounted();

  const { data: event, isLoading } = useEvent(eventId);

  if (!mounted || isLoading) {
    return <EventHubSkeleton />;
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

  return <EventOverviewView event={event} />;
}
