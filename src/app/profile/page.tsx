import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import { HostShell } from "@/features/host/components/host-shell";

export const metadata: Metadata = { title: "Profile — CandidCrowd" };

export default function ProfilePage() {
  return (
    <HostShell active="profile">
      <section className="host-account-page" aria-labelledby="profile-title">
        <p className="eyebrow">ACCOUNT</p>
        <h1 id="profile-title">Profile</h1>
        <div className="host-account-page__card">
          <UserRound size={22} aria-hidden="true" />
          <div>
            <h2>Your host profile</h2>
            <p>Your name, avatar, and contact preferences will live here.</p>
          </div>
        </div>
      </section>
    </HostShell>
  );
}
