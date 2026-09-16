import { Check, LockKey } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";

export async function PrivacySection() {
  const t = await getTranslations("marketing.privacy");

  const assurances = [
    t("assuranceNoAccount"),
    t("assuranceNoApp"),
    t("assurancePrivateGallery"),
    t("assuranceOriginalQuality"),
    t("assuranceHostControls"),
    t("assuranceModernBrowsers"),
  ];

  return (
    <section
      id="privacy"
      className="privacy-section container section-pad"
      aria-labelledby="privacy-title"
    >
      <div className="privacy-section__intro">
        <LockKey size={30} aria-hidden="true" />
        <div>
          <span className="eyebrow">{t("eyebrow")}</span>
          <h2 id="privacy-title">
            {t("titleLine1")}
            <br />
            <em>{t("titleLine2")}</em>
          </h2>
          <p>
            {t("subheadLine1")}
            <br />
            {t("subheadLine2")}
          </p>
        </div>
      </div>
      <div>
        <ul className="privacy-section__list">
          {assurances.map((item) => (
            <li key={item}>
              <Check size={16} aria-hidden="true" /> {item}
            </li>
          ))}
        </ul>
        <p className="section-disclosure">{t("disclosure")}</p>
      </div>
    </section>
  );
}
