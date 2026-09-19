import Link from "next/link";
import { ArrowUpRight, Check, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/shared";

export async function EarlyAccess() {
  const t = await getTranslations("marketing.earlyAccess");

  const features = [
    t("features.oneQr"),
    t("features.noApp"),
    t("features.realtimeGallery"),
    t("features.originalQuality"),
  ];

  return (
    <section
      className="early-access container section-pad"
      id="pricing"
      aria-labelledby="pricing-title"
    >
      <div className="center-heading">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h2 id="pricing-title">
          {t("titleLine1")}
          <br />
          <em>{t("titleLine2")}</em>
        </h2>
        <p>{t("subhead")}</p>
      </div>

      <Reveal>
        <div className="early-access__card-wrapper">
          <article className="early-access__card">
            <div className="early-access__header">
              <span className="early-access__badge">
                <Sparkle size={14} aria-hidden="true" />
                {t("badge")}
              </span>
              <h3 className="early-access__plan-name">{t("planName")}</h3>
              <div className="early-access__price-wrap">
                <span className="early-access__price">{t("price")}</span>
                <span className="early-access__billing">{t("billing")}</span>
              </div>
              <p className="early-access__description">{t("description")}</p>
            </div>

            <ul className="early-access__features">
              {features.map((feature) => (
                <li key={feature} className="early-access__feature-item">
                  <Check
                    size={16}
                    aria-hidden="true"
                    className="early-access__check-icon"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="early-access__actions">
              <Link
                href="/register?next=/events/new"
                className="button early-access__button"
              >
                {t("cta")}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>

            <p className="early-access__note">{t("note")}</p>
          </article>
        </div>
      </Reveal>
    </section>
  );
}
