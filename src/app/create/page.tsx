import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Brand } from "@/components/shared/brand";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { EventDraftForm } from "@/features/event/components/event-draft-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create an event — CandidCrowd",
};

export default async function CreatePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login?next=/create");

  if (!session.user.emailVerified) {
    redirect(`/verify-email?email=${encodeURIComponent(session.user.email)}`);
  }

  return (
    <>
      <header className="create-header">
        <div className="container">
          <Brand />
          <Link className="text-button" href="/">
            <ArrowLeft size={15} aria-hidden="true" /> Back to the good stuff
          </Link>
          <LogoutButton />
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
          Start with the essentials. We’ll create a private event and prepare
          its guest link.
        </p>
        <EventDraftForm />
      </main>
    </>
  );
}
