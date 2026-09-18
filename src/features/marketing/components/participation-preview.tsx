import { ArrowUpRight, Users } from "@phosphor-icons/react/dist/ssr";
import { getFormatter, getTranslations } from "next-intl/server";
import { Reveal } from "@/components/shared";
import { participation, sampleEvent } from "../data/marketing";

export async function ParticipationPreview() {
  const [t, tSources, format] = await Promise.all([
    getTranslations("marketing.participation"),
    getTranslations("marketing.participation.sources"),
    getFormatter(),
  ]);

  type SourceKey = "qr" | "link";

  const rate = participation.contributors / participation.guests;

  return (
    <section
      id="why-candidcrowd"
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
        <p className="participation__note">{t("conceptNote")}</p>
      </div>
      <Reveal className="participation-dashboard">
        <div className="participation-dashboard__heading">
          <div>
            <span className="eyebrow">{t("dashboardEyebrow")}</span>
            <h3>{sampleEvent.name}</h3>
          </div>
          <div className="participation-dashboard__stat">
            <span className="participation-dashboard__number">
              {format.number(rate, {
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
              {format.number(participation.contributors)}
            </span>
            <span className="participation-dashboard__metric-label">
              {t("contributorsCol")}
            </span>
          </div>
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
              {format.number(participation.photos)}
            </span>
            <span className="participation-dashboard__metric-label">
              {t("photos")}
            </span>
          </div>
          <div>
            <span className="participation-dashboard__metric-value">
              {format.number(participation.videos)}
            </span>
            <span className="participation-dashboard__metric-label">
              {t("videos")}
            </span>
          </div>
        </div>
        <div className="participation-dashboard__breakdown-title">
          <Users size={16} aria-hidden="true" />
          <span>{t("sourcesHeading")}</span>
        </div>
        <table className="participation-dashboard__source-table">
          <caption className="sr-only">{t("tableCaption")}</caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">{t("thSource")}</th>
              <th scope="col">{t("contributorsCol")}</th>
            </tr>
          </thead>
          <tbody>
            {participation.sources.map((source) => (
              <tr key={source.key}>
                <th scope="row">
                  <span>{tSources(source.key as SourceKey)}</span>
                  <span
                    className="participation-dashboard__source-track"
                    aria-hidden="true"
                  >
                    <span
                      style={{
                        width: `${(source.contributors / participation.contributors) * 100}%`,
                      }}
                    />
                  </span>
                </th>
                <td>
                  {format.number(source.contributors)}{" "}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </section>
  );
}
