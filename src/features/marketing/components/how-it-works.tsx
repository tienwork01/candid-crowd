import { QrCode, DeviceMobile, Heart } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";

export async function HowItWorks() {
  const t = await getTranslations("marketing.howItWorks");

  const steps = [
    {
      title: t("step1Title"),
      description: t("step1Description"),
      detail: t("step1Detail"),
      Icon: Heart,
    },
    {
      title: t("step2Title"),
      description: t("step2Description"),
      detail: t("step2Detail"),
      Icon: QrCode,
    },
    {
      title: t("step3Title"),
      description: t("step3Description"),
      detail: t("step3Detail"),
      Icon: DeviceMobile,
    },
  ];

  return (
    <section
      className="how-it-works section-pad"
      id="how-it-works"
      aria-labelledby="how-title"
    >
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{t("eyebrow")}</span>
            <h2 id="how-title">
              {t("titleLine1")}
              <br />
              <em>{t("titleLine2")}</em>
            </h2>
          </div>
          <p>
            {t("subheadLine1")}
            <br />
            {t("subheadLine2")}
          </p>
        </div>
        <div className="how-it-works__grid">
          {steps.map(({ title, description, detail, Icon }, index) => (
            <article className="how-step" key={index}>
              <div className="how-step__top">
                <span>0{index + 1}</span>
                <Icon size={29} aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              <span className="how-step__detail">{detail}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
