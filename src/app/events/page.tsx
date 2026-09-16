import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { HostShell } from "@/features/host/components/host-shell";

export const metadata: Metadata = { title: "Your events — CandidCrowd" };

export default function EventsPage() {
  return (
    <HostShell active="events">
      <section className="host-events" aria-labelledby="events-title">
        <div className="host-events__heading">
          <div>
            <p className="eyebrow">HOST WORKSPACE</p>
            <h1 id="events-title">Your events</h1>
            <p>Every shared memory starts with one simple event.</p>
          </div>
          <Link className="button" href="/events/new">
            <Plus size={17} aria-hidden="true" /> Create event
          </Link>
        </div>
        <div className="host-events__empty">
          <span className="host-events__empty-icon">
            <CalendarDays size={24} aria-hidden="true" />
          </span>
          <h2>Your event shelf is waiting.</h2>
          <p>
            Create an event, share its QR code, and this is where its gallery
            and host controls will live.
          </p>
          <Link className="text-button" href="/events/new">
            Create your first event <Plus size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </HostShell>
  );
}
