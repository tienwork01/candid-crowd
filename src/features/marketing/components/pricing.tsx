import Link from "next/link";
import { ArrowUpRight, Check } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";
import { pricingPlans } from "../data/marketing";

export async function Pricing() {
  const t = await getTranslations("marketing.pricing");

  const plans = pricingPlans.map((plan) => {
    const planKey = plan.id as "free" | "essential" | "plus";

    return {
      ...plan,
      name: t(`plans.${planKey}.name`),
      description: t(`plans.${planKey}.description`),
      priceLabel: t(`plans.${planKey}.priceLabel`),
      billing: t(`plans.${planKey}.billing`),
      cta: t(`plans.${planKey}.cta`),
      features: [
        t(`plans.${planKey}.features.f1`),
        t(`plans.${planKey}.features.f2`),
        t(`plans.${planKey}.features.f3`),
      ],
    };
  });

  return (
    <section
      className="pricing container section-pad"
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
      <div className="pricing__grid">
        {plans.map((plan) => (
          <div className="plan-card__motion" key={plan.id}>
            <article
              className={`plan-card ${plan.featured ? "plan-card--featured" : ""}`}
            >
              {plan.featured ? (
                <span className="plan-card__recommendation">
                  {t("recommendedBadge")}
                </span>
              ) : null}
              <span className="eyebrow">
                {plan.available
                  ? t("availableToExplore")
                  : t("plannedOffering")}
              </span>
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>
              <div className="plan-card__price">{plan.priceLabel}</div>
              <span className="plan-card__billing">{plan.billing}</span>
              {plan.featured ? (
                <p className="plan-card__note">{t("essentialNote")}</p>
              ) : null}
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={16} aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.available ? "/events/new" : "#demo"}
                className={`button ${!plan.featured ? "button--outline" : ""}`}
              >
                {plan.cta}
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </article>
          </div>
        ))}
      </div>
      <p className="section-disclosure">{t("disclosure")}</p>
    </section>
  );
}
