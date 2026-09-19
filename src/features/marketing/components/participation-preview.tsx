import {
  ArrowDown,
  ChartLineUp,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import { getFormatter, getTranslations } from "next-intl/server";
import { Reveal } from "@/components/shared";
import { participation, sampleEvent } from "../data/marketing";

export async function ParticipationPreview() {
  const [t, format] = await Promise.all([
    getTranslations("marketing.participation"),
    getFormatter(),
  ]);

  return (
    <section
      id="participation"
      className="participation container section-pad"
      aria-labelledby="participation-title"
    >
      <div className="participation__copy">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h2 id="participation-title" className="participation__title">
          <span>{t("titleLine1")}</span> <em>{t("titleLine2")}</em>
        </h2>
        <p>{t("subhead")}</p>
        <div className="participation__point">
          <span>01</span>
          <div>
            <h3>{t("point1Title")}</h3>
            <p>{t("point1Description")}</p>
          </div>
        </div>
        <div className="participation__point">
          <span>02</span>
          <div>
            <h3>{t("point2Title")}</h3>
            <p>{t("point2Description")}</p>
          </div>
        </div>
      </div>

      <Reveal className="participation-dashboard">
        <div className="participation-dashboard__heading">
          <div>
            <div className="participation-dashboard__tag-wrap">
              <span className="eyebrow">{t("dashboardEyebrow")}</span>
              <span className="participation-dashboard__badge">
                <Sparkle size={12} aria-hidden="true" />
                {t("previewBadge")}
              </span>
            </div>
            <h3>{sampleEvent.name}</h3>
          </div>
          <div className="participation-dashboard__stat">
            <span className="participation-dashboard__number">
              {format.number(participation.rate, {
                style: "percent",
                maximumFractionDigits: 0,
              })}
            </span>
            <span className="participation-dashboard__label">
              {t("participationLabel")}
            </span>
          </div>
        </div>

        <div className="participation-dashboard__metrics">
          <div>
            <span className="participation-dashboard__metric-value">
              {format.number(participation.guests)}
            </span>
            <span className="participation-dashboard__metric-label">
              {t("expectedGuests")}
            </span>
          </div>
          <div>
            <span className="participation-dashboard__metric-value">
              {format.number(participation.contributors)}
            </span>
            <span className="participation-dashboard__metric-label">
              {t("contributorsCol")}
            </span>
          </div>
          <div>
            <span className="participation-dashboard__metric-value">
              {format.number(participation.rate, {
                style: "percent",
                maximumFractionDigits: 0,
              })}
            </span>
            <span className="participation-dashboard__metric-label">
              {t("participationRate")}
            </span>
          </div>
          <div>
            <span className="participation-dashboard__metric-value">
              {format.number(participation.photos)}
            </span>
            <span className="participation-dashboard__metric-label">
              {t("memoriesCollected")}
            </span>
          </div>
        </div>

        <div className="participation-funnel">
          <div className="participation-funnel__header">
            <ChartLineUp size={16} aria-hidden="true" />
            <span>{t("funnelHeading")}</span>
          </div>

          <div className="participation-funnel__steps">
            {participation.funnel.map((step, index) => {
              const funnelKey = step.key as
                "scans" | "visits" | "opened" | "contributed";

              return (
                <div key={step.key} className="participation-funnel__step-wrap">
                  <div className="participation-funnel__step">
                    <div className="participation-funnel__info">
                      <span className="participation-funnel__name">
                        {t(`funnel.${funnelKey}`)}
                      </span>
                      <div className="participation-funnel__count-wrap">
                        <span className="participation-funnel__count">
                          {format.number(step.count)}
                        </span>
                        <span className="participation-funnel__percent">
                          {step.percentage}%
                        </span>
                      </div>
                    </div>
                    <div
                      className="participation-funnel__track"
                      aria-hidden="true"
                    >
                      <div
                        className="participation-funnel__bar"
                        style={{ width: `${step.percentage}%` }}
                      />
                    </div>
                  </div>
                  {index < participation.funnel.length - 1 && (
                    <div
                      className="participation-funnel__connector"
                      aria-hidden="true"
                    >
                      <ArrowDown size={14} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="participation-funnel__caption">{t("funnelCaption")}</p>
        </div>
      </Reveal>
    </section>
  );
}
