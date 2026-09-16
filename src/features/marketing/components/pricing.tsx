import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { pricingPlans } from "../data/marketing";

export function Pricing() {
  return (
    <section
      className="pricing container section-pad"
      id="pricing"
      aria-labelledby="pricing-title"
    >
      <div className="center-heading">
        <span className="eyebrow">A PLAN FOR YOUR KIND OF CELEBRATION</span>
        <h2 id="pricing-title">
          Little gathering.
          <br />
          <em>Big memories.</em>
        </h2>
        <p>Start with the free preview. Find the right fit as we grow.</p>
      </div>
      <div className="pricing__grid">
        {pricingPlans.map((plan) => (
          <div className="plan-card__motion" key={plan.id}>
            <article
              className={`plan-card ${plan.featured ? "plan-card--featured" : ""}`}
            >
              {plan.featured ? (
                <span className="plan-card__recommendation">
                  Most loved for a full celebration
                </span>
              ) : null}
              <span className="eyebrow">
                {plan.available ? "AVAILABLE TO EXPLORE" : "PLANNED OFFERING"}
              </span>
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>
              <div className="plan-card__price">{plan.priceLabel}</div>
              <span className="plan-card__billing">{plan.billing}</span>
              {plan.featured ? (
                <p className="plan-card__note">
                  The essentials for bringing every guest perspective together.
                </p>
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
      <p className="section-disclosure">
        Pricing preview · Paid plans and features are not available yet. No
        payments are collected.
      </p>
    </section>
  );
}
