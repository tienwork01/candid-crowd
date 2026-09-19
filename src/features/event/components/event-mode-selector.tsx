"use client";

import {
  Confetti,
  FadersHorizontal,
  SpeakerSimpleSlash,
  SunHorizon,
  UsersThree,
  Wine,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { eventModes, type EventMode } from "../types/event";

type EventModeSelectorProps = {
  activeMode: EventMode;
  onModeChange: (mode: EventMode) => void;
};

export function EventModeSelector({
  activeMode,
  onModeChange,
}: EventModeSelectorProps) {
  const t = useTranslations("event");

  const modeConfigs: Record<
    EventMode,
    {
      labelKey: "silent" | "soft" | "social" | "party" | "after";
      descKey:
        "silentDesc" | "softDesc" | "socialDesc" | "partyDesc" | "afterDesc";
      icon: typeof SpeakerSimpleSlash;
    }
  > = {
    silent: {
      labelKey: "silent",
      descKey: "silentDesc",
      icon: SpeakerSimpleSlash,
    },
    soft: {
      labelKey: "soft",
      descKey: "softDesc",
      icon: Wine,
    },
    social: {
      labelKey: "social",
      descKey: "socialDesc",
      icon: UsersThree,
    },
    party: {
      labelKey: "party",
      descKey: "partyDesc",
      icon: Confetti,
    },
    after: {
      labelKey: "after",
      descKey: "afterDesc",
      icon: SunHorizon,
    },
  };

  const handleSelect = (mode: EventMode) => {
    if (mode === activeMode) return;
    onModeChange(mode);

    const label = t(`modes.${modeConfigs[mode].labelKey}`);

    toast.success(t("modes.modeChanged", { mode: label }));
  };

  return (
    <section className="event-mode-bar" aria-labelledby="event-mode-title">
      <div className="event-mode-bar__header">
        <h2 id="event-mode-title" className="event-mode-bar__title">
          <FadersHorizontal size={16} aria-hidden="true" />
          <span>{t("modes.title")}</span>
        </h2>
        <span className="event-mode-bar__indicator">
          {t("modes.activeNotice")}:{" "}
          <strong className="text-primary font-semibold">
            {t(`modes.${modeConfigs[activeMode].labelKey}`)}
          </strong>
        </span>
      </div>

      <div
        className="event-mode-bar__pills"
        role="radiogroup"
        aria-label={t("modes.title")}
      >
        {eventModes.map((mode) => {
          const config = modeConfigs[mode];
          const Icon = config.icon;
          const isActive = mode === activeMode;

          return (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => handleSelect(mode)}
              className={`event-mode-bar__btn ${
                isActive ? "event-mode-bar__btn--active" : ""
              }`}
            >
              <span className="event-mode-bar__btn-label">
                <Icon size={16} aria-hidden="true" />
                <span>{t(`modes.${config.labelKey}`)}</span>
              </span>
              <span className="event-mode-bar__btn-sub">
                {t(`modes.${config.descKey}`)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
