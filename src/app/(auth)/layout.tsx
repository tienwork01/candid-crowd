import Image from "next/image";
import { Sparkle } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";
import "@/features/auth/components/auth.css";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("auth.layout");

  return (
    <div className="auth-page">
      <main id="main" className="auth-page__main">
        <div className="auth-page__content">{children}</div>
        <div className="auth-page__visual" aria-hidden="true">
          {/* Main cinematic photo frame */}
          <figure className="auth-page__hero-frame">
            <Image
              src="/images/countryside.jpg"
              alt={t("heroAlt")}
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              quality={90}
              priority
              className="auth-page__hero-img"
            />
            <figcaption className="auth-page__hero-quote">
              <span className="auth-page__hero-tag">
                {t("momentsInBetween")}
              </span>
              <p className="auth-page__hero-text">
                {t("heroQuoteLine1")}
                <br />
                <em>{t("heroQuoteLine2")}</em>
              </p>
              <span className="auth-page__hero-sub">{t("heroSub")}</span>
            </figcaption>
          </figure>

          {/* Overlapping candid polaroid card */}
          <div className="auth-page__polaroid">
            <div className="auth-page__polaroid-media">
              <Image
                src="/images/wedding-sunset.webp"
                alt={t("polaroidAlt")}
                fill
                sizes="240px"
                quality={85}
              />
            </div>
            <div className="auth-page__polaroid-caption">
              <span>{t("polaroidCaption")}</span>
            </div>
          </div>

          {/* Floating live participation badge */}
          <div className="auth-page__badge">
            <Sparkle size={13} className="auth-page__badge-icon" />
            <span>{t("badgeText")}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
