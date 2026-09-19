import { Sparkle, QrCode, Images } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/shared";

export async function HowItWorks() {
  const t = await getTranslations("marketing.howItWorks");

  const steps = [
    {
      title: t("step1Title"),
      description: t("step1Description"),
      Icon: Sparkle,
    },
    {
      title: t("step2Title"),
      description: t("step2Description"),
      Icon: QrCode,
    },
    {
      title: t("step3Title"),
      description: t("step3Description"),
      Icon: Images,
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
        <Reveal>
          <div className="how-it-works__grid">
            {steps.map(({ title, description, Icon }, index) => (
              <article className="how-step" key={index}>
                <div className="how-step__top">
                  <span>0{index + 1}</span>
                  <Icon size={29} aria-hidden="true" />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
