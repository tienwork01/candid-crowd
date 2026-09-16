import Image from "next/image";
import {
  ArrowRight,
  QrCode,
  Heart,
  PaperPlaneTilt,
} from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/shared";

const WALL_IMAGES = [
  { name: "wedding-meadow.webp", photoKey: "couple" },
  { name: "table.jpg", photoKey: "table" },
  { name: "wedding-sunset.webp", photoKey: "celebration" },
  { name: "flowers.jpg", photoKey: "flowers" },
] as const;

export async function EventLifecycle() {
  const t = await getTranslations("marketing.lifecycle");
  const tPhotos = await getTranslations("marketing.photos");

  return (
    <section
      className="lifecycle section-pad"
      id="event-lifecycle"
      aria-labelledby="lifecycle-title"
    >
      <div className="container">
        <div className="center-heading">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h2 id="lifecycle-title">
            {t("titleLine1")}
            <br />
            <em>{t("titleLine2")}</em>
          </h2>
          <p>{t("subhead")}</p>
        </div>
        <Reveal className="lifecycle__grid">
          <article>
            <div className="lifecycle-card__art lifecycle-card__art--before">
              <div className="lifecycle-card__mini-invitation">
                <span>{t("invitationTop")}</span>
                <strong>{t("invitationHeadline")}</strong>
                <QrCode size={56} aria-hidden="true" />
                <small>{t("invitationScan")}</small>
              </div>
              <span className="lifecycle-card__tag">{t("invitationTag")}</span>
            </div>
            <span className="eyebrow">{t("beforeEyebrow")}</span>
            <h3>{t("beforeTitle")}</h3>
            <p>{t("beforeDescription")}</p>
          </article>
          <article>
            <div className="lifecycle-card__art lifecycle-card__art--during">
              <div className="lifecycle-card__live-wall-label">
                <span className="status-dot" /> {t("liveWallLabel")}
              </div>
              <div className="lifecycle-card__mini-wall">
                {WALL_IMAGES.map(({ name, photoKey }) => (
                  <div key={name}>
                    <Image
                      src={`/images/${name}`}
                      alt={tPhotos(photoKey)}
                      fill
                      sizes="160px"
                    />
                  </div>
                ))}
              </div>
              <span className="lifecycle-card__wall-notice">
                <Heart size={14} aria-hidden="true" /> {t("wallNotice")}
              </span>
            </div>
            <span className="eyebrow">{t("duringEyebrow")}</span>
            <h3>{t("duringTitle")}</h3>
            <p>{t("duringDescription")}</p>
          </article>
          <article>
            <div className="lifecycle-card__art lifecycle-card__art--after">
              <span className="lifecycle-card__reminder-day">
                {t("reminderDay")}
              </span>
              <div className="lifecycle-card__reminder-message">
                <span>{t("reminderOneMore")}</span>
                <p>
                  {t("reminderPromptLine1")}
                  <br />
                  {t("reminderPromptLine2")}
                </p>
                <span className="lifecycle-card__reminder-link">
                  {t("reminderLink")}{" "}
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
              <span className="lifecycle-card__reminder-icon">
                <PaperPlaneTilt size={20} aria-hidden="true" />
              </span>
            </div>
            <span className="eyebrow">{t("afterEyebrow")}</span>
            <h3>{t("afterTitle")}</h3>
            <p>{t("afterDescription")}</p>
          </article>
        </Reveal>
        <p className="section-disclosure">{t("disclosure")}</p>
      </div>
    </section>
  );
}
