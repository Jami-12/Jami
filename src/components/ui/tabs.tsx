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
        "hide-scrollbar flex items-center gap-1 overflow-x-auto rounded-full border border-[var(--border)] bg-[var(--card)] p-1",
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
            "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition",
            value === item.value
              ? "bg-[var(--color-primary-800)] text-[var(--color-primary-50)] shadow-sm dark:bg-[var(--color-accent-300)] dark:text-[var(--color-primary-950)]"
              : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
          )}
        >
          {item.label}
          {typeof item.count === "number" ? (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px]",
                value === item.value
                  ? "bg-white/20 text-white dark:bg-[var(--color-primary-950)]/15 dark:text-[var(--color-primary-950)]"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)]",
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
