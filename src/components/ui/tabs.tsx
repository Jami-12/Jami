"use client";

import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

export function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
 "hide-scrollbar flex items-center gap-1 overflow-x-auto rounded-none border border-[var(--border)] bg-[var(--muted)]/70 p-1",
        className,
      )}
    >
      {items.map((item) => (
        <button
          key={item.value}
          role="tab"
          type="button"
          aria-selected={value === item.value}
          onClick={() => onChange(item.value)}
          className={cn(
 "flex min-h-9 shrink-0 items-center gap-2 rounded-none px-4 py-2 text-xs font-semibold transition-[color,background-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
            value === item.value
              ? "bg-[var(--color-primary-800)] text-[var(--color-primary-50)] shadow-none dark:bg-[var(--color-accent-300)] dark:text-[var(--color-primary-950)]"
              : "text-[var(--muted-foreground)] hover:bg-[var(--card)] hover:text-[var(--foreground)]",
          )}
        >
          {item.label}
          {typeof item.count === "number" ? (
            <span
              className={cn(
 "rounded-none px-1.5 py-0.5 text-[10px] tabular-nums",
                value === item.value
                  ? "bg-white/20 text-white dark:bg-[var(--color-primary-950)]/15 dark:text-[var(--color-primary-950)]"
                  : "bg-[var(--card)] text-[var(--muted-foreground)]",
              )}
            >
              {item.count}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
