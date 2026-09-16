import type { Metadata } from "next";
import { User } from "@phosphor-icons/react/dist/ssr";
import { HostShell } from "@/features/host/components";

export const metadata: Metadata = { title: "Profile — CandidCrowd" };

export default function ProfilePage() {
  return (
    <HostShell active="profile">
      <section className="host-account-page" aria-labelledby="profile-title">
        <p className="eyebrow">ACCOUNT</p>
        <h1 id="profile-title">Profile</h1>
        <div className="host-account-page__card">
          <User size={22} aria-hidden="true" />
          <div>
            <h2>Your host profile</h2>
            <p>Your name, avatar, and contact preferences will live here.</p>
          </div>
        </div>
      </section>
    </HostShell>
  );
}
