"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type CheckboxProps = Omit<
  React.ComponentProps<typeof CheckboxPrimitive.Root>,
  "onCheckedChange"
> & {
  onCheckedChange?: (checked: boolean) => void;
};

function Checkbox({
  className,
  checked,
  onCheckedChange,
  ...props
}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer h-4.5 w-4.5 shrink-0 rounded border border-input transition-all outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-on-primary flex items-center justify-center cursor-pointer bg-surface-raised",
        className,
      )}
      checked={checked}
      onCheckedChange={(val) => onCheckedChange?.(Boolean(val))}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-primary">
        <Check size={12} weight="bold" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
