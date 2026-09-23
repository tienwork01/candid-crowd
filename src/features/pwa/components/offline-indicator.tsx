"use client";

import { useEffect, useState } from "react";
import { WifiSlash, WifiHigh } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useNetworkStatus } from "../hooks";
import "./pwa.css";

export function OfflineIndicator() {
  const { isOnline } = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);

  let message =
    "You are currently offline. Photos and changes will upload automatically when reconnected.";
  let reconnectedText = "Back online! Syncing...";

  try {
    const t = useTranslations("pwa");

    message = t("offline.message");
    reconnectedText = t("offline.reconnected");
  } catch {
    // Graceful fallback when rendered outside NextIntlClientProvider
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timer: NodeJS.Timeout;

    const handleOnline = () => {
      setShowReconnected(true);
      timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const isVisible = !isOnline || showReconnected;

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
      <div className="pwa-offline-indicator__icon" aria-hidden="true">
        {isOfflineState ? (
          <WifiSlash size={16} weight="bold" />
        ) : (
          <WifiHigh size={16} weight="bold" />
        )}
      </div>
      <span className="pwa-offline-indicator__text">
        {isOfflineState ? message : reconnectedText}
      </span>
    </div>
  );
}
