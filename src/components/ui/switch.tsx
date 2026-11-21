"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  /** Show a spinner in the thumb and block interaction while saving. */
  loading?: boolean;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(function Switch({ className, loading = false, disabled, ...props }, ref) {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
 "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-none border-2 border-transparent bg-[var(--input)] shadow-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-foreground",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
 "pointer-events-none flex h-5 w-5 items-center justify-center rounded-none border border-border bg-background shadow-none transition-transform duration-200 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 data-[state=checked]:border-foreground",
        )}
      >
        {loading ? (
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 animate-spin rounded-none border-[1.5px] border-current border-t-transparent text-foreground"
          />
        ) : null}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
});

export { Switch };
