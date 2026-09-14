"use client";

import { useEffect, useRef } from "react";
import type { HeroRenderer } from "./hero-three-renderer";
import "./hero-three.css";

export function HeroThree({
  progress,
  active,
  onReady,
}: {
  progress: number;
  active: boolean;
  onReady: (ready: boolean) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const renderer = useRef<HeroRenderer | null>(null);
  const latest = useRef({ progress, active });
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
    function initialize() {
      const current = ++generation;
      clearTimeout(timer);
      stop();
      if (
        media.matches ||
        device.connection?.saveData ||
        (device.deviceMemory && device.deviceMemory <= 2) ||
        navigator.hardwareConcurrency <= 2
      )
        return;
      timer = setTimeout(async () => {
        try {
          const { createHeroRenderer } = await import("./hero-three-renderer");
          if (abort.signal.aborted || media.matches || current !== generation)
            return;
          const instance = await createHeroRenderer(
            element,
            abort.signal,
            stop,
          );
          if (abort.signal.aborted || media.matches || current !== generation) {
            instance.dispose();
            return;
          }
          renderer.current = instance;
          instance.update(latest.current.progress / 100, latest.current.active);
          onReady(true);
        } catch {
          if (!abort.signal.aborted) stop();
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
  }, [onReady]);
  useEffect(() => {
    latest.current = { progress, active };
    renderer.current?.update(progress / 100, active);
  }, [progress, active]);
  return <div ref={host} className="hero-three-canvas" aria-hidden="true" />;
}
