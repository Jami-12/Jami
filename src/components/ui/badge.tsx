import type { ReactNode } from "react";

import type { Tone } from "@/lib/constants";
import { cn } from "@/lib/utils";

const tones: Record<Tone, string> = {
  neutral:
    "bg-[var(--muted)] text-[var(--muted-foreground)] ring-1 ring-inset ring-[var(--border)]",
  success:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25",
  warning:
    "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25",
  danger:
    "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/25",
  info:
    "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/25",
  accent:
    "bg-[var(--color-accent-100)] text-[var(--color-accent-800)] ring-1 ring-inset ring-[var(--color-accent-300)] dark:bg-[var(--color-accent-300)]/10 dark:text-[var(--color-accent-200)] dark:ring-[var(--color-accent-300)]/25",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  dot = false,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none tracking-wide",
        tones[tone],
        className,
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
