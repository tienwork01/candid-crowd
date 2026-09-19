"use client";

import { useEffect, useReducer, useSyncExternalStore } from "react";

type State = {
  phase: "idle" | "uploading" | "success" | "error";
  progress: number;
};
type Action = "start" | "tick" | "reset" | "interrupt";

function reducer(state: State, action: Action): State {
  if (action === "reset") return { phase: "idle", progress: 0 };
  if (action === "start") return { phase: "uploading", progress: 0 };
  if (action === "interrupt") return { ...state, phase: "error" };
  if (state.phase !== "uploading") return state;

  // Realistic non-linear progress curve:
  // 0 -> ~65% quickly, then ~90% more slowly, then 100% on completion.
  let step = 7;

  if (state.progress >= 90) {
    step = 2;
  } else if (state.progress >= 65) {
    step = 3;
  }

  const progress = Math.min(state.progress + step, 100);

  return { progress, phase: progress === 100 ? "success" : "uploading" };
}

function subscribe(callback: () => void) {
  document.addEventListener("visibilitychange", callback);

  return () => document.removeEventListener("visibilitychange", callback);
}

export function useUploadPreview(inView: boolean) {
  const visible = useSyncExternalStore(
    subscribe,
    () => !document.hidden,
    () => true,
  );
  const [state, dispatch] = useReducer(reducer, { phase: "idle", progress: 0 });

  useEffect(() => {
    if (state.phase !== "uploading" || !visible || !inView) return;

    const timer = window.setInterval(() => dispatch("tick"), 50);

    return () => window.clearInterval(timer);
  }, [state.phase, visible, inView]);

  return {
    ...state,
    start: () => dispatch("start"),
    reset: () => dispatch("reset"),
    interrupt: () => dispatch("interrupt"),
  };
}
