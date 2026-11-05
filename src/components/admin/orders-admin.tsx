"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Search, Truck } from "lucide-react";
import { toast } from "sonner";

import { DataTable, type DataColumn } from "@/components/dashboard/data-table";
import { PageSection } from "@/components/dashboard/page-section";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Select } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Price } from "@/components/ui/price";
import { Skeleton } from "@/components/ui/skeleton";
import { SmartImage } from "@/components/ui/smart-image";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ordersApi } from "@/lib/api/services";
import {
  ORDER_STATUSES,
  ORDER_TRANSITIONS,
  PAYMENT_METHOD_META,
  PAYMENT_STATUSES,
} from "@/lib/constants";
import { formatCurrency, formatDate, getErrorMessage, humanizeEnum } from "@/lib/utils";
import type { Order, OrderStatus, PaymentStatus } from "@/types";

export function OrdersAdmin() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("ALL");
  const [paymentStatus, setPaymentStatus] = React.useState("ALL");
  const [viewingId, setViewingId] = React.useState<string | null>(null);
  const debounced = useDebouncedValue(search, 300);

  React.useEffect(() => setPage(1), [debounced, status, paymentStatus]);

  const query = useQuery({
    queryKey: ["admin", "orders", { page, search: debounced, status, paymentStatus }],
    queryFn: () =>
      ordersApi.adminList({
        page,
        limit: 15,
        search: debounced.trim() || undefined,
        status: status === "ALL" ? undefined : (status as OrderStatus),
        paymentStatus: paymentStatus === "ALL" ? undefined : (paymentStatus as PaymentStatus),
      }),
  });

  const detail = useQuery({
    queryKey: ["admin", "order", viewingId],
    queryFn: () => ordersApi.get(viewingId as string),
    enabled: Boolean(viewingId),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, next }: { id: string; next: OrderStatus }) =>
      ordersApi.updateStatus(id, next),
    onSuccess: () => {
      toast.success("Order status updated");
      void queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "order"] });
      void queryClient.invalidateQueries({ queryKey: ["order"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not update the order")),
  });

  const rows = query.data?.items ?? [];

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
      header: "",
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order number or customer…"
            aria-label="Search orders"
            className="pl-9"
          />
        </div>
        <Select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by order status" className="sm:max-w-44">
          <option value="ALL">All statuses</option>
          {ORDER_STATUSES.map((value) => (
            <option key={value} value={value}>
              {humanizeEnum(value)}
            </option>
          ))}
        </Select>
        <Select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)} aria-label="Filter by payment status" className="sm:max-w-44">
          <option value="ALL">All payments</option>
          {PAYMENT_STATUSES.map((value) => (
            <option key={value} value={value}>
              {humanizeEnum(value)}
            </option>
          ))}
        </Select>
      </div>

      <PageSection>
        <DataTable
          columns={columns}
          rows={rows}
          getKey={(item) => item.id}
          loading={query.isLoading}
          empty="No orders match these filters."
        />
        <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {query.data ? `${query.data.meta.total} order${query.data.meta.total === 1 ? "" : "s"}` : "—"}
          </p>
          <Pagination
            page={query.data?.meta.page ?? 1}
            totalPages={query.data?.meta.totalPages ?? 1}
            onPageChange={setPage}
          />
        </div>
      </PageSection>

      <Dialog
        open={Boolean(viewingId)}
        onClose={() => setViewingId(null)}
        title={order ? `Order ${order.orderNumber}` : "Order details"}
        description={order ? formatDate(order.createdAt, "long") : undefined}
        size="xl"
        footer={
          <Button variant="outline" size="sm" onClick={() => setViewingId(null)}>
            Close
          </Button>
        }
      >
        {detail.isLoading || !order ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Fulfilment</p>
                <div className="mt-1.5"><OrderStatusBadge status={order.status} /></div>
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Payment</p>
                <div className="mt-1.5"><PaymentStatusBadge status={order.paymentStatus} /></div>
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Method</p>
                <p className="mt-1.5 text-xs font-semibold">{PAYMENT_METHOD_META[order.paymentMethod].label}</p>
              </div>
            </div>

            {ORDER_TRANSITIONS[order.status].length > 0 ? (
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold">
                  <Truck className="h-3.5 w-3.5" aria-hidden="true" />
                  Move this order forward
                </p>
                <div className="flex flex-wrap gap-2">
                  {ORDER_TRANSITIONS[order.status].map((next) => (
                    <Button
                      key={next}
                      size="sm"
                      variant={next === "CANCELLED" ? "danger" : "primary"}
                      loading={updateStatus.isPending && updateStatus.variables?.next === next}
                      onClick={() => updateStatus.mutate({ id: order.id, next })}
                    >
                      Mark {humanizeEnum(next).toLowerCase()}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
                This order is in a terminal state and cannot move further.
              </p>
            )}

            <div>
              <p className="mb-2 text-xs font-bold">Items</p>
              <ul className="divide-y divide-border rounded-xl border border-border">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 p-3">
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <SmartImage src={item.productImage} alt={item.productName} fill sizes="40px" className="object-cover" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{item.productName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatCurrency(item.finalUnitPrice)} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-bold">{formatCurrency(item.totalPrice)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Shipping address</p>
                {order.address ? (
                  <p className="mt-1.5 text-xs leading-relaxed">
                    {order.address.fullName}
                    <br />
                    {order.address.addressLine}
                    {order.address.area ? `, ${order.address.area}` : ""}
                    <br />
                    {order.address.district}
                    {order.address.division ? `, ${order.address.division}` : ""}
                    <br />
                    {order.address.phone}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-muted-foreground">No address on file.</p>
                )}
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Summary</p>
                <dl className="mt-1.5 space-y-1 text-xs">
                  <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatCurrency(order.subtotal)}</dd></div>
                  <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Discount</dt><dd>−{formatCurrency(order.discountAmount)}</dd></div>
                  <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Shipping</dt><dd>{formatCurrency(order.shippingCost)}</dd></div>
                  <div className="flex justify-between gap-2 border-t border-border pt-1 font-bold"><dt>Total</dt><dd>{formatCurrency(order.totalAmount)}</dd></div>
                </dl>
                {order.notes ? (
                  <p className="mt-2 border-t border-border pt-2 text-[11px] text-muted-foreground">
                    Note: {order.notes}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
