"use client";

import { useEffect, useState, useCallback } from "react";

export type ServiceWorkerStatus = {
  isSupported: boolean;
  isRegistered: boolean;
  updateAvailable: boolean;
  updateServiceWorker: () => void;
};

export function useServiceWorker(): ServiceWorkerStatus {
  const [isSupported] = useState<boolean>(() => {
    return typeof window !== "undefined" && "serviceWorker" in navigator;
  });

  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV === "development"
    ) {
      return;
    }

    const registerWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        setRegistration(reg);
        setIsRegistered(true);

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;

          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setUpdateAvailable(true);
            }
          });
        });
      } catch {
        // Registration failed silently
      }
    };

    registerWorker();

    let refreshing = false;

    const handleControllerChange = () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, []);

  const updateServiceWorker = useCallback(() => {
    if (!registration || !registration.waiting) return;

    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }, [registration]);

  return {
    isSupported,
    isRegistered,
    updateAvailable,
    updateServiceWorker,
  };
}
