"use client";

import { LazyMotion, MotionConfig } from "motion/react";

const loadFeatures = () =>
  import("./motion-features").then((module) => module.default);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig
        reducedMotion={process.env.NODE_ENV === "production" ? "user" : "never"}
        transition={{ duration: 0.3 }}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
