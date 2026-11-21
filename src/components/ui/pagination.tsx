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
 "flex h-9 w-9 shrink-0 items-center justify-center rounded-none border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] shadow-none transition-colors hover:border-foreground hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40";

  const pageClass = (active: boolean) =>
    cn(
 "flex h-9 min-w-9 items-center justify-center rounded-none px-3 text-xs font-semibold tabular-nums transition-colors",
 "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
      active
        ? "border border-foreground bg-primary text-primary-foreground shadow-none"
        : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-foreground hover:bg-foreground hover:text-background",
    );

  return (
    <nav
      className={cn(
 "flex flex-wrap items-center justify-center gap-1.5 sm:gap-2",
        className,
      )}
      aria-label="Pagination"
    >
      {href ? (
        <Link
          href={pageHref(page - 1)}
          aria-label="Previous page"
          aria-disabled={page <= 1}
          tabIndex={page <= 1 ? -1 : undefined}
          className={controlClass}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className={controlClass}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
      )}

      {pages.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-1 text-xs text-[var(--muted-foreground)]"
            aria-hidden="true"
          >
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
          className={controlClass}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => go(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className={controlClass}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      )}
    </nav>
  );
}
