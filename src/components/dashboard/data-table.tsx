import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface DataColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export function DataTable<T>({
  columns,
  rows,
  getKey,
  loading = false,
  empty = "Nothing here yet.",
  className,
}: {
  columns: DataColumn<T>[];
  rows: T[];
  getKey: (row: T) => string;
  loading?: boolean;
  empty?: string;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((column) => (
              <th
                key={column.header}
                scope="col"
                className={cn(
                  "whitespace-nowrap px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground",
                  column.headerClassName,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="border-b border-border/60">
                {columns.map((column) => (
                  <td key={column.header} className="px-3 py-3">
                    <Skeleton className="h-4 w-full max-w-32" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-10 text-center text-sm text-muted-foreground"
              >
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={getKey(row)}
                className="border-b border-border/60 transition last:border-0 hover:bg-muted/40"
              >
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className={cn("px-3 py-3 align-middle", column.className)}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
