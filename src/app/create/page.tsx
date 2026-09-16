import type { Metadata } from "next";
import { EventDraftForm } from "@/features/event/components";
import { HostShell } from "@/features/host/components";

export const metadata: Metadata = { title: "Create an event — CandidCrowd" };

export default function CreatePage() {
  return (
    <HostShell active="new">
      <div className="host-shell__content host-shell__content--event-setup">
        <EventDraftForm />
      </div>
    </HostShell>
  );
}
