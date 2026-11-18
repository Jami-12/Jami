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

import { PageSection } from "@/components/dashboard/page-section";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataTable, type DataColumn } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesApi, inventoryApi, ordersApi, productsApi, reviewsApi } from "@/lib/api/services";
import { formatDate, formatNumber } from "@/lib/utils";
import type { Order } from "@/types";

const columns: DataColumn<Order>[] = [
  {
    header: "Order",
    cell: (order) => (
      <div>
        <p className="font-semibold">{order.orderNumber}</p>
        <p className="text-[11px] text-muted-foreground">
          {order.customer.name} · {formatDate(order.createdAt, "short")}
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
];

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

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <PageSection
          title="Recent orders"
          description="Latest activity across the store."
          actions={
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/orders">
                All orders
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          }
        >
          <DataTable
            columns={columns}
            rows={orders}
            getKey={(order) => order.id}
            loading={recentOrders.isLoading}
            empty="No orders have been placed yet."
          />
        </PageSection>

        <div className="space-y-5">
          <PageSection
            title="Inventory value"
            description="At purchase cost and potential resale."
          >
            {inventory.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
                    Cost value
                  </dt>
                  <dd className="font-bold">
                    <Price amount={inventory.data?.inventoryCostValue ?? 0} size="sm" />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                    Resale value
                  </dt>
                  <dd className="font-bold">
                    <Price amount={inventory.data?.potentialSellingValue ?? 0} size="sm" />
                  </dd>
                </div>
              </dl>
            )}
          </PageSection>

          <PageSection
            title="Low stock"
            description="Replenish before these sell out."
            actions={
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/inventory">Inventory</Link>
              </Button>
            }
          >
            {inventory.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : lowStock.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                All products are comfortably stocked.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {lowStock.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground">{item.sku}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                      {item.stock}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </PageSection>
        </div>
      </div>
    </div>
  );
}
