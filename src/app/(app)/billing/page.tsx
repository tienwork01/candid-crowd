import type { Metadata } from "next";
import { CreditCard } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";
import { HostShell, HostUserCard } from "@/features/host/components";
import { Card } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("host.pages");

  return { title: t("billingMetaTitle") };
}

export default async function BillingPage() {
  const t = await getTranslations("host.pages");

  return (
    <HostShell active="billing">
      <section className="profile-page" aria-labelledby="billing-title">
        <div className="profile-page__intro">
          <p className="eyebrow">{t("accountEyebrow")}</p>
          <h1 id="billing-title">{t("billingTitle")}</h1>
          <p>{t("billingCardDescription")}</p>
        </div>

        <div className="profile-page__grid">
          <div className="profile-page__main">
            <Card className="host-account-page__card">
              <CreditCard size={22} aria-hidden="true" />
              <div>
                <h2>{t("billingCardTitle")}</h2>
                <p>{t("billingCardDescription")}</p>
              </div>
            </Card>
          </div>

          <HostUserCard />
        </div>
      </section>
    </HostShell>
  );
}
