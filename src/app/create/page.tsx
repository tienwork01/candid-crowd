import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/shared/brand";
import { EventDraftForm } from "@/features/event/components/event-draft-form";

export const metadata: Metadata = {
  title: "Create an event draft — CandidCrowd",
};

export default function CreatePage() {
  return (
    <>
      <header className="create-header">
        <div className="container">
          <Brand />
          <Link className="text-button" href="/">
            <ArrowLeft size={15} aria-hidden="true" /> Back to the good stuff
          </Link>
        </div>
      </header>
      <main id="main" className="create-page">
        <span className="eyebrow">YOUR NEXT CHAPTER</span>
        <h1>
          Every gathering
          <br />
          <em>has a story.</em>
        </h1>
        <p className="create-page__intro">
          Start with the essentials. This preview saves a draft on this device
          so you can explore the experience.
        </p>
        <EventDraftForm />
      </main>
    </>
  );
}
