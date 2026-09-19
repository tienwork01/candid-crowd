"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEvent, useMounted } from "../hooks";
import { GuestEventView } from "./guest-event-view";
import { Spinner } from "@/components/ui";
import type { CandidEvent } from "../types/event";

type GuestPageClientProps = {
  slug: string;
};

export function GuestPageClient({ slug }: GuestPageClientProps) {
  const searchParams = useSearchParams();
  const t = useTranslations("event");
  const isTest = searchParams?.get("is_test") === "true";
  const mounted = useMounted();

  const { data: event, isLoading } = useEvent(slug);

  if (!mounted || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Spinner size="lg" className="text-primary mb-3" />
        <p className="text-sm text-muted-foreground">{t("create.creating")}</p>
      </div>
    );
  }

  // If event not found, provide a fallback guest mock event so previewing is always seamless
  const displayEvent: CandidEvent = event || {
    id: `evt_demo_${slug}`,
    name:
      slug
        .split("-")
        .slice(0, -1)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ") || "Celebration",
    event_type: "Wedding",
    event_date: null,
    date_unknown: true,
    expected_guest_count: 100,
    slug,
    public_url: `/e/${slug}`,
    guest_url: `https://candidcrowd.com/e/${slug}`,
    qr_destination: `https://candidcrowd.com/e/${slug}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return <GuestEventView event={displayEvent} isTest={isTest} />;
}
