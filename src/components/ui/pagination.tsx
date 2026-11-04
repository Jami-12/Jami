"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "ellipsis")[] = [];
  const push = (value: number | "ellipsis") => pages.push(value);

  const windowStart = Math.max(2, page - 1);
  const windowEnd = Math.min(totalPages - 1, page + 1);

  push(1);
  if (windowStart > 2) push("ellipsis");
  for (let index = windowStart; index <= windowEnd; index += 1) push(index);
  if (windowEnd < totalPages - 1) push("ellipsis");
  if (totalPages > 1) push(totalPages);

  return (
    <nav className={cn("flex items-center justify-center gap-1.5", className)} aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((item, index) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-1 text-xs text-[var(--muted-foreground)]">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              "flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-xs font-semibold transition",
              item === page
                ? "bg-[var(--color-primary-700)] text-white dark:bg-[var(--color-accent-300)] dark:text-[#082f49]"
                : "border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]",
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
