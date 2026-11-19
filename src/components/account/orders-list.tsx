"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Eye, Receipt, Search } from "lucide-react";

import { DataTable, type DataColumn } from "@/components/dashboard/data-table";
import { ListPagination } from "@/components/dashboard/list-pagination";
import { PageSection } from "@/components/dashboard/page-section";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { Price } from "@/components/ui/price";
import { Tabs } from "@/components/ui/tabs";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ordersApi } from "@/lib/api/services";
import { formatDate } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const STATUS_TABS = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

const PAGE_SIZES = [10, 20, 50];

const columns: DataColumn<Order>[] = [
  {
    header: "Order",
    cell: (order) => (
      <div>
        <p className="font-semibold">{order.orderNumber}</p>
        <p className="text-[11px] text-muted-foreground">{formatDate(order.createdAt)}</p>
      </div>
    ),
  },
  {
    header: "Items",
    cell: (order) =>
      order.items.length === 0 ? (
        <span className="text-muted-foreground">—</span>
      ) : (
        <div className="max-w-52">
          <p className="truncate text-xs font-semibold">
            {order.items[0]?.productName}
            {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {order.items.reduce((sum, item) => sum + item.quantity, 0)} unit(s)
          </p>
        </div>
      ),
  },
  { header: "Status", cell: (order) => <OrderStatusBadge status={order.status} /> },
  { header: "Payment", cell: (order) => <PaymentStatusBadge status={order.paymentStatus} /> },
  {
    header: "Total",
    cell: (order) => <Price amount={order.totalAmount} size="sm" />,
    className: "text-right",
    headerClassName: "text-right",
  },
  {
    header: "",
    cell: (order) => (
      <Button asChild variant="outline" size="sm" className="h-8">
        <Link href={`/account/orders/${order.id}`}>
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          View
        </Link>
      </Button>
    ),
    className: "text-right",
    headerClassName: "text-right",
  },
];

function OrderMobileCard({ order }: { order: Order }) {
  const firstItem = order.items[0];
  const units = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/account/orders/${order.id}`}
            className="font-display text-sm font-semibold hover:underline"
          >
            {order.orderNumber}
          </Link>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <Price amount={order.totalAmount} size="sm" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <OrderStatusBadge status={order.status} />
        <PaymentStatusBadge status={order.paymentStatus} />
      </div>

      <Separator />

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">
            {firstItem?.productName ?? "No items"}
            {order.items.length > 1 ? ` +${order.items.length - 1}` : ""}
          </p>
          <p className="text-[11px] text-muted-foreground">{units} unit(s)</p>
        </div>
        <Button asChild variant="outline" size="sm" className="h-8 shrink-0">
          <Link href={`/account/orders/${order.id}`}>
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            View
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function OrdersList() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [status, setStatus] = React.useState<string>("ALL");
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const query = useQuery({
    queryKey: ["orders", "my", { page, pageSize, status, search: debouncedSearch }],
    queryFn: () =>
      ordersApi.myOrders({
        page,
        limit: pageSize,
        status: status === "ALL" ? undefined : (status as OrderStatus),
        search: debouncedSearch.trim() || undefined,
      }),
  });

  React.useEffect(() => {
    setPage(1);
  }, [status, debouncedSearch, pageSize]);

  const orders = query.data?.items ?? [];
  const meta = query.data?.meta;
  const isFiltered = Boolean(debouncedSearch) || status !== "ALL";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          items={STATUS_TABS.map((tab) => ({ value: tab.value, label: tab.label }))}
          value={status}
          onChange={setStatus}
          className="max-w-full"
        />
        <div className="relative w-full lg:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order number…"
            aria-label="Search your orders"
            className="pl-9"
          />
        </div>
      </div>

      <PageSection
        title="Your orders"
        description="Track payment and delivery progress in one place."
        footer={
          <ListPagination
            page={meta?.page ?? page}
            pageCount={meta?.totalPages ?? 1}
            totalItems={meta?.total}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZES}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        }
      >
        <DataTable
          columns={columns}
          rows={orders}
          getKey={(order) => order.id}
          loading={query.isLoading}
          mobileCard={(order) => <OrderMobileCard order={order} />}
          empty={
            isFiltered
              ? "No orders match these filters."
              : "You have not placed an order yet."
          }
        />
      </PageSection>

      {!query.isLoading && orders.length === 0 && !isFiltered ? (
        <EmptyState
          icon={Receipt}
          title="No orders yet"
          description="When you place an order it will appear here with live payment and delivery status."
          action={
            <Button asChild>
              <Link href="/products">Explore the collection</Link>
            </Button>
          }
        />
      ) : null}
    </div>
  );
}
