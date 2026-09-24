"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  WifiSlash,
  WifiHigh,
  ArrowClockwise,
  CircleNotch,
  House,
  WarningCircle,
  ArrowLeft,
  Images,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { getPendingUploads, type PendingUploadItem } from "@/features/pwa/lib";
import "./offline.css";

type RetryState = "idle" | "checking" | "failed" | "restored";

export function OfflineView() {
  const router = useRouter();
  const [retryState, setRetryState] = useState<RetryState>("idle");
  const [pendingUploads, setPendingUploads] = useState<PendingUploadItem[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const t = useTranslations("pwa.offlinePage");

  // Load and preview offline pending uploads from IndexedDB
  useEffect(() => {
    let isMounted = true;
    let createdUrls: string[] = [];

    getPendingUploads().then((items) => {
      if (!isMounted) return;

      setPendingUploads(items);

      const urls: string[] = [];

      for (const item of items.slice(0, 4)) {
        if (item.fileBlob && item.mimeType?.startsWith("image/")) {
          try {
            urls.push(URL.createObjectURL(item.fileBlob));
          } catch {
            // Ignore object URL creation errors
          }
        }
      }

      createdUrls = urls;
      setPreviewUrls(urls);
    });

    return () => {
      isMounted = false;
      createdUrls.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // Ignore revocation errors
        }
      });
    };
  }, []);

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

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      router.push("/");
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
  const pendingCount = pendingUploads.length;

  return (
    <main className="offline-page" role="main">
      <div className="offline-page__inner">
        {/* Visual Artifact: Editorial Polaroid with Washi Tape */}
        <div className="offline-page__visual" aria-hidden="true">
          <div className="offline-page__washi-tape" />
          <div
            className={`offline-page__polaroid ${
              isRestored ? "offline-page__polaroid--restored" : ""
            }`}
          >
            <div className="offline-page__polaroid-frame">
              <div className="offline-page__polaroid-overlay" />
              {isRestored ? (
                <WifiHigh
                  size={38}
                  weight="duotone"
                  className="offline-page__polaroid-icon offline-page__polaroid-icon--online"
                />
              ) : (
                <WifiSlash
                  size={38}
                  weight="duotone"
                  className="offline-page__polaroid-icon"
                />
              )}
              <span className="offline-page__polaroid-code">
                {isRestored ? "CONNECTED // READY" : "OFFLINE // PAUSED"}
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

          {/* Pending Uploads Card (Reassurance Feature) */}
          {pendingCount > 0 && (
            <div
              className="offline-page__queue-card"
              role="region"
              aria-label={t("pendingUploadsBadge")}
            >
              <div className="offline-page__queue-header">
                <div className="offline-page__queue-icon" aria-hidden="true">
                  <Images size={20} weight="duotone" />
                </div>
                <div className="offline-page__queue-meta">
                  <span className="offline-page__queue-title">
                    {t("pendingUploadsCount", { count: pendingCount })}
                  </span>
                  <span className="offline-page__queue-badge">
                    {t("pendingUploadsBadge")}
                  </span>
                </div>
              </div>
              <p className="offline-page__queue-desc">
                {t("pendingUploadsDesc")}
              </p>
              {previewUrls.length > 0 && (
                <div
                  className="offline-page__queue-previews"
                  aria-hidden="true"
                >
                  {previewUrls.map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className="offline-page__queue-thumb"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ))}
                  {pendingCount > previewUrls.length && (
                    <span className="offline-page__queue-more">
                      +{pendingCount - previewUrls.length}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

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

            <button
              type="button"
              onClick={handleGoBack}
              className="offline-page__btn offline-page__btn--secondary"
            >
              <ArrowLeft size={18} weight="bold" aria-hidden="true" />
              <span>{t("goBack")}</span>
            </button>
          </div>

          <Link href="/" className="offline-page__link-home">
            <House size={15} aria-hidden="true" />
            <span>{t("backHome")}</span>
          </Link>
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
