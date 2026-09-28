"use client";

import { SpinnerGap, WarningCircle } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import "./event.css";

export function LiveWallLaunchScreen({ failed = false }: { failed?: boolean }) {
  const t = useTranslations("event.liveWall");

  return (
    <main
      className="live-wall-launch"
      data-failed={failed || undefined}
      aria-live="polite"
    >
      <div className="live-wall-launch__content">
        {failed ? (
          <WarningCircle
            className="live-wall-launch__error-icon"
            aria-hidden="true"
            weight="fill"
          />
        ) : (
          <SpinnerGap
            className="live-wall-launch__spinner"
            aria-hidden="true"
            weight="bold"
          />
        )}
        <h1 className="live-wall-launch__title">
          {failed ? t("launchFailedTitle") : t("launchingTitle")}
        </h1>
        <p
          className="live-wall-launch__description"
          role={failed ? "alert" : undefined}
        >
          {failed ? t("launchFailedDescription") : t("launchingDescription")}
        </p>
      </div>
    </main>
  );
}
