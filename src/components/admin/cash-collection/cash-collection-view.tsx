"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, CheckCircle2, Search } from "lucide-react";
import { toast } from "sonner";

import { CashCollectionDialog } from "@/components/admin/orders/cash-collection-dialog";
import { AdminListCard } from "@/components/admin/shared/admin-list-card";
import { AdminListHeader } from "@/components/admin/shared/admin-list-header";
import { ListPagination } from "@/components/dashboard/list-pagination";
import type { DataColumn } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Price } from "@/components/ui/price";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { invalidateKeys } from "@/hooks/use-optimistic-mutation";
import { ordersApi } from "@/lib/api/services";
import { PAYMENT_STATUSES } from "@/lib/constants";
import { queryKeys, relatedKeys } from "@/lib/query-keys";
import { formatDate, getErrorMessage, humanizeEnum } from "@/lib/utils";
import type { Order, PaymentStatus } from "@/types";

const COLLECTABLE: PaymentStatus[] = ["PENDING", "PROCESSING"];

export function CashCollectionView() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [paymentStatus, setPaymentStatus] = React.useState<string>("PENDING");
  const [collecting, setCollecting] = React.useState<Order | null>(null);
  const [note, setNote] = React.useState("");
  const [reference, setReference] = React.useState("");
  const debounced = useDebouncedValue(search, 300);

  React.useEffect(() => setPage(1), [debounced, paymentStatus, limit]);

  const query = useQuery({
    queryKey: queryKeys.orders.admin.list({
      page,
      limit,
      search: debounced,
      paymentMethod: "CASH_ON_DELIVERY",
      paymentStatus,
    }),
    queryFn: () =>
      ordersApi.adminList({
        page,
        limit,
        search: debounced.trim() || undefined,
        paymentMethod: "CASH_ON_DELIVERY",
        paymentStatus: paymentStatus === "ALL" ? undefined : (paymentStatus as PaymentStatus),
      }),
  });

  const collect = useMutation({
    mutationFn: (orderId: string) =>
      ordersApi.collectPayment(orderId, {
        note: note.trim() || undefined,
        reference: reference.trim() || undefined,
      }),
    onSuccess: (updated) => {
      toast.success("Cash payment recorded", {
        description: `Order ${updated.orderNumber} is now marked paid.`,
      });
      setCollecting(null);
      setNote("");
      setReference("");
      queryClient.setQueryData(queryKeys.orders.admin.detail(updated.id), updated);
      invalidateKeys(queryClient, relatedKeys("orders"));
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Could not record the cash payment")),
  });

  const rows = (query.data?.items ?? []).filter((order) =>
    COLLECTABLE.includes(order.paymentStatus),
  );
  const meta = query.data?.meta;
  const dueOnPage = rows.reduce((sum, order) => sum + order.totalAmount, 0);

  const columns: DataColumn<Order>[] = [
    {
      header: "Order",
      cell: (order) => (
        <div>
          <p className="font-mono text-xs font-bold">{order.orderNumber}</p>
          <p className="text-[11px] text-muted-foreground">
            {formatDate(order.createdAt, "short")}
          </p>
        </div>
      ),
    },
    {
      header: "Customer",
      cell: (order) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">{order.customer.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {order.customer.phone ?? "—"}
          </p>
        </div>
      ),
    },
    { header: "Fulfilment", cell: (order) => <OrderStatusBadge status={order.status} /> },
    { header: "Payment", cell: (order) => <PaymentStatusBadge status={order.paymentStatus} /> },
    {
      header: "Amount due",
      cell: (order) => <Price amount={order.totalAmount} size="sm" />,
      className: "text-right",
      headerClassName: "text-right",
    },
    {
      header: "Action",
      cell: (order) => (
        <Button
          size="sm"
          onClick={() => {
            setCollecting(order);
            setNote("");
            setReference("");
          }}
        >
          <Banknote className="h-3.5 w-3.5" aria-hidden="true" />
          Collect cash
        </Button>
      ),
      className: "text-right",
      headerClassName: "text-right",
    },
  ];

  return (
    <div className="space-y-5">
      <AdminListHeader
        eyebrow="Operations"
        title="Cash collection"
        description="Settle cash-on-delivery orders as payment is received. Collections post income to the ledger and add an audit note."
        badge={
          <span className="inline-flex items-center gap-1.5">
            <Banknote className="h-3.5 w-3.5" aria-hidden="true" />
            {meta?.total ?? 0} due
          </span>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={Banknote}
          label="Outstanding on this page"
          value={<Price amount={dueOnPage} size="lg" />}
          hint="Sum of the orders shown below"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Orders shown"
          value={`${rows.length}`}
          hint="Collectable COD orders on this page"
        />
        <SummaryCard
          icon={Banknote}
          label="Total due"
          value={`${meta?.total ?? 0}`}
          hint="Across all matching orders"
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
              aria-label="Search cash orders"
              className="pl-9"
            />
          </div>
          <Select
            value={paymentStatus}
            onChange={(event) => setPaymentStatus(event.target.value)}
            aria-label="Filter by payment status"
          >
            {COLLECTABLE.map((value) => (
              <option key={value} value={value}>
                {humanizeEnum(value)}
              </option>
            ))}
            <option value="ALL">All payments</option>
            {PAYMENT_STATUSES.filter((value) => !COLLECTABLE.includes(value)).map((value) => (
              <option key={value} value={value}>
                {humanizeEnum(value)}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <AdminListCard
        title="Cash on delivery"
        description="Orders awaiting cash payment. Delivered orders are recorded automatically."
        count={meta?.total}
        countLabel="orders"
        columns={columns}
        rows={rows}
        getKey={(item) => item.id}
        loading={query.isLoading}
        empty="No cash-on-delivery orders need collection."
        pagination={
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
        }
      />

      <CashCollectionDialog
        order={collecting ?? undefined}
        open={Boolean(collecting)}
        onClose={() => setCollecting(null)}
        note={note}
        reference={reference}
        onNoteChange={setNote}
        onReferenceChange={setReference}
        onSubmit={() => collecting && collect.mutate(collecting.id)}
        pending={collect.isPending}
      />
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
