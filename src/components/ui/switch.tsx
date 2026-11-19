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
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-[var(--input)] shadow-inner transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[var(--color-primary-700)] dark:data-[state=checked]:bg-[var(--color-accent-400)]",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 dark:ring-black/20",
        )}
      >
        {loading ? (
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent text-[var(--color-primary-700)] dark:text-[var(--color-primary-950)]"
          />
        ) : null}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
});

export { Switch };
