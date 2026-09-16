import Link from "next/link";
import { Aperture, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";

export async function FinalCta() {
  const t = await getTranslations("marketing.finalCta");

  return (
    <section className="final-cta" aria-labelledby="final-title">
      <Aperture size={39} aria-hidden="true" />
      <span className="eyebrow">{t("eyebrow")}</span>
      <h2 id="final-title">
        {t("titleLine1")}
        <br />
        {t("titleLine2")}
        <br />
        <em>{t("titleLine3")}</em>
      </h2>
      <Link href="/events/new" className="button">
        {t("button")} <ArrowUpRight size={18} aria-hidden="true" />
      </Link>
      <p>{t("subhead")}</p>
    </section>
  );
}
