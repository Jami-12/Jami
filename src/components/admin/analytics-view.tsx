"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Boxes, Receipt, TrendingUp, Users } from "lucide-react";

import { PageSection } from "@/components/dashboard/page-section";
import { StatCard } from "@/components/dashboard/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { analyticsApi } from "@/lib/api/services";
import { formatCompact, formatCurrency, formatDate, formatNumber, humanizeEnum } from "@/lib/utils";

const PALETTE = ["#AC8A4F", "#244B50", "#C6A46A", "#3E6266", "#dfc48e", "#8C6C3A"];

const axisProps = {
  stroke: "var(--muted-foreground)",
  fontSize: 10,
  tickLine: false,
  axisLine: false,
} as const;

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--card)",
  fontSize: 12,
  color: "var(--foreground)",
} as const;

export function AnalyticsView() {
  const query = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: analyticsApi.overview,
    staleTime: 60_000,
  });

  const data = query.data;

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <PageSection>
        <p className="py-10 text-center text-sm text-muted-foreground">
          Analytics could not be loaded. Refresh to try again.
        </p>
      </PageSection>
    );
  }

  const daily = data.dailySales.map((point) => ({
    ...point,
    label: formatDate(point.date, "short"),
  }));

  const monthly = data.monthlySales.map((point) => ({
    ...point,
    label: point.month,
  }));

  const payments = data.paymentMethodBreakdown.map((method) => ({
    ...method,
    label: humanizeEnum(method.method),
  }));

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={formatCurrency(data.revenue.total)}
          hint={`Avg order ${formatCurrency(data.revenue.averageOrderValue)}`}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          label="Orders"
          value={formatNumber(data.totals.orders)}
          hint={`${data.orderStatusBreakdown.find((row) => row.status === "DELIVERED")?.count ?? 0} delivered`}
          icon={Receipt}
        />
        <StatCard
          label="Customers"
          value={formatNumber(data.totals.customers)}
          hint={`${formatNumber(data.totals.activeUsers)} active users`}
          icon={Users}
          tone="accent"
        />
        <StatCard
          label="Products"
          value={formatNumber(data.totals.products)}
          hint={`${formatNumber(data.totals.productsWithActiveDiscounts)} on discount`}
          icon={Boxes}
        />
      </div>

      <PageSection
        title="Daily revenue"
        description={`Generated ${formatDate(data.generatedAt, "long")}`}
      >
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={daily} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C6A46A" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#C6A46A" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={(value: number) => formatCompact(value)} width={46} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#AC8A4F"
                strokeWidth={2}
                fill="url(#revenue-fill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </PageSection>

      <div className="grid gap-5 xl:grid-cols-2">
        <PageSection title="Monthly sales" description="Revenue and order volume by month.">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis {...axisProps} tickFormatter={(value: number) => formatCompact(value)} width={46} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => [
                    name === "revenue" ? formatCurrency(Number(value)) : formatNumber(Number(value)),
                    name === "revenue" ? "Revenue" : "Orders",
                  ]}
                />
                <Bar dataKey="revenue" fill="#244B50" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PageSection>

        <PageSection title="Payment mix" description="Revenue by payment method.">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={payments}
                  dataKey="revenue"
                  nameKey="label"
                  innerRadius={48}
                  outerRadius={82}
                  paddingAngle={2}
                >
                  {payments.map((entry, index) => (
                    <Cell key={entry.method} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </PageSection>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <PageSection title="Order status" description="Where orders currently sit.">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.orderStatusBreakdown.map((row) => ({
                  ...row,
                  label: humanizeEnum(row.status),
                }))}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 16, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" {...axisProps} allowDecimals={false} />
                <YAxis type="category" dataKey="label" {...axisProps} width={82} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#AC8A4F" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PageSection>

        <PageSection title="Recent orders" description="Latest storefront activity.">
          <ul className="divide-y divide-border">
            {data.recentOrders.slice(0, 7).map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate font-mono text-[11px] font-bold">{order.orderNumber}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {order.customerName} · {formatDate(order.createdAt, "short")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold">{formatCurrency(order.totalAmount)}</p>
                  <p className="text-[10px] text-muted-foreground">{humanizeEnum(order.status)}</p>
                </div>
              </li>
            ))}
          </ul>
        </PageSection>
      </div>

      {data.lowStockProducts.length > 0 ? (
        <PageSection title="Low stock attention" description="Products approaching or at zero stock.">
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.lowStockProducts.map((product) => (
              <li
                key={product.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold">{product.title}</p>
                  <p className="text-[11px] text-muted-foreground">{product.sku}</p>
                </div>
                <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                  {product.stock}
                </span>
              </li>
            ))}
          </ul>
        </PageSection>
      ) : null}
    </div>
  );
}
