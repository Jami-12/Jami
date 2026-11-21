"use client";

import * as React from "react";
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

import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { analyticsApi } from "@/lib/api/services";
import { formatCompact, formatCurrency, formatDate, formatNumber, humanizeEnum } from "@/lib/utils";

const PALETTE = [
 "var(--chart-1)",
 "var(--chart-2)",
 "var(--chart-3)",
 "var(--chart-4)",
 "var(--chart-5)",
];

const axisProps = {
  stroke: "var(--muted-foreground)",
  fontSize: 10,
  tickLine: false,
  axisLine: false,
} as const;

const tooltipStyle = {
  borderRadius: 0,
  border: "1px solid var(--border)",
  background: "var(--card)",
  boxShadow: "none",
  fontSize: 12,
  color: "var(--foreground)",
} as const;

export function AnalyticsView() {
  const [monthlyMetric, setMonthlyMetric] = React.useState<"revenue" | "orders">("revenue");
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
            <Skeleton key={index} className="h-24 w-full rounded-none" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-none" />
        <div className="grid gap-5 xl:grid-cols-2">
          <Skeleton className="h-72 w-full rounded-none" />
          <Skeleton className="h-72 w-full rounded-none" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Analytics could not be loaded. Refresh to try again.
        </CardContent>
      </Card>
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

  const delivered =
    data.orderStatusBreakdown.find((row) => row.status === "DELIVERED")?.count ?? 0;

  return (
    <div className="space-y-5">
      <Card className="bg-muted">
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Insights
            </p>
            <CardTitle className="font-display text-xl not-italic sm:text-2xl">Analytics overview</CardTitle>
            <CardDescription>Generated {formatDate(data.generatedAt, "long")}.</CardDescription>
          </div>
          <Badge tone="success" dot>
            Live data
          </Badge>
        </CardHeader>
      </Card>

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
          hint={`${delivered} delivered`}
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

      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="font-display text-base">Daily revenue</CardTitle>
            <CardDescription>Revenue generated over the latest window.</CardDescription>
          </div>
          <Badge tone="neutral">Last {daily.length} days</Badge>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis
                  {...axisProps}
                  tickFormatter={(value: number) => formatCompact(value)}
                  width={46}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="var(--chart-1)"
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="font-display text-base">Monthly sales</CardTitle>
              <CardDescription>Revenue and order volume by month.</CardDescription>
            </div>
            <Tabs
              items={[
                { value: "revenue", label: "Revenue" },
                { value: "orders", label: "Orders" },
              ]}
              value={monthlyMetric}
              onChange={(value) => setMonthlyMetric(value as "revenue" | "orders")}
            />
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" {...axisProps} />
                  <YAxis
                    {...axisProps}
                    tickFormatter={(value: number) =>
                      monthlyMetric === "revenue" ? formatCompact(value) : formatNumber(value)
                    }
                    width={46}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) =>
                      monthlyMetric === "revenue"
                        ? [formatCurrency(Number(value)), "Revenue"]
                        : [formatNumber(Number(value)), "Orders"]
                    }
                  />
                  <Bar
                    dataKey={monthlyMetric}
                    fill={monthlyMetric === "revenue" ? "var(--chart-1)" : "var(--chart-3)"}
                    radius={0}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Payment mix</CardTitle>
            <CardDescription>Revenue by payment method.</CardDescription>
          </CardHeader>
          <CardContent>
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
                    stroke="var(--border)"
                    strokeWidth={1}
                  >
                    {payments.map((entry, index) => (
                      <Cell key={entry.method} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Order status</CardTitle>
            <CardDescription>Where orders currently sit.</CardDescription>
          </CardHeader>
          <CardContent>
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
                  <Bar dataKey="count" fill="var(--chart-3)" radius={0} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="font-display text-base">Recent orders</CardTitle>
              <CardDescription>Latest storefront activity.</CardDescription>
            </div>
            <Badge tone="neutral">{data.recentOrders.length} shown</Badge>
          </CardHeader>
          <CardContent className="px-0 sm:px-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentOrders.slice(0, 7).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="truncate font-mono text-[11px] font-bold">
                          {order.orderNumber}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {order.customerName} · {formatDate(order.createdAt, "short")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge tone="neutral">{humanizeEnum(order.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs font-bold">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                  </TableRow>
                ))}
                {data.recentOrders.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={3} className="py-8 text-center text-xs text-muted-foreground">
                      No recent orders.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {data.lowStockProducts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Low stock attention</CardTitle>
            <CardDescription>Products approaching or at zero stock.</CardDescription>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.lowStockProducts.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-3 rounded-none border border-border bg-muted p-3 transition-colors hover:border-foreground"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">{product.title}</p>
                    <p className="text-[11px] text-muted-foreground">{product.sku}</p>
                  </div>
                  <Badge tone={product.stock === 0 ? "danger" : "warning"}>{product.stock} left</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
