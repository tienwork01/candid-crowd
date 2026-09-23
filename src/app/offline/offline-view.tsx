"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  WifiSlash,
  WifiHigh,
  ArrowClockwise,
  CircleNotch,
  House,
  WarningCircle,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import "./offline.css";

type RetryState = "idle" | "checking" | "failed" | "restored";

export function OfflineView() {
  const [retryState, setRetryState] = useState<RetryState>("idle");
  const t = useTranslations("pwa.offlinePage");

  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return false;
    }

    try {
      // Lightweight cache-busted ping to verify active Internet connectivity
      const response = await fetch(`/icon.svg?_t=${Date.now()}`, {
        method: "HEAD",
        cache: "no-store",
      });

      return response.ok;
    } catch {
      return false;
    }
  }, []);

  const handleRetry = async () => {
    if (retryState === "checking" || retryState === "restored") return;

    setRetryState("checking");

    const isConnected = await checkConnectivity();

    if (isConnected) {
      setRetryState("restored");
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }, 600);
    } else {
      setRetryState("failed");
      setTimeout(() => {
        setRetryState("idle");
      }, 2500);
    }
  };

  // Smart Auto-Recovery: detect when network restores in background
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setRetryState("restored");
      setTimeout(() => {
        window.location.reload();
      }, 800);
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const isChecking = retryState === "checking";
  const isFailed = retryState === "failed";
  const isRestored = retryState === "restored";

  return (
    <main className="offline-page" role="main">
      <div className="offline-page__inner">
        {/* Visual Artifact: Editorial Offline Polaroid Frame */}
        <div className="offline-page__visual" aria-hidden="true">
          <div
            className={`offline-page__polaroid ${
              isRestored ? "offline-page__polaroid--restored" : ""
            }`}
          >
            <div className="offline-page__polaroid-frame">
              {isRestored ? (
                <WifiHigh
                  size={36}
                  weight="duotone"
                  className="offline-page__polaroid-icon offline-page__polaroid-icon--online"
                />
              ) : (
                <WifiSlash
                  size={36}
                  weight="duotone"
                  className="offline-page__polaroid-icon"
                />
              )}
              <span className="offline-page__polaroid-code">
                {isRestored ? "CONNECTED" : "OFFLINE"}
              </span>
            </div>
            <span className="offline-page__polaroid-caption">
              {isRestored ? t("restored") : t("polaroidCaption")}
            </span>
          </div>
        </div>

        {/* Content Block */}
        <div className="offline-page__content">
          <div
            className={`offline-page__badge ${
              isRestored
                ? "offline-page__badge--online"
                : isFailed
                  ? "offline-page__badge--failed"
                  : ""
            }`}
            role="status"
            aria-live="polite"
          >
            <span
              className={`offline-page__dot ${
                isRestored
                  ? "offline-page__dot--online"
                  : isFailed
                    ? "offline-page__dot--failed"
                    : "offline-page__dot--pulsing"
              }`}
              aria-hidden="true"
            />
            <span>
              {isRestored
                ? t("restored")
                : isFailed
                  ? t("stillOffline")
                  : isChecking
                    ? t("checking")
                    : t("badge")}
            </span>
          </div>

          <h1 className="offline-page__title">{t("title")}</h1>
          <p className="offline-page__lead">{t("description")}</p>

          {/* Primary & Secondary Actions */}
          <div className="offline-page__actions">
            <button
              type="button"
              onClick={handleRetry}
              disabled={isChecking || isRestored}
              className={`offline-page__btn offline-page__btn--primary ${
                isRestored ? "offline-page__btn--success" : ""
              }`}
              aria-label={t("retry")}
            >
              {isChecking ? (
                <>
                  <CircleNotch
                    size={18}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                  <span>{t("checking")}</span>
                </>
              ) : isRestored ? (
                <>
                  <WifiHigh size={18} weight="bold" aria-hidden="true" />
                  <span>{t("restored")}</span>
                </>
              ) : isFailed ? (
                <>
                  <WarningCircle size={18} weight="bold" aria-hidden="true" />
                  <span>{t("stillOffline")}</span>
                </>
              ) : (
                <>
                  <ArrowClockwise size={18} weight="bold" aria-hidden="true" />
                  <span>{t("retry")}</span>
                </>
              )}
            </button>

            <Link
              href="/"
              className="offline-page__btn offline-page__btn--secondary"
            >
              <House size={18} aria-hidden="true" />
              <span>{t("backHome")}</span>
            </Link>
          </div>
        </div>
      </div>

      <footer className="offline-page__footer">
        <span>
          © {new Date().getFullYear()} CandidCrowd · Resilient Event Sharing
        </span>
      </footer>
    </main>
  );
}
