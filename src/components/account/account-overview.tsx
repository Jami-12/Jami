"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Bell,
  Heart,
  MapPin,
  Package,
  Receipt,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { DataTable, type DataColumn } from "@/components/dashboard/data-table";
import { PageSection } from "@/components/dashboard/page-section";
import { StatCard } from "@/components/dashboard/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { Price } from "@/components/ui/price";
import { Tabs } from "@/components/ui/tabs";
import { notificationsApi, ordersApi } from "@/lib/api/services";
import { NOTIFICATION_META, ROLE_META } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { Notification, Order } from "@/types";

const orderColumns: DataColumn<Order>[] = [
  {
    header: "Order",
    cell: (order) => (
      <div>
        <Link
          href={`/account/orders/${order.id}`}
          className="font-semibold hover:underline"
        >
          {order.orderNumber}
        </Link>
        <p className="text-[11px] text-muted-foreground">{formatDate(order.createdAt)}</p>
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

const ACTIVITY_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "UNREAD", label: "Unread" },
] as const;

export function AccountOverview() {
  const user = useAuthStore((state) => state.user);
  const wishlistCount = useWishlistStore((state) => state.ids.length);
  const [activityFilter, setActivityFilter] = React.useState("ALL");

  const recentOrders = useQuery({
    queryKey: ["orders", "recent"],
    queryFn: () => ordersApi.myOrders({ limit: 5, sortOrder: "desc" }),
    staleTime: 30_000,
  });

  const pendingPayment = useQuery({
    queryKey: ["orders", "pending-payment"],
    queryFn: () => ordersApi.myOrders({ limit: 1, paymentStatus: "PENDING" }),
    staleTime: 30_000,
  });

  const inTransit = useQuery({
    queryKey: ["orders", "in-transit"],
    queryFn: () => ordersApi.myOrders({ limit: 1, status: "SHIPPED" }),
    staleTime: 30_000,
  });

  const notifications = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: () => notificationsApi.list({ limit: 4 }),
    staleTime: 30_000,
  });

  const orders = recentOrders.data?.items ?? [];
  const alerts = notifications.data?.items ?? [];
  const unread = notifications.data?.unreadCount ?? 0;
  const loading = recentOrders.isLoading || notifications.isLoading;
  const visibleAlerts =
    activityFilter === "UNREAD" ? alerts.filter((item) => !item.isRead) : alerts;
  const roleMeta = user ? ROLE_META[user.role] : null;

  return (
    <div className="space-y-5">
      <Card className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full bg-accent-300/20 blur-3xl dark:bg-accent-300/10"
          aria-hidden="true"
        />
        <CardContent className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar name={user?.name ?? "Account"} src={user?.image} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-display text-xl font-semibold">
                  {user?.name ?? "Your account"}
                </p>
                {roleMeta ? <Badge tone={roleMeta.tone}>{roleMeta.label}</Badge> : null}
              </div>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Member since {formatDate(user?.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/account/profile">
                <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                Edit profile
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/account/addresses">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                Addresses
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total orders"
          value={recentOrders.data?.meta.total ?? "—"}
          hint="Placed from this account"
          icon={Receipt}
        />
        <StatCard
          label="Awaiting payment"
          value={pendingPayment.data?.meta.total ?? "—"}
          hint="Complete online payments"
          icon={Package}
          tone="warning"
        />
        <StatCard
          label="In transit"
          value={inTransit.data?.meta.total ?? "—"}
          hint="Shipped and on the way"
          icon={ShieldCheck}
          tone="accent"
        />
        <StatCard
          label="Saved pieces"
          value={wishlistCount}
          hint="Wishlist items"
          icon={Heart}
          tone="success"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <PageSection
          title="Recent orders"
          description="The latest activity on your account."
          actions={
            <Button asChild variant="outline" size="sm">
              <Link href="/account/orders">
                All orders
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          }
        >
          <DataTable
            columns={orderColumns}
            rows={orders}
            getKey={(order) => order.id}
            loading={recentOrders.isLoading}
            empty="No orders yet. Your first order will appear here."
          />
        </PageSection>

        <PageSection
          title="Notifications"
          description={notifications.data ? `${unread} unread` : "Loading…"}
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link href="/account/notifications">View all</Link>
            </Button>
          }
        >
          <Tabs
            items={[
              { ...ACTIVITY_FILTERS[0] },
              { ...ACTIVITY_FILTERS[1], count: unread },
            ]}
            value={activityFilter}
            onChange={setActivityFilter}
            className="mb-4 w-full sm:w-auto"
          />
          <Separator className="mb-2" />

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ) : visibleAlerts.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              <Bell className="mx-auto mb-2 h-5 w-5" aria-hidden="true" />
              {activityFilter === "UNREAD" ? "Nothing unread right now." : "No notifications yet."}
            </div>
          ) : (
            <ul className="space-y-3">
              {visibleAlerts.map((notification: Notification) => {
                const meta =
                  NOTIFICATION_META[notification.type] ?? NOTIFICATION_META.SYSTEM;
                return (
                  <li key={notification.id} className="flex gap-3">
                    <Badge tone={meta.tone} className="mt-0.5 h-8 w-8 shrink-0 justify-center px-0">
                      <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-xs font-bold">{notification.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </PageSection>
      </div>
    </div>
  );
}
