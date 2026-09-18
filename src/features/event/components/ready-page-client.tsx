"use client";

import Link from "next/link";
import { Plus } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useEvent } from "../hooks";
import { EventReadyCard } from "./event-ready-card";
import { EventSetupChecklist } from "./event-setup-checklist";
import { Spinner } from "@/components/ui";

type ReadyPageClientProps = {
  eventId: string;
};

export function ReadyPageClient({ eventId }: ReadyPageClientProps) {
  const t = useTranslations("event");
  const tCommon = useTranslations("common.errors");
  const { data: event, isLoading } = useEvent(eventId);

  if (isLoading) {
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

  return (
    <div className="event-ready-page max-w-3xl mx-auto py-6 sm:py-10">
      <EventReadyCard event={event} />
      <EventSetupChecklist event={event} />
    </div>
  );
}
