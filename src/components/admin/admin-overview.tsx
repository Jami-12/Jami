"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Package,
  Receipt,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { DataTable, type DataColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { categoriesApi, inventoryApi, ordersApi, productsApi, reviewsApi } from "@/lib/api/services";
import { formatDate, formatNumber } from "@/lib/utils";
import type { Order } from "@/types";

const columns: DataColumn<Order>[] = [
  {
    header: "Order",
    cell: (order) => (
      <div className="min-w-0">
        <p className="font-semibold">{order.orderNumber}</p>
        <p className="text-[11px] text-muted-foreground">
          {order.customer.name} · {formatDate(order.createdAt, "short")}
        </p>
      </div>
    ),
  },
  {
    header: "Status",
    cell: (order) => <OrderStatusBadge status={order.status} />,
  },
  {
    header: "Payment",
    cell: (order) => <PaymentStatusBadge status={order.paymentStatus} />,
  },
  {
    header: "Total",
    cell: (order) => <Price amount={order.totalAmount} size="sm" />,
    className: "text-right",
    headerClassName: "text-right",
  },
];

function OrderStatusBadge({ status }: { status: Order["status"] }) {
  const tone =
    status === "DELIVERED"
      ? "success"
      : status === "CANCELLED"
        ? "danger"
        : status === "PENDING" || status === "PROCESSING"
          ? "warning"
          : "info";
  return (
    <Badge tone={tone} dot>
      {status.replaceAll("_", " ")}
    </Badge>
  );
}

function PaymentStatusBadge({ status }: { status: Order["paymentStatus"] }) {
  const tone = status === "PAID" ? "success" : status === "FAILED" ? "danger" : "warning";
  return (
    <Badge tone={tone} dot>
      {status}
    </Badge>
  );
}

export function AdminOverview() {
  const recentOrders = useQuery({
    queryKey: ["admin", "orders", "recent"],
    queryFn: () => ordersApi.adminList({ limit: 6, sortOrder: "desc" }),
    staleTime: 30_000,
  });

  const allOrders = useQuery({
    queryKey: ["admin", "orders", "total"],
    queryFn: () => ordersApi.adminList({ limit: 1 }),
    staleTime: 60_000,
  });

  const pendingOrders = useQuery({
    queryKey: ["admin", "orders", "pending"],
    queryFn: () => ordersApi.adminList({ limit: 1, status: "PENDING" }),
    staleTime: 60_000,
  });

  const products = useQuery({
    queryKey: ["admin", "products", "total"],
    queryFn: () => productsApi.list({ limit: 1 }),
    staleTime: 60_000,
  });

  const pendingReviews = useQuery({
    queryKey: ["admin", "reviews", "pending"],
    queryFn: () => reviewsApi.list({ limit: 1, isApproved: false }),
    staleTime: 60_000,
  });

  const inventory = useQuery({
    queryKey: ["admin", "inventory", "overview"],
    queryFn: inventoryApi.overview,
    staleTime: 60_000,
  });

  const categories = useQuery({
    queryKey: ["categories", "admin"],
    queryFn: () => categoriesApi.list(),
    staleTime: 120_000,
  });

  const orders = recentOrders.data?.items ?? [];
  const lowStock = inventory.data?.lowStockItems.slice(0, 5) ?? [];

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden bg-muted">
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Command centre
            </p>
            <CardTitle className="font-display text-xl not-italic sm:text-2xl">
              Store operations at a glance
            </CardTitle>
            <CardDescription>
              Track orders, catalogue health and the items that need your attention today.
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/orders">
              Open orders
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Orders"
          value={allOrders.data?.meta.total ?? "—"}
          hint={`${pendingOrders.data?.meta.total ?? 0} awaiting action`}
          icon={Receipt}
        />
        <StatCard
          label="Products"
          value={products.data?.meta.total ?? "—"}
          hint={`${categories.data?.length ?? 0} categories`}
          icon={Package}
          tone="accent"
        />
        <StatCard
          label="Stock units"
          value={inventory.data ? formatNumber(inventory.data.totalUnits) : "—"}
          hint={`${inventory.data?.lowStockCount ?? 0} low · ${inventory.data?.outOfStockCount ?? 0} out`}
          icon={Boxes}
          tone={inventory.data && inventory.data.lowStockCount > 0 ? "warning" : "success"}
        />
        <StatCard
          label="Reviews to moderate"
          value={pendingReviews.data?.meta.total ?? "—"}
          hint="Awaiting approval"
          icon={Star}
          tone="warning"
        />
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="font-display text-base">Recent orders</CardTitle>
              <CardDescription>Latest activity across the store.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/orders">
                All orders
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-2 sm:px-0">
            <DataTable
              columns={columns}
              rows={orders}
              getKey={(order) => order.id}
              loading={recentOrders.isLoading}
              empty="No orders have been placed yet."
            />
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">Inventory value</CardTitle>
              <CardDescription>At purchase cost and potential resale.</CardDescription>
            </CardHeader>
            <CardContent>
              {inventory.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Metric</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
                          Cost value
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        <Price amount={inventory.data?.inventoryCostValue ?? 0} size="sm" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                          Resale value
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        <Price amount={inventory.data?.potentialSellingValue ?? 0} size="sm" />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <CardTitle className="font-display text-base">Low stock</CardTitle>
                <CardDescription>Replenish before these sell out.</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/inventory">Inventory</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {inventory.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : lowStock.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  All products are comfortably stocked.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {lowStock.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-none border border-border bg-muted px-3 py-2 transition-colors hover:border-foreground"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground">{item.sku}</p>
                      </div>
                      <Badge tone="warning" className="shrink-0">
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        {item.stock} left
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
