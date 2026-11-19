import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  mobileCard,
}: {
  columns: DataColumn<T>[];
  rows: T[];
  getKey: (row: T) => string;
  loading?: boolean;
  empty?: string;
  className?: string;
  /** Optional bespoke mobile layout. Falls back to labelled column cards. */
  mobileCard?: (row: T) => ReactNode;
}) {
  const skeletonRows = Array.from({ length: 5 });

  return (
    <>
      {/* Mobile / tablet cards — wide data tables become unreadable on small screens. */}
      <div className="divide-y divide-border md:hidden">
        {loading ? (
          skeletonRows.map((_, index) => (
            <div key={index} className="space-y-3 p-4">
              {columns.slice(0, 4).map((column, columnIndex) => (
                <div key={`${column.header}-${columnIndex}`} className="flex items-center justify-between gap-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          ))
        ) : rows.length === 0 ? (
          <EmptyState icon={Inbox} title="No results" description={empty} className="border-0 bg-transparent py-10" />
        ) : (
          rows.map((row) => (
            <div key={getKey(row)} className="p-4">
              {mobileCard ? (
                mobileCard(row)
              ) : (
                <div className="space-y-3">
                  {columns.map((column, index) => {
                    const content = column.cell(row);
                    if (!column.header.trim()) {
                      return <div key={index}>{content}</div>;
                    }
                    return (
                      <div
                        key={index}
                        className="flex items-start justify-between gap-4 text-sm"
                      >
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                          {column.header}
                        </span>
                        <div className={cn("min-w-0 text-right", column.className)}>{content}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop table keeps the dense scanning experience with horizontal scroll. */}
      <div className="hidden md:block">
        <Table className={cn("min-w-[42rem]", className)}>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column, index) => (
                <TableHead key={`${column.header}-${index}`} className={column.headerClassName}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              skeletonRows.map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column, columnIndex) => (
                    <TableCell key={`${column.header}-${columnIndex}`}>
                      <Skeleton className="h-4 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  {empty}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={getKey(row)}>
                  {columns.map((column, index) => (
                    <TableCell key={`${column.header}-${index}`} className={column.className}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
