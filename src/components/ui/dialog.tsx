"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

export function DialogContent({
  className,
  children,
  ...props
}: DialogPrimitive.Popup.Props) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-ink/65 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <DialogPrimitive.Popup
        className={cn(
          "cc-dialog fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-card p-7 text-foreground shadow-xl outline-none",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-3 top-3 grid size-11 cursor-pointer place-items-center rounded-full border border-border bg-card"
          aria-label="Close dialog"
        >
          <X size={20} aria-hidden="true" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}
