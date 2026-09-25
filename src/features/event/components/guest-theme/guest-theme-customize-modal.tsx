"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowCounterClockwise,
  Check,
  DeviceMobile,
  Eye,
  PaintBrush,
  X,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  Button,
  Tabs,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import type { CandidEvent } from "../../types/event";
import {
  DEFAULT_GUEST_THEME_CONFIG,
  GUEST_THEME_PRESETS,
  type GuestThemeConfig,
} from "./guest-theme-types";
import {
  loadGuestThemeConfig,
  saveGuestThemeConfig,
  generateDefaultMonogram,
} from "../../lib/guest-theme-storage";
import { GuestPhoneMockup } from "./guest-phone-mockup";
import { GuestThemePresetsTab } from "./guest-theme-presets-tab";
import { GuestThemeBrandingTab } from "./guest-theme-branding-tab";
import { GuestThemeContentTab } from "./guest-theme-content-tab";
import { GuestThemeExperienceTab } from "./guest-theme-experience-tab";

interface GuestThemeCustomizeModalProps {
  event: CandidEvent;
  isOpen: boolean;
  onClose: () => void;
  onApplied?: (config: GuestThemeConfig) => void;
}

type TabType = "presets" | "branding" | "content" | "experience";

export function GuestThemeCustomizeModal({
  event,
  isOpen,
  onClose,
  onApplied,
}: GuestThemeCustomizeModalProps) {
  const t = useTranslations("event");
  const tCommon = useTranslations("common");
  const [activeTab, setActiveTab] = useState<TabType>("presets");
  const [mobileView, setMobileView] = useState<"controls" | "preview">(
    "controls",
  );

  const [config, setConfig] = useState<GuestThemeConfig>(() => {
    const loaded = loadGuestThemeConfig(event.id);

    if (loaded) {
      return {
        ...loaded,
        monogram: loaded.monogram || generateDefaultMonogram(event.name),
      };
    }

    return {
      ...DEFAULT_GUEST_THEME_CONFIG,
      monogram: generateDefaultMonogram(event.name),
    };
  });

  // Keyboard close listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleUpdate = (updated: Partial<GuestThemeConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleResetToPreset = () => {
    const currentPreset =
      GUEST_THEME_PRESETS.find((p) => p.id === config.presetId) ||
      GUEST_THEME_PRESETS[0];

    setConfig({
      ...DEFAULT_GUEST_THEME_CONFIG,
      presetId: currentPreset.id,
      primaryColor: currentPreset.primaryColor,
      bgColor: currentPreset.bgColor,
      surfaceColor: currentPreset.surfaceColor,
      fontHeading: currentPreset.fontHeading,
      fontBody: currentPreset.fontBody,
      heroStyle: currentPreset.heroStyle,
      galleryLayout: currentPreset.galleryLayout,
      cameraFrame: currentPreset.cameraFrame,
      monogram: generateDefaultMonogram(event.name),
    });

    toast.success(t("guestTheme.resetSuccess"));
  };

  const handleApply = () => {
    saveGuestThemeConfig(event.id, config);
    onApplied?.(config);
    toast.success(t("guestTheme.saveSuccess"));
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-theme-customizer-title"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl bg-surface border border-line rounded-3xl shadow-raised overflow-hidden my-auto flex flex-col max-h-[94vh]"
        style={{ backgroundColor: "var(--surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-line shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <PaintBrush size={18} weight="bold" />
            </div>
            <div>
              <h2
                id="guest-theme-customizer-title"
                className="text-base sm:text-lg font-heading font-semibold text-ink flex items-center gap-2"
              >
                <span>{t("guestTheme.modalTitle")}</span>
                <span className="text-[11px] font-sans font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {t("guestTheme.studioBadge")}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {t("guestTheme.modalSubtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile View Toggle (Controls vs Phone Preview) */}
            <Tabs
              value={mobileView}
              onValueChange={(val) =>
                setMobileView(val as "controls" | "preview")
              }
              className="lg:hidden"
            >
              <TabsList className="relative flex items-center bg-soft p-1 rounded-xl border border-line text-xs">
                <TabsTrigger
                  value="controls"
                  className="relative z-1 px-2.5 py-1 rounded-lg font-medium text-muted-foreground data-[active]:text-ink data-[active]:font-semibold"
                >
                  {t("guestTheme.settingsTab")}
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="relative z-1 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 text-muted-foreground data-[active]:text-ink data-[active]:font-semibold"
                >
                  <Eye size={12} />
                  <span>{t("guestTheme.previewTab")}</span>
                </TabsTrigger>
                <TabsIndicator className="absolute top-1 bottom-1 rounded-lg bg-surface shadow-xs border border-line/40 pointer-events-none transition-[translate,width] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none" />
              </TabsList>
            </Tabs>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-ink hover:bg-soft transition-colors"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Main Content: Split Studio */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          {/* Left Column: Studio Controls & Tabs (7 cols on Desktop) */}
          <div
            className={`lg:col-span-7 flex flex-col min-h-0 border-r border-line/60 ${
              mobileView === "preview" ? "hidden lg:flex" : "flex"
            }`}
          >
            {/* Tab Navigation Strip */}
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as TabType)}
              className="w-full shrink-0"
            >
              <TabsList
                variant="underline"
                className="relative flex items-center gap-1 px-5 pt-2 border-b border-line shrink-0 overflow-x-auto"
              >
                <TabsTrigger
                  value="presets"
                  variant="underline"
                  className="px-3.5 py-2 text-xs font-semibold"
                >
                  {t("guestTheme.tabPresets")}
                </TabsTrigger>
                <TabsTrigger
                  value="branding"
                  variant="underline"
                  className="px-3.5 py-2 text-xs font-semibold"
                >
                  {t("guestTheme.tabBranding")}
                </TabsTrigger>
                <TabsTrigger
                  value="content"
                  variant="underline"
                  className="px-3.5 py-2 text-xs font-semibold"
                >
                  {t("guestTheme.tabContent")}
                </TabsTrigger>
                <TabsTrigger
                  value="experience"
                  variant="underline"
                  className="px-3.5 py-2 text-xs font-semibold"
                >
                  {t("guestTheme.tabExperience")}
                </TabsTrigger>
                <TabsIndicator
                  variant="underline"
                  className="absolute bottom-0 h-0.5 bg-primary pointer-events-none transition-[translate,width] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
                />
              </TabsList>
            </Tabs>

            {/* Scrollable Tab Panel Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {activeTab === "presets" && (
                <div className="guest-theme-modal__panel">
                  <GuestThemePresetsTab
                    config={config}
                    onChange={handleUpdate}
                  />
                </div>
              )}
              {activeTab === "branding" && (
                <div className="guest-theme-modal__panel">
                  <GuestThemeBrandingTab
                    event={event}
                    config={config}
                    onChange={handleUpdate}
                  />
                </div>
              )}
              {activeTab === "content" && (
                <div className="guest-theme-modal__panel">
                  <GuestThemeContentTab
                    config={config}
                    onChange={handleUpdate}
                  />
                </div>
              )}
              {activeTab === "experience" && (
                <div className="guest-theme-modal__panel">
                  <GuestThemeExperienceTab
                    config={config}
                    onChange={handleUpdate}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Interactive Phone Device Preview (5 cols on Desktop) */}
          <div
            className={`lg:col-span-5 bg-muted/20 p-4 sm:p-6 flex flex-col items-center justify-center overflow-y-auto ${
              mobileView === "controls" ? "hidden lg:flex" : "flex"
            }`}
          >
            <div className="w-full max-w-sm flex flex-col items-center">
              <div className="flex items-center gap-2 mb-3 text-xs font-medium text-muted-foreground">
                <DeviceMobile size={15} />
                <span>{t("guestTheme.livePreviewTitle")}</span>
              </div>

              {/* Realistic Phone Device Mockup */}
              <GuestPhoneMockup event={event} config={config} />
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions Footer */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-line shrink-0 bg-surface/50">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetToPreset}
            className="text-xs text-muted-foreground hover:text-ink gap-1.5"
          >
            <ArrowCounterClockwise size={13} />
            <span className="hidden sm:inline">
              {t("guestTheme.resetDefaults")}
            </span>
            <span className="sm:hidden">{t("guestTheme.resetShort")}</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              {tCommon("actions.cancel")}
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleApply}
              className="text-xs font-semibold gap-1.5 shadow-xs"
            >
              <Check size={14} weight="bold" />
              <span>{t("guestTheme.saveApply")}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
