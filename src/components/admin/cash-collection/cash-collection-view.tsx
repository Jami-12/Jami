"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Banknote,
  CheckCircle2,
  CircleSlash2,
  Search,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { AdminListHeader } from "@/components/admin/shared/admin-list-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { ListPagination } from "@/components/dashboard/list-pagination";
import { Price } from "@/components/ui/price";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { invalidateKeys } from "@/hooks/use-optimistic-mutation";
import { cashCollectionsApi } from "@/lib/api/services";
import { queryKeys, relatedKeys } from "@/lib/query-keys";
import { formatDate, getErrorMessage, humanizeEnum } from "@/lib/utils";
import type {
  CashCollectionStatus,
  PaginatedCashCollections,
} from "@/types";

const STATUS_FILTERS: Array<{
  value: CashCollectionStatus | "ALL";
  label: string;
}> = [
  { value: "PENDING", label: "Pending" },
  { value: "COLLECTED", label: "Collected" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "ALL", label: "All entries" },
];

const STATUS_TONE = {
  PENDING: "warning",
  COLLECTED: "success",
  CANCELLED: "danger",
} as const;

/**
 * Cash collection is deliberately table-free: each order is one scannable card
 * with customer, order number, product number, amount and status. Collecting is
 * a single click — there is no dialog, note or reference field.
 */
export function CashCollectionView() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<CashCollectionStatus | "ALL">(
    "PENDING",
  );
  const debounced = useDebouncedValue(search, 300);

  React.useEffect(() => setPage(1), [debounced, status, limit]);

  const listKey = React.useMemo(
    () =>
      queryKeys.cashCollections.list({
        page,
        limit,
        search: debounced.trim() || undefined,
        status: status === "ALL" ? undefined : status,
      }),
    [page, limit, debounced, status],
  );

  const query = useQuery({
    queryKey: listKey,
    queryFn: () =>
      cashCollectionsApi.list({
        page,
        limit,
        search: debounced.trim() || undefined,
        status: status === "ALL" ? undefined : status,
      }),
  });

  const collect = useMutation({
    mutationFn: (orderId: string) => cashCollectionsApi.collect(orderId),
    onSuccess: (updated) => {
      queryClient.setQueryData<PaginatedCashCollections>(listKey, (current) => {
        if (!current) return current;

        const alreadyListed = current.items.some(
          (item) => item.orderId === updated.orderId,
        );
        const wasPending = current.items.find(
          (item) => item.orderId === updated.orderId,
        )?.status === "PENDING";

        return {
          ...current,
          items: alreadyListed
            ? current.items.map((item) =>
                item.orderId === updated.orderId ? updated : item,
              )
            : current.items,
          summary: wasPending
            ? {
                ...current.summary,
                pendingCount: Math.max(0, current.summary.pendingCount - 1),
                collectedCount: current.summary.collectedCount + 1,
                pendingAmount: Math.max(
                  0,
                  current.summary.pendingAmount - updated.amount,
                ),
                collectedAmount:
                  current.summary.collectedAmount + updated.amount,
              }
            : current.summary,
        };
      });

      toast.success("Cash collected", {
        description: `Order ${updated.orderNumber} is now marked collected.`,
      });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Could not collect this cash entry")),
    onSettled: () => {
      invalidateKeys(queryClient, relatedKeys("orders"));
    },
  });

  const items = query.data?.items ?? [];
  const summary = query.data?.summary;
  const meta = query.data?.meta;

  return (
    <div className="space-y-5">
      <AdminListHeader
        eyebrow="Operations"
        title="Cash collection"
        description="Review every order — bKash, Nagad, card or cash — in one place. Pending entries can be collected with a single click; cancelled orders can never be collected."
        badge={
          <span className="inline-flex items-center gap-1.5">
            <Banknote className="h-3.5 w-3.5" aria-hidden="true" />
            {summary?.pendingCount ?? 0} pending
          </span>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={Banknote}
          label="Pending"
          value={<Price amount={summary?.pendingAmount ?? 0} size="lg" />}
          hint={`${summary?.pendingCount ?? 0} order(s) awaiting collection`}
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Collected"
          value={<Price amount={summary?.collectedAmount ?? 0} size="lg" />}
          hint={`${summary?.collectedCount ?? 0} order(s) settled`}
        />
        <SummaryCard
          icon={CircleSlash2}
          label="Cancelled"
          value={`${summary?.cancelledCount ?? 0}`}
          hint="Cancelled or returned orders — not collectable"
        />
      </div>

      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order number or customer…"
              aria-label="Search cash collection entries"
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as CashCollectionStatus | "ALL")
            }
            aria-label="Filter by collection status"
          >
            {STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <div className="space-y-3" aria-busy={query.isFetching}>
        {query.isLoading ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Loading cash collection entries…
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No cash collection entries match this filter.
            </CardContent>
          </Card>
        ) : (
          items.map((item) => (
            <Card key={item.orderId}>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-3">
                  <Detail icon={UserRound} label="Customer">
                    <span className="truncate font-semibold">
                      {item.customerName}
                    </span>
                  </Detail>
                  <Detail icon={ShoppingBag} label="Order Number">
                    <span className="font-mono text-xs font-bold">
                      {item.orderNumber}
                    </span>
                  </Detail>
                  <Detail icon={ShoppingBag} label="Product Number">
                    <span className="font-mono text-xs font-semibold">
                      {item.productNumber}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {item.itemCount} item(s) · {humanizeEnum(item.paymentMethod)}
                    </span>
                  </Detail>
                </div>

                <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                  <Price amount={item.amount} size="md" />
                  <Badge tone={STATUS_TONE[item.status]} dot>
                    {item.status === "PENDING" ? "Pending" : item.status === "COLLECTED" ? "Collected" : "Cancelled"}
                  </Badge>
                  <p className="text-[11px] text-muted-foreground">
                    Placed {formatDate(item.createdAt, "short")}
                  </p>
                </div>

                <div className="flex shrink-0 items-center sm:ml-2">
                  {item.status === "PENDING" ? (
                    <Button
                      size="sm"
                      onClick={() => collect.mutate(item.orderId)}
                      disabled={collect.isPending}
                      loading={
                        collect.isPending && collect.variables === item.orderId
                      }
                    >
                      <Banknote className="h-3.5 w-3.5" aria-hidden="true" />
                      Collect
                    </Button>
                  ) : item.status === "COLLECTED" ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Collected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <CircleSlash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Not collectable
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <ListPagination
            page={page}
            totalPages={meta?.totalPages ?? 1}
            totalItems={meta?.total}
            pageSize={limit}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setLimit(size);
              setPage(1);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        <Icon className="h-3 w-3" aria-hidden="true" />
        {label}
      </p>
      <div className="mt-1 flex flex-col">{children}</div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-muted text-foreground">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          <div className="mt-1 text-foreground">{value}</div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}
