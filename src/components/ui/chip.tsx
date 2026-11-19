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
  neutral: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  primary: "bg-primary/10 text-primary",
  accent: "bg-[var(--accent-soft)] text-[var(--accent-foreground)]",
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  info: "bg-[var(--info-soft)] text-[var(--info)]",
} as const;

/** Compact pill used for filters, metadata and selectable tags. */
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
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ring-current/10 transition-[background-color,color,box-shadow] duration-200",
        tones[tone],
        selected && "ring-2 ring-primary/50",
        className,
      )}
      {...props}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
