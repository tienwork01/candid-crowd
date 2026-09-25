import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OverviewPageClient } from "@/features/event/components";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("host.pages");

  return {
    title: t("eventsMetaTitle"),
  };
}

export default async function EventOverviewPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="host-shell__content host-shell__content--event-overview">
      <OverviewPageClient eventId={id} />
    </div>
  );
}
