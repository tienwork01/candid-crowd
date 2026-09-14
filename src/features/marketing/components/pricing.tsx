import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { pricingPlans } from "../data/marketing";

export function Pricing() {
  return (
    <section
      className="pricing-section container section-pad"
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
      <div className="pricing-grid">
        {pricingPlans.map((plan) => (
          <article
            key={plan.id}
            className={`plan-card ${plan.featured ? "plan-featured" : ""}`}
          >
            <span className="eyebrow">
              {plan.available ? "AVAILABLE TO EXPLORE" : "PLANNED OFFERING"}
            </span>
            <h3>{plan.name}</h3>
            <p>{plan.description}</p>
            <div className="plan-price">{plan.priceLabel}</div>
            <span className="plan-billing">{plan.billing}</span>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <Check size={16} aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href={plan.available ? "/create" : "#demo"}
              className={`button ${!plan.featured ? "button-outline" : ""}`}
            >
              {plan.cta}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
      <p className="section-disclosure">
        Pricing preview · Paid plans and features are not available yet. No
        payments are collected.
      </p>
    </section>
  );
}
