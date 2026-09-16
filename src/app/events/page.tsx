import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDots, Plus } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";
import { HostShell } from "@/features/host/components";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("host.pages");

  return { title: t("eventsMetaTitle") };
}

export default async function EventsPage() {
  const t = await getTranslations("host.pages");

  return (
    <HostShell active="events">
      <section className="host-events" aria-labelledby="events-title">
        <div className="host-events__heading">
          <div>
            <p className="eyebrow">{t("eventsEyebrow")}</p>
            <h1 id="events-title">{t("eventsTitle")}</h1>
            <p>{t("eventsDescription")}</p>
          </div>
          <Link className="button" href="/events/new">
            <Plus size={17} aria-hidden="true" /> {t("createEvent")}
          </Link>
        </div>
        <div className="host-events__empty">
          <span className="host-events__empty-icon">
            <CalendarDots size={24} aria-hidden="true" />
          </span>
          <h2>{t("shelfWaiting")}</h2>
          <p>{t("shelfDescription")}</p>
          <Link className="text-button" href="/events/new">
            {t("createFirstEvent")} <Plus size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </HostShell>
  );
}
