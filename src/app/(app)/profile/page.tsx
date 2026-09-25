import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProfileForm } from "@/features/host/components";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("host.pages");

  return { title: t("profileMetaTitle") };
}

export default async function ProfilePage() {
  const t = await getTranslations("host.pages");

  return (
    <section className="profile-page" aria-labelledby="profile-title">
      <header className="profile-page__intro">
        <div className="profile-page__context-bar">
          <span className="profile-page__status-badge">
            <span className="profile-page__status-dot" aria-hidden="true" />
            <span>{t("accountEyebrow")}</span>
          </span>
        </div>
        <div className="profile-page__heading">
          <div className="profile-page__title-group">
            <h1 id="profile-title">{t("profileTitle")}</h1>
            <p className="profile-page__description">
              {t("personalInfoDescription")}
            </p>
          </div>
        </div>
      </header>
      <ProfileForm />
    </section>
  );
}
