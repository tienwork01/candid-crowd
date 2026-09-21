"use client";

import { Megaphone, Presentation, Timer } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import type { EventMode } from "../types/event";
import { EventModeSelector } from "./event-mode-selector";
import { Button } from "@/components/ui";

type EventEngageViewProps = {
  activeMode: EventMode;
  onModeChange: (mode: EventMode) => void;
  onLaunchLiveWall: () => void;
};

export function EventEngageView({
  activeMode,
  onModeChange,
  onLaunchLiveWall,
}: EventEngageViewProps) {
  const t = useTranslations("event");

  return (
    <div className="event-engage" aria-labelledby="engage-heading">
      <div className="event-engage__intro">
        <h2 id="engage-heading" className="font-heading text-2xl text-ink">
          {t("engage.heading")}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("engage.description")}
        </p>
      </div>

      {/* Event Mode Selector — moved here from the main overview */}
      <EventModeSelector activeMode={activeMode} onModeChange={onModeChange} />

      {/* Live Wall Section */}
      <div className="event-engage__section">
        <div className="event-engage__section-header">
          <div className="event-engage__section-icon">
            <Presentation size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-heading text-lg text-ink">
              {t("engage.liveWallHeading")}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("engage.liveWallDesc")}
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={onLaunchLiveWall}
          className="inline-flex items-center gap-1.5"
        >
          <Presentation size={16} aria-hidden="true" />
          <span>{t("hub.liveWallBtn")}</span>
        </Button>
      </div>

      {/* Photo Prompts — Coming Soon */}
      <div className="event-engage__section event-engage__section--muted">
        <div className="event-engage__section-header">
          <div className="event-engage__section-icon event-engage__section-icon--muted">
            <Megaphone size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-heading text-lg text-ink">
              {t("engage.promptsHeading")}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("engage.promptsComingSoon")}
            </p>
          </div>
        </div>
      </div>

      {/* Post-Event Collection — Coming Soon */}
      <div className="event-engage__section event-engage__section--muted">
        <div className="event-engage__section-header">
          <div className="event-engage__section-icon event-engage__section-icon--muted">
            <Timer size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-heading text-lg text-ink">
              {t("engage.postEventHeading")}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("engage.postEventComingSoon")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
