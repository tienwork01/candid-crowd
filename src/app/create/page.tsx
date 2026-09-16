import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { EventDraftForm } from "@/features/event/components";
import { HostShell } from "@/features/host/components";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("host.pages");

  return { title: t("createMetaTitle") };
}

export default function CreatePage() {
  return (
    <HostShell active="new">
      <div className="host-shell__content host-shell__content--event-setup">
        <EventDraftForm />
      </div>
    </HostShell>
  );
}
