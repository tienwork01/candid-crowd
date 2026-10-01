"use client";

import { useEffect, useState } from "react";
import { SpinnerGap, WarningCircle } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
import "./event.css";

const LAUNCH_WATCHDOG_MS = 30_000;

export function LiveWallLaunchScreen({ failed = false }: { failed?: boolean }) {
  const t = useTranslations("event.liveWall");
  const tCommon = useTranslations("common");
  const [didTimeOut, setDidTimeOut] = useState(false);
  const hasFailed = failed || didTimeOut;

  useEffect(() => {
    if (failed) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => setDidTimeOut(true),
      LAUNCH_WATCHDOG_MS,
    );

    return () => window.clearTimeout(timeoutId);
  }, [failed]);

  const closeLaunchScreen = () => {
    try {
      window.opener?.focus();
    } catch {}

    window.close();
  };

  return (
    <main
      className="live-wall-launch"
      data-failed={hasFailed || undefined}
      aria-live="polite"
      aria-busy={!hasFailed}
    >
      <div className="live-wall-launch__content">
        {hasFailed ? (
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
          {hasFailed ? t("launchFailedTitle") : t("launchingTitle")}
        </h1>
        <p
          className="live-wall-launch__description"
          role={hasFailed ? "alert" : undefined}
        >
          {hasFailed ? t("launchFailedDescription") : t("launchingDescription")}
        </p>
        {hasFailed && (
          <Button
            className="live-wall-launch__action"
            type="button"
            onClick={closeLaunchScreen}
          >
            {tCommon("actions.close")}
          </Button>
        )}
      </div>
    </main>
  );
}
