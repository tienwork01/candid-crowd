"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";

export type CameraPermissionState =
  "idle" | "requesting" | "granted" | "denied" | "unavailable" | "error";

export type CameraFacingMode = "user" | "environment";

export function useCameraStream(isActive: boolean) {
  const [permissionState, setPermissionState] =
    useState<CameraPermissionState>("idle");
  // Candid Camera is optimized for group selfies; guests can switch to rear camera.
  const [facingMode, setFacingMode] = useState<CameraFacingMode>("user");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeStreamRef = useRef<MediaStream | null>(null);

  const stopTracks = useCallback(() => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      activeStreamRef.current = null;
    }

    setStream(null);
  }, []);

  const requestCamera = useCallback(
    async (modeToRequest: CameraFacingMode = facingMode) => {
      if (typeof window === "undefined") return;

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionState("unavailable");
        setErrorMessage("navigator.mediaDevices.getUserMedia not supported");

        return;
      }

      // Stop previous tracks before opening a new stream
      stopTracks();

      setPermissionState("requesting");
      setErrorMessage(null);

      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: modeToRequest },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        activeStreamRef.current = newStream;
        setStream(newStream);
        setPermissionState("granted");
        trackEvent("guest_camera_permission_granted", {
          facing_mode: modeToRequest,
        });
      } catch (err: unknown) {
        const error = err as Error;
        const errorName = error.name || "";

        if (
          errorName === "NotAllowedError" ||
          errorName === "PermissionDeniedError"
        ) {
          setPermissionState("denied");
          trackEvent("guest_camera_permission_denied", {
            reason: "not_allowed",
          });
        } else if (
          errorName === "NotFoundError" ||
          errorName === "DevicesNotFoundError" ||
          errorName === "OverconstrainedError"
        ) {
          // Attempt fallback to any video camera without facingMode constraint
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });

            activeStreamRef.current = fallbackStream;
            setStream(fallbackStream);
            setPermissionState("granted");
            trackEvent("guest_camera_permission_granted", {
              facing_mode: "fallback",
            });

            return;
          } catch {
            setPermissionState("unavailable");
            trackEvent("guest_camera_permission_denied", {
              reason: "not_found",
            });
          }
        } else {
          setPermissionState("error");
          trackEvent("guest_camera_permission_denied", {
            reason: errorName || "unknown",
          });
        }

        setErrorMessage(error.message || "Failed to initialize camera");
      }
    },
    [facingMode, stopTracks],
  );

  const flipFacingMode = useCallback(() => {
    const nextMode: CameraFacingMode =
      facingMode === "environment" ? "user" : "environment";

    setFacingMode(nextMode);

    if (permissionState === "granted" || permissionState === "idle") {
      requestCamera(nextMode);
    }
  }, [facingMode, permissionState, requestCamera]);

  // When isActive turns true, initiate camera asynchronously
  useEffect(() => {
    if (!isActive) {
      return;
    }

    let isCancelled = false;

    const timer = setTimeout(() => {
      if (!isCancelled) {
        void requestCamera(facingMode);
      }
    }, 0);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      stopTracks();
    };
  }, [isActive, requestCamera, stopTracks, facingMode]);

  return {
    stream,
    permissionState,
    facingMode,
    errorMessage,
    requestCamera,
    stopTracks,
    flipFacingMode,
  };
}
