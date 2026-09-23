"use client";

import { useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "candidcrowd_pwa_dismissed_until";

function checkStandalone(): boolean {
  if (typeof window === "undefined") return false;

  const standaloneMedia = window.matchMedia(
    "(display-mode: standalone)",
  ).matches;
  const navigatorStandalone =
    (window.navigator as unknown as { standalone?: boolean }).standalone ===
    true;

  return standaloneMedia || navigatorStandalone;
}

function checkIsIOS(standalone: boolean): boolean {
  if (typeof window === "undefined") return false;

  const userAgent = window.navigator.userAgent || "";
  const isIOSDevice =
    /iPhone|iPad|iPod/.test(userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;

  return isIOSDevice && !standalone;
}

function checkIsDismissed(): boolean {
  if (typeof window === "undefined") return true;

  try {
    const dismissedUntil = localStorage.getItem(DISMISSED_KEY);

    return Boolean(dismissedUntil && Number(dismissedUntil) > Date.now());
  } catch {
    return false;
  }
}

export type InstallPromptState = {
  canInstall: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  isDismissed: boolean;
  promptInstall: () => Promise<boolean>;
  dismissPrompt: (days?: number) => void;
};

export function useInstallPrompt(): InstallPromptState {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(checkStandalone);
  const [isIOS] = useState<boolean>(() => checkIsIOS(checkStandalone()));
  const [isDismissed, setIsDismissed] = useState<boolean>(checkIsDismissed);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();

      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        setDeferredPrompt(null);

        return true;
      }

      return false;
    } catch {
      return false;
    }
  }, [deferredPrompt]);

  const dismissPrompt = useCallback((days = 14) => {
    setIsDismissed(true);

    try {
      const expiry = Date.now() + days * 24 * 60 * 60 * 1000;

      localStorage.setItem(DISMISSED_KEY, expiry.toString());
    } catch {
      // Ignore storage errors
    }
  }, []);

  const canInstall = !isStandalone && (Boolean(deferredPrompt) || isIOS);

  return {
    canInstall,
    isStandalone,
    isIOS,
    isDismissed,
    promptInstall,
    dismissPrompt,
  };
}
