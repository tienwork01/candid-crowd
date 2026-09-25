import Link from "next/link";
import {
  CameraSlash,
  House,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";
import { getLocale, getTranslations } from "next-intl/server";
import { marketingHref } from "@/i18n/marketing";
import { isAppLocale, type AppLocale } from "@/i18n/locales";
import "./not-found.css";

/**
 * `locale` mirrors `Header`: passing it explicitly keeps this component off the
 * ambient `getLocale()` path, which reads request headers and would force the
 * rendering route to be dynamic.
 */
export async function NotFoundView({ locale }: { locale?: AppLocale } = {}) {
  const resolvedLocale = locale ?? (await getLocale());
  const activeLocale: AppLocale = isAppLocale(resolvedLocale)
    ? resolvedLocale
    : "en";
  const t = await getTranslations({
    locale: activeLocale,
    namespace: "notFound",
  });

  const prefix = marketingHref(activeLocale);

  return (
    <main id="main" className="not-found" role="main">
      <div className="not-found__inner">
        {/* Visual Artifact: Styled Editorial Polaroid Frame */}
        <div className="not-found__visual" aria-hidden="true">
          <div className="not-found__polaroid">
            <div className="not-found__polaroid-frame">
              <CameraSlash
                size={30}
                weight="duotone"
                className="not-found__polaroid-icon"
              />
              <span className="not-found__polaroid-code">404</span>
            </div>
            <span className="not-found__polaroid-caption">
              {t("polaroidCaption")}
            </span>
          </div>
        </div>

        {/* Content Block */}
        <div className="not-found__content">
          <div className="not-found__badge">
            <span className="not-found__dot" aria-hidden="true" />
            <span>{t("badge")}</span>
          </div>

          <h1 className="not-found__title">{t("title")}</h1>
          <p className="not-found__lead">{t("description")}</p>

          {/* Primary & Secondary Actions */}
          <div className="not-found__actions">
            <Link
              href={prefix || "/"}
              className="not-found__btn not-found__btn--primary"
            >
              <House size={18} aria-hidden="true" />
              <span>{t("backHome")}</span>
            </Link>

            <Link
              href="/register?next=/events/new"
              className="not-found__btn not-found__btn--secondary"
            >
              <span>{t("createEvent")}</span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      <footer className="not-found__footer">
        <span>© {new Date().getFullYear()} CandidCrowd</span>
      </footer>
    </main>
  );
}
