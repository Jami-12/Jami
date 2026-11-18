"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface PaginationHref {
  pathname: string;
  params?: Record<string, string | number | boolean | undefined | null>;
}

interface PaginationProps {
  page: number;
  totalPages: number;
  className?: string;
  /**
   * Serializable page-link configuration for server-rendered listings.
   * Functions cannot cross the Server/Client Component boundary.
   */
  href?: PaginationHref;
  /** Client-side pager. Ignored when `href` is provided. */
  onPageChange?: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  href,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageHref = (target: number): string => {
    if (!href) return "#";
    const safeTarget = Math.min(Math.max(1, target), totalPages);
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(href.params ?? {})) {
      if (value === undefined || value === null || value === "" || value === false) {
        continue;
      }
      params.set(key, String(value));
    }

    params.delete("page");
    if (safeTarget > 1) params.set("page", String(safeTarget));

    const query = params.toString();
    return query ? `${href.pathname}?${query}` : href.pathname;
  };

  const pages: (number | "ellipsis")[] = [];
  const push = (value: number | "ellipsis") => pages.push(value);

  const windowStart = Math.max(2, page - 1);
  const windowEnd = Math.min(totalPages - 1, page + 1);

  push(1);
  if (windowStart > 2) push("ellipsis");
  for (let index = windowStart; index <= windowEnd; index += 1) push(index);
  if (windowEnd < totalPages - 1) push("ellipsis");
  if (totalPages > 1) push(totalPages);

  const go = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    onPageChange?.(nextPage);
  };

  const controlClass =
    "flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] disabled:opacity-40";
  const pageClass = (active: boolean) =>
    cn(
      "flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-xs font-semibold transition",
      active
        ? "bg-[var(--color-primary-800)] text-[var(--color-primary-50)] dark:bg-[var(--color-accent-300)] dark:text-[var(--color-primary-950)]"
        : "border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]",
    );

  return (
    <nav className={cn("flex items-center justify-center gap-1.5", className)} aria-label="Pagination">
      {href ? (
        <Link
          href={pageHref(page - 1)}
          aria-label="Previous page"
          aria-disabled={page <= 1}
          tabIndex={page <= 1 ? -1 : undefined}
          className={cn(controlClass, page <= 1 && "pointer-events-none opacity-40")}
        >
          <ChevronLeft size={16} />
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className={controlClass}
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {pages.map((item, index) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-1 text-xs text-[var(--muted-foreground)]">
            …
          </span>
        ) : href ? (
          <Link
            key={item}
            href={pageHref(item)}
            aria-current={item === page ? "page" : undefined}
            className={pageClass(item === page)}
          >
            {item}
          </Link>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => go(item)}
            aria-current={item === page ? "page" : undefined}
            className={pageClass(item === page)}
          >
            {item}
          </button>
        ),
      )}

      {href ? (
        <Link
          href={pageHref(page + 1)}
          aria-label="Next page"
          aria-disabled={page >= totalPages}
          tabIndex={page >= totalPages ? -1 : undefined}
          className={cn(controlClass, page >= totalPages && "pointer-events-none opacity-40")}
        >
          <ChevronRight size={16} />
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => go(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className={controlClass}
        >
          <ChevronRight size={16} />
        </button>
      )}
    </nav>
  );
}
