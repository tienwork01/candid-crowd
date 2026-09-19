import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";
import {
  HostShell,
  HostTipCard,
  HostUserCard,
} from "@/features/host/components";
import {
  EventsListClient,
  EventCardSkeletonGrid,
} from "@/features/event/components";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("host.pages");

  return { title: t("eventsMetaTitle") };
}

export default async function EventsPage() {
  const t = await getTranslations("host.pages");

  return (
    <HostShell active="events">
      <section className="host-events" aria-labelledby="events-title">
        <div className="host-events__layout">
          <div className="host-events__main">
            <header className="host-events__header">
              <div className="host-events__context-bar">
                <span className="host-events__status-badge">
                  <span
                    className="host-events__status-dot"
                    aria-hidden="true"
                  />
                  <span>{t("eventsEyebrow")}</span>
                </span>
                <span className="host-events__badge-sep" aria-hidden="true">
                  •
                </span>
                <span className="host-events__live-text">
                  {t("realtimeReady")}
                </span>
              </div>

              <div className="host-events__heading">
                <div className="host-events__title-group">
                  <h1 id="events-title">{t("eventsTitle")}</h1>
                  <p className="host-events__description">
                    {t("eventsDescription")}
                  </p>
                </div>
                <Link
                  className="button host-events__create-btn"
                  href="/events/new"
                >
                  <Plus size={17} aria-hidden="true" />
                  <span>{t("createEvent")}</span>
                </Link>
              </div>
            </header>

            <Suspense fallback={<EventCardSkeletonGrid count={6} />}>
              <EventsListClient />
            </Suspense>
          </div>

          <div className="host-events__sidebar">
            <HostUserCard extraSlot={<HostTipCard />} />
          </div>
        </div>
      </section>
    </HostShell>
  );
}
