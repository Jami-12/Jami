"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Search } from "lucide-react";
import { toast } from "sonner";

import { CashCollectionDialog } from "./cash-collection-dialog";
import { OrderDetailDialog } from "./order-detail-dialog";

import { ReceiptDialog } from "@/components/account/order-detail";
import { AdminListCard } from "@/components/admin/shared/admin-list-card";
import { AdminListHeader } from "@/components/admin/shared/admin-list-header";
import { ListPagination } from "@/components/dashboard/list-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DataColumn } from "@/components/dashboard/data-table";
import { Input, Select } from "@/components/ui/input";
import { Price } from "@/components/ui/price";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { invalidateKeys } from "@/hooks/use-optimistic-mutation";
import { ordersApi } from "@/lib/api/services";
import { queryKeys, relatedKeys } from "@/lib/query-keys";
import {
  ORDER_STATUSES,
  PAYMENT_METHOD_META,
  PAYMENT_STATUSES,
} from "@/lib/constants";
import { formatDate, getErrorMessage, humanizeEnum } from "@/lib/utils";
import type { Order, OrderStatus, PaymentStatus } from "@/types";

export function OrdersAdmin() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("ALL");
  const [paymentStatus, setPaymentStatus] = React.useState("ALL");
  const [viewingId, setViewingId] = React.useState<string | null>(null);
  const debounced = useDebouncedValue(search, 300);

  React.useEffect(
    () => setPage(1),
    [debounced, status, paymentStatus, limit],
  );

  const query = useQuery({
    queryKey: queryKeys.orders.admin.list({ page, limit, search: debounced, status, paymentStatus }),
    queryFn: () =>
      ordersApi.adminList({
        page,
        limit,
        search: debounced.trim() || undefined,
        status: status === "ALL" ? undefined : (status as OrderStatus),
        paymentStatus: paymentStatus === "ALL" ? undefined : (paymentStatus as PaymentStatus),
      }),
  });

  const detail = useQuery({
    queryKey: queryKeys.orders.admin.detail(viewingId ?? ""),
    queryFn: () => ordersApi.get(viewingId as string),
    enabled: Boolean(viewingId),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, next }: { id: string; next: OrderStatus }) =>
      ordersApi.updateStatus(id, next),
    onSuccess: () => {
      toast.success("Order status updated");
      invalidateKeys(queryClient, relatedKeys("orders"));
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not update the order")),
  });

  const [collectOpen, setCollectOpen] = React.useState(false);
  const [receiptOpen, setReceiptOpen] = React.useState(false);
  const [collectionNote, setCollectionNote] = React.useState("");
  const [collectionReference, setCollectionReference] = React.useState("");

  const collectPayment = useMutation({
    mutationFn: (orderId: string) =>
      ordersApi.collectPayment(orderId, {
        note: collectionNote.trim() || undefined,
        reference: collectionReference.trim() || undefined,
      }),
    onSuccess: (updated) => {
      toast.success("Cash payment recorded", {
        description: `Order ${updated.orderNumber} is now marked paid.`,
      });
      setCollectOpen(false);
      setCollectionNote("");
      setCollectionReference("");
      queryClient.setQueryData(queryKeys.orders.admin.detail(updated.id), updated);
      invalidateKeys(queryClient, relatedKeys("orders"));
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Could not record the cash payment")),
  });

  const rows = query.data?.items ?? [];
  const meta = query.data?.meta;

  const columns: DataColumn<Order>[] = [
    {
      header: "Order",
      cell: (order) => (
        <div>
          <p className="font-mono text-xs font-bold">{order.orderNumber}</p>
          <p className="text-[11px] text-muted-foreground">
            {order.customer.name} · {formatDate(order.createdAt, "short")}
          </p>
        </div>
      ),
    },
    {
      header: "Items",
      cell: (order) => (
        <span className="text-xs">
          {order.items.reduce((sum, item) => sum + item.quantity, 0)} unit(s)
        </span>
      ),
    },
    { header: "Status", cell: (order) => <OrderStatusBadge status={order.status} /> },
    { header: "Payment", cell: (order) => <PaymentStatusBadge status={order.paymentStatus} /> },
    {
      header: "Method",
      cell: (order) => (
        <span className="text-[11px] text-muted-foreground">
          {PAYMENT_METHOD_META[order.paymentMethod].label}
        </span>
      ),
    },
    {
      header: "Total",
      cell: (order) => <Price amount={order.totalAmount} size="sm" />,
      className: "text-right",
      headerClassName: "text-right",
    },
    {
      header: "Actions",
      cell: (order) => (
        <Button variant="outline" size="sm" onClick={() => setViewingId(order.id)}>
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          View
        </Button>
      ),
      className: "text-right",
      headerClassName: "text-right",
    },
  ];

  const order = detail.data;
  const cashDue = Boolean(
    order &&
      order.paymentMethod === "CASH_ON_DELIVERY" &&
      order.paymentStatus !== "PAID" &&
      order.paymentStatus !== "REFUNDED" &&
      order.status !== "CANCELLED" &&
      order.status !== "RETURNED",
  );

  return (
    <div className="space-y-5">
      <AdminListHeader
        eyebrow="Operations"
        title="Orders"
        description="Follow fulfilment and payments, update statuses and record cash collections from one place."
      />

      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order number or customer…"
              aria-label="Search orders"
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by order status"
          >
            <option value="ALL">All statuses</option>
            {ORDER_STATUSES.map((value) => (
              <option key={value} value={value}>
                {humanizeEnum(value)}
              </option>
            ))}
          </Select>
          <Select
            value={paymentStatus}
            onChange={(event) => setPaymentStatus(event.target.value)}
            aria-label="Filter by payment status"
          >
            <option value="ALL">All payments</option>
            {PAYMENT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {humanizeEnum(value)}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <AdminListCard
        title="Order history"
        description="Newest orders first. Open any order to review its items, payment and delivery details."
        count={meta?.total}
        countLabel="orders"
        columns={columns}
        rows={rows}
        getKey={(item) => item.id}
        loading={query.isLoading}
        empty="No orders match these filters."
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

      <OrderDetailDialog
        order={order}
        open={Boolean(viewingId)}
        onClose={() => setViewingId(null)}
        loading={detail.isLoading}
        cashDue={cashDue}
        onCollectCash={() => setCollectOpen(true)}
        onReceipt={() => setReceiptOpen(true)}
        onUpdateStatus={(next) => order && updateStatus.mutate({ id: order.id, next })}
        updatePending={updateStatus.isPending}
        updateNext={updateStatus.variables?.next}
      />

      <CashCollectionDialog
        order={order}
        open={collectOpen}
        onClose={() => setCollectOpen(false)}
        note={collectionNote}
        reference={collectionReference}
        onNoteChange={setCollectionNote}
        onReferenceChange={setCollectionReference}
        onSubmit={() => order && collectPayment.mutate(order.id)}
        pending={collectPayment.isPending}
      />

      {order ? (
        <ReceiptDialog
          orderId={order.id}
          open={receiptOpen}
          onClose={() => setReceiptOpen(false)}
        />
      ) : null}
    </div>
  );
}
