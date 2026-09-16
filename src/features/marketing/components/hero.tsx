import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  LockKey,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";
import { HeroScene } from "./hero-scene";

export async function Hero() {
  const t = await getTranslations("marketing.hero");

  return (
    <section className="hero container" aria-labelledby="hero-title">
      <div className="hero__copy">
        <span className="eyebrow">
          <span className="status-dot" /> {t("eyebrow")}
        </span>
        <h1 id="hero-title">{t("title")}</h1>
        <p className="hero__description">{t("description")}</p>
        <div className="hero__actions">
          <Link href="/events/new" className="button">
            {t("createEvent")} <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
          <a href="#how-it-works" className="inline-action">
            {t("seeHowItWorks")} <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
        <div className="hero__trust">
          <span>
            <Check aria-hidden="true" /> {t("trustNoApp")}
          </span>
          <span>
            <LockKey aria-hidden="true" /> {t("trustPrivate")}
          </span>
          <span>
            <Sparkle aria-hidden="true" /> {t("trustOriginalQuality")}
          </span>
        </div>
      </div>
      <HeroScene />
    </section>
  );
}
