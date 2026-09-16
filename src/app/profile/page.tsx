import type { Metadata } from "next";
import { User } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";
import { HostShell } from "@/features/host/components";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("host.pages");

  return { title: t("profileMetaTitle") };
}

export default async function ProfilePage() {
  const t = await getTranslations("host.pages");

  return (
    <HostShell active="profile">
      <section className="host-account-page" aria-labelledby="profile-title">
        <p className="eyebrow">{t("accountEyebrow")}</p>
        <h1 id="profile-title">{t("profileTitle")}</h1>
        <div className="host-account-page__card">
          <User size={22} aria-hidden="true" />
          <div>
            <h2>{t("profileCardTitle")}</h2>
            <p>{t("profileCardDescription")}</p>
          </div>
        </div>
      </section>
    </HostShell>
  );
}
