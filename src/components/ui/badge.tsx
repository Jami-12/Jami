import type { ReactNode } from "react";

import type { Tone } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Semantic status palette on the neutral foundation: green for success, amber
 * for caution, rose for danger and blue for information. Square, flat, readable
 * in both themes.
 */
const tones: Record<Tone, string> = {
  neutral:
    "border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)]",
  success: "border border-success/25 bg-success-soft text-success",
  warning: "border border-warning/25 bg-warning-soft text-warning",
  danger: "border border-danger/25 bg-danger-soft text-danger",
  info: "border border-info/25 bg-info-soft text-info",
  accent:
    "border border-[var(--foreground)] bg-[var(--muted)] text-[var(--foreground)]",
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
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-none px-2 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-[0.12em]",
        tones[tone],
        className,
      )}
    >
      {dot ? (
        <span className="h-1.5 w-1.5 shrink-0 rounded-none bg-current" aria-hidden="true" />
      ) : null}
      {children}
    </span>
  );
}
