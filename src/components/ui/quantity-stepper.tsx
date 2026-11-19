"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  disabled = false,
  label = "Quantity",
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
}) {
  const decrease = () => onChange(Math.max(min, value - 1));
  const increase = () => onChange(Math.min(max, value + 1));

  const controlClass =
    "inline-flex h-full w-10 shrink-0 items-center justify-center text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div
      className={cn(
        "inline-flex h-11 items-center rounded-xl border border-[var(--input)] bg-[var(--card)] shadow-[var(--shadow-soft)]",
        className,
      )}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={decrease}
        disabled={disabled || value <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className={cn(controlClass, "rounded-l-xl")}
      >
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <span
        aria-live="polite"
        className="min-w-9 text-center text-sm font-bold tabular-nums text-[var(--foreground)]"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={increase}
        disabled={disabled || value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
        className={cn(controlClass, "rounded-r-xl")}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
