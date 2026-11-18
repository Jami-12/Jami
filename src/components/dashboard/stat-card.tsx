import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger" | "accent";
  className?: string;
}) {
  const tones = {
    default: "bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-accent-200",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    danger: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
    accent: "bg-accent-100 text-accent-800 dark:bg-accent-300/10 dark:text-accent-200",
  } as const;

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 truncate font-display text-[1.65rem] font-semibold leading-none tracking-tight tabular-nums">
            {value}
          </p>
          {hint ? <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p> : null}
        </div>
        {Icon ? (
          <span className={cn("inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", tones[tone])}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>
    </div>
  );
}
