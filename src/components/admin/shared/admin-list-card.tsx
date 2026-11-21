"use client";

import type { ReactNode } from "react";

import { DataTable, type DataColumn } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/**
 * Consistent card + table shell for every admin management list.
 * The table uses the shared Shadcn `Table` primitive through `DataTable`, so
 * wide tables stay horizontally scrollable on small screens.
 */
export function AdminListCard<T>({
  title,
  description,
  count,
  countLabel,
  actions,
  columns,
  rows,
  getKey,
  loading = false,
  empty = "Nothing here yet.",
  pagination,
}: {
  title: string;
  description?: string;
  count?: number;
  countLabel?: string;
  actions?: ReactNode;
  columns: DataColumn<T>[];
  rows: T[];
  getKey: (row: T) => string;
  loading?: boolean;
  empty?: string;
  pagination?: ReactNode;
}) {
  return (
    <Card className="min-w-0 overflow-hidden bg-card transition-colors hover:border-foreground">
      <CardHeader className="gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="font-display text-base font-semibold not-italic tracking-tight">
              {title}
            </CardTitle>
            {count !== undefined ? (
              <Badge tone="neutral">
                {count} {countLabel ?? "items"}
              </Badge>
            ) : null}
          </div>
          {description ? <p className="text-xs leading-relaxed text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        <DataTable
          columns={columns}
          rows={rows}
          getKey={getKey}
          loading={loading}
          empty={empty}
          className="min-w-[52rem]"
        />
      </CardContent>

      {pagination ? (
        <CardFooter className="block min-w-0 border-t border-border bg-muted p-4 sm:p-5">
          {pagination}
        </CardFooter>
      ) : null}
    </Card>
  );
}
