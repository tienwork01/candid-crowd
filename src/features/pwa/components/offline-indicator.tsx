"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { WifiSlash, WifiHigh, X } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useNetworkStatus } from "../hooks";
import "./pwa.css";

export function OfflineIndicator() {
  const pathname = usePathname();
  const { isOnline } = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  let title = "You are offline";
  let message =
    "Photos and changes will upload automatically when reconnected.";
  let reconnectedTitle = "Back online";
  let reconnectedText = "Syncing your changes now...";
  let dismissLabel = "Dismiss";

  try {
    const t = useTranslations("pwa.offline");

    title = t("title");
    message = t("message");
    reconnectedTitle = t("reconnectedTitle");
    reconnectedText = t("reconnected");
    dismissLabel = t("dismiss");
  } catch {
    // Graceful fallback when rendered outside NextIntlClientProvider
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timer: NodeJS.Timeout;

    const handleOnline = () => {
      setIsDismissed(false);
      setShowReconnected(true);
      timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
    };

    const handleOffline = () => {
      setIsDismissed(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
  }, []);

  const isVisible =
    (!isOnline || showReconnected) && !isDismissed && pathname !== "/offline";

  if (!isVisible) {
    return null;
  }

  const isOfflineState = !isOnline;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pwa-offline-indicator pwa-offline-indicator--visible ${
        isOfflineState
          ? "pwa-offline-indicator--offline"
          : "pwa-offline-indicator--online"
      }`}
    >
      <div className="pwa-offline-indicator__icon-box" aria-hidden="true">
        {isOfflineState ? (
          <WifiSlash size={18} weight="bold" />
        ) : (
          <WifiHigh size={18} weight="bold" />
        )}
      </div>

      <div className="pwa-offline-indicator__body">
        <span className="pwa-offline-indicator__title">
          {isOfflineState ? title : reconnectedTitle}
        </span>
        <span className="pwa-offline-indicator__desc">
          {isOfflineState ? message : reconnectedText}
        </span>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        className="pwa-offline-indicator__close"
        aria-label={dismissLabel}
      >
        <X size={14} weight="bold" />
      </button>
    </div>
  );
}
