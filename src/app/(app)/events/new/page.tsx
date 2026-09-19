import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CreateEventForm } from "@/features/event/components";
import { HostShell } from "@/features/host/components";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("host.pages");

  return { title: t("createMetaTitle") };
}

export default async function NewEventPage() {
  return (
    <HostShell active="new">
      <div className="host-shell__content host-shell__content--event-create max-w-lg mx-auto py-8 sm:py-12">
        <CreateEventForm />
      </div>
    </HostShell>
  );
}
