"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cn } from "@/lib/utils";

export type TabsVariant = "pill" | "underline" | "subtle";

const TabsVariantContext = React.createContext<{ variant: TabsVariant }>({
  variant: "pill",
});

export const Tabs = TabsPrimitive.Root;

export interface TabsListProps extends TabsPrimitive.List.Props {
  variant?: TabsVariant;
}

export function TabsList({
  className,
  variant = "pill",
  children,
  ...props
}: TabsListProps) {
  return (
    <TabsVariantContext.Provider value={{ variant }}>
      <TabsPrimitive.List
        className={cn(
          "relative flex items-center shrink-0",
          variant === "pill" &&
            "p-1 bg-soft border border-line rounded-xl overflow-x-auto scrollbar-none gap-1",
          variant === "underline" &&
            "border-b border-line gap-1 overflow-x-auto scrollbar-none",
          variant === "subtle" &&
            "p-0.5 bg-muted/40 rounded-lg overflow-x-auto scrollbar-none gap-0.5",
          className,
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.List>
    </TabsVariantContext.Provider>
  );
}

export interface TabsTriggerProps extends TabsPrimitive.Tab.Props {
  variant?: TabsVariant;
}

export function TabsTrigger({
  className,
  variant: propVariant,
  ...props
}: TabsTriggerProps) {
  const context = React.useContext(TabsVariantContext);
  const variant = propVariant || context.variant;

  return (
    <TabsPrimitive.Tab
      className={cn(
        "relative z-1 inline-flex items-center justify-center gap-1.5 font-medium whitespace-nowrap outline-none transition-colors select-none cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-primary/25 disabled:pointer-events-none disabled:opacity-50",
        variant === "pill" &&
          "px-3.5 py-1.5 text-xs sm:text-sm rounded-lg text-muted-foreground hover:text-ink data-[active]:text-ink data-[active]:font-semibold",
        variant === "underline" &&
          "px-4 py-2.5 text-xs sm:text-sm border-b-2 border-transparent text-muted-foreground hover:text-ink data-[active]:text-primary data-[active]:font-semibold",
        variant === "subtle" &&
          "px-2.5 py-1 text-xs rounded-md text-muted-foreground hover:text-ink data-[active]:text-ink data-[active]:font-semibold",
        className,
      )}
      {...props}
    />
  );
}

export interface TabsIndicatorProps extends TabsPrimitive.Indicator.Props {
  variant?: TabsVariant;
}

export function TabsIndicator({
  className,
  variant: propVariant,
  ...props
}: TabsIndicatorProps) {
  const context = React.useContext(TabsVariantContext);
  const variant = propVariant || context.variant;

  return (
    <TabsPrimitive.Indicator
      className={cn(
        "pointer-events-none absolute left-0 w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] transition-[translate,width] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
        variant === "pill" &&
          "top-1 bottom-1 z-0 rounded-lg bg-surface shadow-xs border border-line/50",
        variant === "underline" && "bottom-0 z-10 h-0.5 bg-primary",
        variant === "subtle" &&
          "top-0.5 bottom-0.5 z-0 rounded-md bg-surface shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      className={cn(
        "outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-opacity duration-150 data-[hidden]:hidden",
        className,
      )}
      {...props}
    />
  );
}
