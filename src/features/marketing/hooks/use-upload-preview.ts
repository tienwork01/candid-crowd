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

  const progress = Math.min(state.progress + 10, 100);

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

    const timer = window.setInterval(() => dispatch("tick"), 220);

    return () => window.clearInterval(timer);
  }, [state.phase, visible, inView]);

  return {
    ...state,
    start: () => dispatch("start"),
    reset: () => dispatch("reset"),
    interrupt: () => dispatch("interrupt"),
  };
}
