"use client";

import * as React from "react";
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { CaretDown } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({
  className,
  ...props
}: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      className={cn(
        "border border-line rounded-xl overflow-hidden transition-all bg-background data-[open]:bg-surface data-[open]:border-line-hover data-[open]:shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

export function AccordionTrigger({
  className,
  children,
  badge,
  ...props
}: AccordionPrimitive.Trigger.Props & { badge?: React.ReactNode }) {
  return (
    <AccordionPrimitive.Header className="flex m-0 p-0">
      <AccordionPrimitive.Trigger
        className={cn(
          "flex flex-1 items-center justify-between gap-3 p-3.5 sm:p-4 text-xs sm:text-sm font-medium transition-colors hover:text-ink text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">{children}</div>

        <div className="flex items-center gap-2.5 shrink-0 ml-auto">
          {badge}
          <CaretDown
            size={15}
            className="text-muted-foreground/60 transition-transform duration-200 ease-out group-aria-expanded:rotate-180 shrink-0"
            aria-hidden="true"
          />
        </div>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionPanel({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      className={cn(
        "overflow-hidden text-xs sm:text-sm transition-all border-t border-line/60 bg-surface/50",
        className,
      )}
      {...props}
    >
      <div className="p-3.5 sm:p-4 pt-3">{children}</div>
    </AccordionPrimitive.Panel>
  );
}
