"use client";

import { useState } from "react";
import { m, useReducedMotion } from "motion/react";

// Content is visible in SSR/no-JS. Only the small arrival movement is enhanced.
export function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [seen, setSeen] = useState(false);
  const reduced = useReducedMotion();
  return (
    <m.div
      className={className}
      initial={false}
      animate={
        seen && !reduced
          ? { y: [8, 0], opacity: [0.92, 1] }
          : { y: 0, opacity: 1 }
      }
      onViewportEnter={() => setSeen(true)}
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </m.div>
  );
}
