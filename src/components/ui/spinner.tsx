"use client";

import * as React from "react";
import { CircleNotch } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 28,
};

function Spinner({ size = "md", className }: SpinnerProps) {
  const pixelSize = sizeMap[size];

  return (
    <CircleNotch
      size={pixelSize}
      className={cn("animate-spin text-current", className)}
      aria-hidden="true"
    />
  );
}

export { Spinner };
