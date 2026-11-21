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
  tone?: "default" | "success" | "warning" | "danger" | "info" | "accent";
  className?: string;
}) {
  // Meaning-first icon tiles; the card itself stays on the neutral surface.
  const tones = {
    default: "border-border bg-muted text-foreground",
    success: "border-success/25 bg-success-soft text-success",
    warning: "border-warning/25 bg-warning-soft text-warning",
    danger: "border-danger/25 bg-danger-soft text-danger",
    info: "border-info/25 bg-info-soft text-info",
    accent: "border-border bg-card text-muted-foreground",
  } as const;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden p-4 transition-colors duration-200 hover:border-foreground sm:p-5",
        className,
      )}
    >
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow not-italic text-muted-foreground">{label}</p>
          <p className="mt-2 truncate font-display text-[1.65rem] font-semibold not-italic leading-none tracking-tight tabular-nums">
            {value}
          </p>
          {hint ? (
            <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        {Icon ? (
          <span
            className={cn(
              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-none border",
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
