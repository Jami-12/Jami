"use client";

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

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type DataColumn } from "@/components/dashboard/data-table";
import { PageSection } from "@/components/dashboard/page-section";
import { StatCard } from "@/components/dashboard/stat-card";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { Price } from "@/components/ui/price";
import { Skeleton } from "@/components/ui/skeleton";
import { notificationsApi, ordersApi } from "@/lib/api/services";
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

const notificationTones: Record<string, string> = {
  ORDER: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
  PAYMENT: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  PRODUCT: "bg-accent-100 text-accent-800 dark:bg-accent-300/10 dark:text-accent-200",
  SYSTEM: "bg-muted text-muted-foreground",
  ACCOUNT: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
};

export function AccountOverview() {
  const user = useAuthStore((state) => state.user);
  const wishlistCount = useWishlistStore((state) => state.ids.length);

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
  const loading = recentOrders.isLoading || notifications.isLoading;

  return (
    <div className="space-y-5">
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

        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Avatar name={user?.name ?? "Account"} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-base font-extrabold">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Member since {formatDate(user?.createdAt)}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
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
          </Card>

          <PageSection
            title="Notifications"
            description={notifications.data ? `${notifications.data.unreadCount} unread` : undefined}
            actions={
              <Button asChild variant="ghost" size="sm">
                <Link href="/account/notifications">View all</Link>
              </Button>
            }
          >
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <Bell className="mx-auto mb-2 h-5 w-5" aria-hidden="true" />
                No notifications yet.
              </div>
            ) : (
              <ul className="space-y-3">
                {alerts.map((notification: Notification) => (
                  <li key={notification.id} className="flex gap-3">
                    <span
                      className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        notificationTones[notification.type] ?? notificationTones.SYSTEM
                      }`}
                    >
                      <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
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
                ))}
              </ul>
            )}
          </PageSection>
        </div>
      </div>
    </div>
  );
}
