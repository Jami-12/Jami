import type { ReactNode } from "react";

import type { Tone } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Theme-aware status palette driven by the global semantic tokens. */
const tones: Record<Tone, string> = {
  neutral:
    "bg-[var(--muted)] text-[var(--muted-foreground)] ring-1 ring-inset ring-[var(--border)]",
  success:
    "bg-[var(--success-soft)] text-[var(--success)] ring-1 ring-inset ring-[var(--success)]/25",
  warning:
    "bg-[var(--warning-soft)] text-[var(--warning)] ring-1 ring-inset ring-[var(--warning)]/25",
  danger:
    "bg-[var(--danger-soft)] text-[var(--danger)] ring-1 ring-inset ring-[var(--danger)]/25",
  info: "bg-[var(--info-soft)] text-[var(--info)] ring-1 ring-inset ring-[var(--info)]/25",
  accent:
    "bg-[var(--accent-soft)] text-[var(--accent-foreground)] ring-1 ring-inset ring-[var(--color-accent-400)]/40",
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
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none tracking-wide",
        tones[tone],
        className,
      )}
    >
      {dot ? (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
      ) : null}
      {children}
    </span>
  );
}
