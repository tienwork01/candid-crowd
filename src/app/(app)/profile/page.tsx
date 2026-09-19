import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HostShell } from "@/features/host/components";
import { ProfileForm } from "@/features/host/components";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("host.pages");

  return { title: t("profileMetaTitle") };
}

export default async function ProfilePage() {
  const t = await getTranslations("host.pages");

  return (
    <HostShell active="profile">
      <section className="profile-page" aria-labelledby="profile-title">
        <div className="profile-page__intro">
          <p className="eyebrow">{t("accountEyebrow")}</p>
          <h1 id="profile-title">{t("profileTitle")}</h1>
          <p>{t("personalInfoDescription")}</p>
        </div>
        <ProfileForm />
      </section>
    </HostShell>
  );
}
