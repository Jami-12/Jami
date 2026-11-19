"use client";

import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

export interface ListPaginationProps {
  page: number;
  /** Number of pages. `totalPages` is accepted as an alias. */
  pageCount?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

const DEFAULT_PAGE_SIZES = [10, 20, 50];

/**
 * Shared pager for every admin / super-admin list.
 *
 * Renders the numbered controls from the Shadcn `Pagination` primitive plus a
 * compact "showing X–Y of Z" summary and an optional page-size selector.
 */
export function ListPagination({
  page,
  pageCount,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  className,
}: ListPaginationProps) {
  const pages = Math.max(1, pageCount ?? totalPages ?? 1);
  const size = Math.max(1, pageSize ?? 10);
  const safePage = Math.min(Math.max(1, page), pages);

  const start = totalItems === undefined ? undefined : totalItems === 0 ? 0 : (safePage - 1) * size + 1;
  const end =
    totalItems === undefined
      ? undefined
      : Math.min(totalItems, start! + size - 1);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {start !== undefined && end !== undefined ? (
          <span>
            Showing <span className="font-semibold text-foreground">{start}–{end}</span>{" "}
            of <span className="font-semibold text-foreground">{totalItems}</span>
          </span>
        ) : null}
        {onPageSizeChange ? (
          <label className="inline-flex items-center gap-2">
            <span>Rows per page</span>
            <select
              aria-label="Rows per page"
              value={size}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-8 rounded-lg border border-input bg-card px-2 text-xs font-semibold text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <Pagination
        page={safePage}
        totalPages={pages}
        onPageChange={onPageChange}
        className="justify-center sm:justify-end"
      />
    </div>
  );
}
