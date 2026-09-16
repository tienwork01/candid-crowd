"use client";

import { useEffect, useRef } from "react";
import type { HeroRenderer } from "./hero-three-renderer";
import "./hero-three.css";

export function HeroThree({
  progress,
  active,
  angle,
  onReady,
  onFallback,
}: {
  progress: number;
  active: boolean;
  angle: number;
  onReady: (ready: boolean) => void;
  onFallback: (reason: string | null) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const renderer = useRef<HeroRenderer | null>(null);
  const latest = useRef({ progress, active, angle });

  useEffect(() => {
    const element = host.current!;
    const abort = new AbortController();
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const device = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    let timer: ReturnType<typeof setTimeout>;
    let generation = 0;

    function stop() {
      renderer.current?.dispose();
      renderer.current = null;
      onReady(false);
    }

    function fallback(reason: string) {
      stop();
      onFallback(reason);
    }

    function initialize() {
      const current = ++generation;

      clearTimeout(timer);
      stop();

      if (media.matches) {
        onFallback("reduced-motion");

        return;
      }

      if (device.connection?.saveData) {
        onFallback("save-data");

        return;
      }

      if (device.deviceMemory && device.deviceMemory <= 2) {
        onFallback("low-device-memory");

        return;
      }

      if (navigator.hardwareConcurrency <= 2) {
        onFallback("low-cpu-concurrency");

        return;
      }

      timer = setTimeout(async () => {
        try {
          const { createHeroRenderer } = await import("./hero-three-renderer");

          if (abort.signal.aborted || media.matches || current !== generation)
            return;

          const instance = await createHeroRenderer(element, abort.signal, () =>
            fallback("webgl-context-lost"),
          );

          if (abort.signal.aborted || media.matches || current !== generation) {
            instance.dispose();

            return;
          }

          renderer.current = instance;
          onFallback(null);
          instance.update(
            latest.current.progress / 100,
            latest.current.active,
            latest.current.angle,
          );
          onReady(true);
        } catch (error) {
          if (!abort.signal.aborted) {
            const name = error instanceof Error ? error.name : "UnknownError";

            fallback(`initialization-error:${name}`);
          }
        }
      }, 700);
    }

    initialize();
    media.addEventListener("change", initialize);

    return () => {
      abort.abort();
      clearTimeout(timer);
      media.removeEventListener("change", initialize);
      stop();
    };
  }, [onFallback, onReady]);
  useEffect(() => {
    latest.current = { progress, active, angle };
    renderer.current?.update(progress / 100, active, angle);
  }, [progress, active, angle]);

  return (
    <div
      ref={host}
      className="hero-scene__canvas hero-three-canvas"
      aria-hidden="true"
    />
  );
}
