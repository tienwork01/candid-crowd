import Link from "next/link";
import { Aperture, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/shared";

export async function FinalCta() {
  const t = await getTranslations("marketing.finalCta");

  return (
    <section className="final-cta" aria-labelledby="final-title">
      <Reveal>
        <Aperture size={39} aria-hidden="true" />
        <span className="eyebrow">{t("eyebrow")}</span>
        <h2 id="final-title">
          {t("titleLine1")}
          <br />
          <em>{t("titleLine2")}</em>
        </h2>
        <div className="final-cta__actions">
          <Link href="/register?next=/events/new" className="button">
            {t("button")} <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <p>{t("subhead")}</p>
      </Reveal>
    </section>
  );
}
