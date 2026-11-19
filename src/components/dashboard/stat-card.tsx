import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
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
    default: "icon-tint-primary ring-1 ring-primary/20",
    success: "icon-tint-success ring-1 ring-success/20",
    warning: "icon-tint-warning ring-1 ring-warning/20",
    danger: "icon-tint-danger ring-1 ring-danger/20",
    accent: "icon-tint-accent ring-1 ring-accent-foreground/20",
  } as const;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden p-4 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift sm:p-5",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[var(--color-accent-300)]/10 blur-2xl transition-opacity group-hover:opacity-100 dark:bg-[var(--color-accent-300)]/5"
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow text-muted-foreground">{label}</p>
          <p className="mt-2 truncate font-display text-[1.65rem] font-semibold leading-none tracking-tight tabular-nums">
            {value}
          </p>
          {hint ? <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{hint}</p> : null}
        </div>
        {Icon ? (
          <span
            className={cn(
              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1",
              tones[tone],
            )}
          >
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
        ) : null}
      </div>
    </Card>
  );
}
