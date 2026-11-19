import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border)] bg-[var(--card)]/60 px-6 py-14 text-center shadow-[var(--shadow-soft)] sm:py-16",
        className,
      )}
    >
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--muted)] text-[var(--color-primary-600)] ring-1 ring-[var(--border)] dark:text-[var(--color-accent-300)]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="font-display text-lg font-semibold tracking-tight text-[var(--foreground)]">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-[var(--muted-foreground)]">
        {description}
      </p>
      {action ? <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}
