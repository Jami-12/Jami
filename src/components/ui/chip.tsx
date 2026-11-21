import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  icon?: LucideIcon;
  tone?: "neutral" | "primary" | "accent" | "success" | "warning" | "danger" | "info";
  selected?: boolean;
  children: ReactNode;
}

const tones = {
  neutral: "border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)]",
  primary: "border border-foreground bg-primary text-primary-foreground",
  accent: "border border-foreground bg-[var(--muted)] text-[var(--foreground)]",
  success: "border border-success/25 bg-success-soft text-success",
  warning: "border border-warning/25 bg-warning-soft text-warning",
  danger: "border border-danger/25 bg-danger-soft text-danger",
  info: "border border-info/25 bg-info-soft text-info",
} as const;

/** Compact square tag used for filters, metadata and selectable options. */
export function Chip({
  icon: Icon,
  tone = "neutral",
  selected = false,
  className,
  children,
  ...props
}: ChipProps) {
  return (
    <span
      data-selected={selected || undefined}
      className={cn(
 "inline-flex items-center gap-1.5 rounded-none px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-[background-color,color,border-color] duration-150",
        tones[tone],
        selected && "border-foreground ring-1 ring-foreground ring-inset",
        className,
      )}
      {...props}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
