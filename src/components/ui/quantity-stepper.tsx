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

  return (
    <div
      className={cn(
        "inline-flex h-11 items-center rounded-xl border border-border bg-card",
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
        className="inline-flex h-full w-10 items-center justify-center rounded-l-xl text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
      >
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <span
        aria-live="polite"
        className="min-w-9 text-center text-sm font-bold tabular-nums"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={increase}
        disabled={disabled || value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
        className="inline-flex h-full w-10 items-center justify-center rounded-r-xl text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
