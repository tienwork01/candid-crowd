"use client";

import {
  CaretLeft,
  CaretRight,
  EyeSlash,
  Megaphone,
  Pause,
  Play,
  Presentation,
  QrCode,
  Timer,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import type { EventMode } from "../types/event";
import { EventModeSelector } from "./event-mode-selector";
import { Button } from "@/components/ui";

type EventEngageViewProps = {
  activeMode: EventMode;
  onModeChange: (mode: EventMode) => Promise<void>;
  isChangingMode: boolean;
  onLaunchLiveWall: () => void;
  isLaunchingLiveWall?: boolean;
  isLiveWallActive?: boolean;
  onEndLiveWall?: () => void;
  isEndingLiveWall?: boolean;
  isLiveWallPlaying?: boolean;
  onLiveWallCommand?: (
    command:
      | "play"
      | "pause"
      | "next"
      | "previous"
      | "show_cta"
      | "hide_cta"
      | "blackout"
      | "resume",
  ) => void;
  isControllingLiveWall?: boolean;
  isLiveWallShowingCTA?: boolean;
  eligibleMediaCount?: number;
  liveWallCTAEveryMedia?: number;
  onLiveWallCTAEveryMediaChange?: (every: number) => void;
  isUpdatingLiveWallCadence?: boolean;
  liveWallContentPolicy?: "featured_only" | "auto_approved";
  onLiveWallContentPolicyChange?: (
    policy: "featured_only" | "auto_approved",
  ) => void;
  isUpdatingLiveWallPolicy?: boolean;
  liveWallLayoutMode?: "spotlight" | "mosaic" | "featured";
  liveWallSlideDuration?: number;
  liveWallQRStrategy?: "interval" | "always" | "empty_only" | "hidden";
  liveWallArrivalBehavior?: "queue" | "next";
  onLiveWallPresentationChange?: (patch: {
    layout_mode?: "spotlight" | "mosaic" | "featured";
    slide_duration_seconds?: number;
    qr_strategy?: "interval" | "always" | "empty_only" | "hidden";
    arrival_behavior?: "queue" | "next";
  }) => void;
};

export function EventEngageView({
  activeMode,
  onModeChange,
  isChangingMode,
  onLaunchLiveWall,
  isLaunchingLiveWall = false,
  isLiveWallActive = false,
  onEndLiveWall,
  isEndingLiveWall = false,
  isLiveWallPlaying = true,
  onLiveWallCommand,
  isControllingLiveWall = false,
  isLiveWallShowingCTA = false,
  eligibleMediaCount = 0,
  liveWallCTAEveryMedia = 8,
  onLiveWallCTAEveryMediaChange,
  isUpdatingLiveWallCadence = false,
  liveWallContentPolicy = "featured_only",
  onLiveWallContentPolicyChange,
  isUpdatingLiveWallPolicy = false,
  liveWallLayoutMode = "spotlight",
  liveWallSlideDuration = 5,
  liveWallQRStrategy = "interval",
  liveWallArrivalBehavior = "queue",
  onLiveWallPresentationChange,
}: EventEngageViewProps) {
  const t = useTranslations("event");
  const cadenceOptions = [
    { every: 5, label: t("liveWall.cadence5") },
    { every: 8, label: t("liveWall.cadence8") },
    { every: 12, label: t("liveWall.cadence12") },
  ];
  const qrStrategyOptions = [
    { strategy: "interval" as const, label: t("liveWall.qrInterval") },
    { strategy: "always" as const, label: t("liveWall.qrAlways") },
    { strategy: "empty_only" as const, label: t("liveWall.qrEmptyOnly") },
    { strategy: "hidden" as const, label: t("liveWall.qrHidden") },
  ];
  const arrivalOptions = [
    { behavior: "queue" as const, label: t("liveWall.arrivalQueue") },
    { behavior: "next" as const, label: t("liveWall.arrivalNext") },
  ];
  const slideDurationOptions = [
    { seconds: 5, label: t("liveWall.slide5") },
    { seconds: 8, label: t("liveWall.slide8") },
    { seconds: 12, label: t("liveWall.slide12") },
  ];

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
      <EventModeSelector
        activeMode={activeMode}
        onModeChange={onModeChange}
        isChanging={isChangingMode}
      />

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
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={onLaunchLiveWall}
            disabled={isLaunchingLiveWall}
            className="inline-flex items-center gap-1.5"
          >
            <Presentation size={16} aria-hidden="true" />
            <span>{t("hub.liveWallBtn")}</span>
          </Button>
          {isLiveWallActive && onEndLiveWall && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onEndLiveWall}
              disabled={isEndingLiveWall}
            >
              {t("liveWall.exit")}
            </Button>
          )}
        </div>
        {isLiveWallActive && onLiveWallCommand && (
          <>
            <div
              className="event-engage__operator-status"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <p className="event-engage__operator-title">
                {t("liveWall.operatorTitle")}
              </p>
              <dl className="event-engage__operator-metrics">
                <div className="event-engage__operator-metric">
                  <dt>{t("liveWall.operatorState")}</dt>
                  <dd data-active={isLiveWallPlaying || undefined}>
                    <span aria-hidden="true" />
                    {isLiveWallPlaying
                      ? t("liveWall.operatorOnAir")
                      : t("liveWall.operatorPaused")}
                  </dd>
                </div>
                <div className="event-engage__operator-metric">
                  <dt>{t("liveWall.operatorScreen")}</dt>
                  <dd>
                    {isLiveWallShowingCTA
                      ? t("liveWall.operatorQr")
                      : t("liveWall.operatorSlideshow")}
                  </dd>
                </div>
                <div className="event-engage__operator-metric">
                  <dt>{t("liveWall.operatorEligible")}</dt>
                  <dd>{eligibleMediaCount}</dd>
                </div>
              </dl>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                aria-label={t("liveWall.previous")}
                title={t("liveWall.previous")}
                onClick={() => onLiveWallCommand("previous")}
                disabled={isControllingLiveWall}
              >
                <CaretLeft />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                aria-label={
                  isLiveWallPlaying ? t("liveWall.pause") : t("liveWall.play")
                }
                title={
                  isLiveWallPlaying ? t("liveWall.pause") : t("liveWall.play")
                }
                aria-pressed={isLiveWallPlaying}
                onClick={() =>
                  onLiveWallCommand(isLiveWallPlaying ? "pause" : "play")
                }
                disabled={isControllingLiveWall}
              >
                {isLiveWallPlaying ? <Pause /> : <Play />}
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                aria-label={t("liveWall.next")}
                title={t("liveWall.next")}
                onClick={() => onLiveWallCommand("next")}
                disabled={isControllingLiveWall}
              >
                <CaretRight />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                aria-label={
                  isLiveWallShowingCTA
                    ? t("liveWall.hideCta")
                    : t("liveWall.showCta")
                }
                title={
                  isLiveWallShowingCTA
                    ? t("liveWall.hideCta")
                    : t("liveWall.showCta")
                }
                aria-pressed={isLiveWallShowingCTA}
                onClick={() =>
                  onLiveWallCommand(
                    isLiveWallShowingCTA ? "hide_cta" : "show_cta",
                  )
                }
                disabled={isControllingLiveWall}
              >
                <QrCode />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                aria-label={t("liveWall.blackout")}
                title={t("liveWall.blackout")}
                onClick={() => onLiveWallCommand("blackout")}
                disabled={isControllingLiveWall}
              >
                <EyeSlash />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onLiveWallCommand("resume")}
                disabled={isControllingLiveWall}
              >
                {t("liveWall.resume")}
              </Button>
            </div>
          </>
        )}
        {isLiveWallActive && onLiveWallContentPolicyChange && (
          <div className="event-engage__presentation-settings">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {t("liveWall.contentPolicy")}
              </span>
              <Button
                type="button"
                size="sm"
                variant={
                  liveWallContentPolicy === "featured_only"
                    ? "default"
                    : "outline"
                }
                aria-pressed={liveWallContentPolicy === "featured_only"}
                onClick={() => onLiveWallContentPolicyChange("featured_only")}
                disabled={isUpdatingLiveWallPolicy}
              >
                {t("liveWall.featuredOnly")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={
                  liveWallContentPolicy === "auto_approved"
                    ? "default"
                    : "outline"
                }
                aria-pressed={liveWallContentPolicy === "auto_approved"}
                onClick={() => onLiveWallContentPolicyChange("auto_approved")}
                disabled={isUpdatingLiveWallPolicy}
              >
                {t("liveWall.autoApproved")}
              </Button>
            </div>
            {onLiveWallCTAEveryMediaChange && (
              <div
                className="flex flex-wrap items-center gap-2"
                role="group"
                aria-label={t("liveWall.cadence")}
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {t("liveWall.cadence")}
                </span>
                {cadenceOptions.map(({ every, label }) => (
                  <Button
                    key={every}
                    type="button"
                    size="sm"
                    variant={
                      liveWallCTAEveryMedia === every ? "default" : "outline"
                    }
                    aria-pressed={liveWallCTAEveryMedia === every}
                    onClick={() => onLiveWallCTAEveryMediaChange(every)}
                    disabled={isUpdatingLiveWallCadence}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            )}
            {onLiveWallPresentationChange && (
              <>
                <div
                  className="flex flex-wrap items-center gap-2"
                  role="group"
                  aria-label={t("liveWall.layout")}
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("liveWall.layout")}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      liveWallLayoutMode === "spotlight" ? "default" : "outline"
                    }
                    aria-pressed={liveWallLayoutMode === "spotlight"}
                    onClick={() =>
                      onLiveWallPresentationChange({ layout_mode: "spotlight" })
                    }
                    disabled={isControllingLiveWall}
                  >
                    {t("liveWall.operatorSlideshow")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      liveWallLayoutMode === "mosaic" ? "default" : "outline"
                    }
                    aria-pressed={liveWallLayoutMode === "mosaic"}
                    onClick={() =>
                      onLiveWallPresentationChange({ layout_mode: "mosaic" })
                    }
                    disabled={isControllingLiveWall}
                  >
                    {t("gallery.layoutGrid")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      liveWallLayoutMode === "featured" ? "default" : "outline"
                    }
                    aria-pressed={liveWallLayoutMode === "featured"}
                    onClick={() =>
                      onLiveWallPresentationChange({ layout_mode: "featured" })
                    }
                    disabled={isControllingLiveWall}
                  >
                    {t("liveWall.featuredOnly")}
                  </Button>
                </div>
                <div
                  className="flex flex-wrap items-center gap-2"
                  role="group"
                  aria-label={t("liveWall.slideDuration")}
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("liveWall.slideDuration")}
                  </span>
                  {slideDurationOptions.map(({ seconds, label }) => (
                    <Button
                      key={seconds}
                      type="button"
                      size="sm"
                      variant={
                        liveWallSlideDuration === seconds
                          ? "default"
                          : "outline"
                      }
                      aria-pressed={liveWallSlideDuration === seconds}
                      onClick={() =>
                        onLiveWallPresentationChange({
                          slide_duration_seconds: seconds,
                        })
                      }
                      disabled={isControllingLiveWall}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                <div
                  className="flex flex-wrap items-center gap-2"
                  role="group"
                  aria-label={t("liveWall.qrStrategy")}
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("liveWall.qrStrategy")}
                  </span>
                  {qrStrategyOptions.map(({ strategy, label }) => (
                    <Button
                      key={strategy}
                      type="button"
                      size="sm"
                      variant={
                        liveWallQRStrategy === strategy ? "default" : "outline"
                      }
                      aria-pressed={liveWallQRStrategy === strategy}
                      onClick={() =>
                        onLiveWallPresentationChange({ qr_strategy: strategy })
                      }
                      disabled={isControllingLiveWall}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                <div
                  className="flex flex-wrap items-center gap-2"
                  role="group"
                  aria-label={t("liveWall.arrivalBehavior")}
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("liveWall.arrivalBehavior")}
                  </span>
                  {arrivalOptions.map(({ behavior, label }) => (
                    <Button
                      key={behavior}
                      type="button"
                      size="sm"
                      variant={
                        liveWallArrivalBehavior === behavior
                          ? "default"
                          : "outline"
                      }
                      aria-pressed={liveWallArrivalBehavior === behavior}
                      onClick={() =>
                        onLiveWallPresentationChange({
                          arrival_behavior: behavior,
                        })
                      }
                      disabled={isControllingLiveWall}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
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
