"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useMounted, usePublicEvent } from "../hooks";
import { GuestEventView } from "./guest-event-view";
import { Spinner } from "@/components/ui";
import { siteConfig } from "@/lib/config";

type GuestPageClientProps = {
  slug: string;
};

export function GuestPageClient({ slug }: GuestPageClientProps) {
  const t = useTranslations("event");
  const mounted = useMounted();

  const { data: publicEvent, isLoading, isError, error } = usePublicEvent(slug);

  useEffect(() => {
    if (!isError) return;

    // The guest page is the one surface that must show exactly what a guest on
    // another device sees. Reading a locally stored copy here used to hide a
    // broken API from the host while every scanned QR code failed.
    console.error(`[guest] could not load event "${slug}"`, error);
  }, [isError, error, slug]);

  if (!mounted || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Spinner size="lg" className="text-primary mb-3" />
        <p className="text-sm text-muted-foreground">{t("create.creating")}</p>
      </div>
    );
  }

  if (isError || !publicEvent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <h1 className="text-xl font-semibold">
          {t("guest.eventUnavailableTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("guest.eventUnavailableDesc")}
        </p>
      </div>
    );
  }

  const eventTypes: Record<string, import("../types/event").EventType> = {
    wedding: "Wedding",
    birthday: "Birthday",
    anniversary: "Anniversary",
    graduation: "Graduation",
    "baby shower": "Baby Shower",
    reunion: "Reunion",
    party: "Party",
    corporate: "Corporate",
    conference: "Conference",
    other: "Other",
  };
  const eventType = eventTypes[publicEvent.event_type.toLowerCase()] || "Other";
  const displayEvent = {
    id: publicEvent.id,
    name: publicEvent.name,
    event_type: eventType,
    event_date: publicEvent.event_date,
    date_unknown: !publicEvent.event_date,
    slug: publicEvent.slug,
    public_url: `/e/${publicEvent.slug}`,
    guest_url:
      typeof window !== "undefined"
        ? `${window.location.origin}/e/${publicEvent.slug}`
        : `${siteConfig.appUrl}/e/${publicEvent.slug}`,
    qr_destination:
      typeof window !== "undefined"
        ? `${window.location.origin}/e/${publicEvent.slug}`
        : `${siteConfig.appUrl}/e/${publicEvent.slug}`,
    gallery_enabled: publicEvent.gallery_enabled,
    guest_theme: publicEvent.guest_theme || undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const isTest =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("is_test") === "true";

  return <GuestEventView event={displayEvent} isTest={isTest} />;
}
