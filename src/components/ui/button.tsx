"use client";

// shadcn/ui Base UI button, adapted to CandidCrowd's colors and 44px targets.
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground hover:bg-primary-hover",
        outline: "border-border bg-card text-foreground hover:bg-secondary",
        ghost:
          "border-transparent bg-transparent text-foreground hover:bg-secondary",
      },
      size: {
        default: "h-12 min-h-12 px-5 py-3 text-sm",
        sm: "h-9 min-h-9 px-3.5 py-1.5 text-xs",
        lg: "h-14 min-h-14 px-6 py-3.5 text-base",
        icon: "size-12 p-3",
        "icon-sm": "size-9 p-2",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
