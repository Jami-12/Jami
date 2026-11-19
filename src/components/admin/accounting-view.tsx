"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Calculator,
  Receipt,
  TrendingUp,
} from "lucide-react";

import { DataTable, type DataColumn } from "@/components/dashboard/data-table";
import { ListPagination } from "@/components/dashboard/list-pagination";
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
import { FormField, Input, Select } from "@/components/ui/input";
import { Price } from "@/components/ui/price";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { accountingApi } from "@/lib/api/services";
import { EXPENSE_CATEGORY_LABEL } from "@/lib/constants";
import { formatCompact, formatDate, formatPercent, isoDate } from "@/lib/utils";
import type { ReportPoint } from "@/types";

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

function startOfMonth(): string {
  const now = new Date();
  return isoDate(new Date(now.getFullYear(), now.getMonth(), 1));
}

const reportColumns: DataColumn<ReportPoint>[] = [
  {
    header: "Period",
    cell: (point) => <span className="text-xs font-semibold">{point.period}</span>,
  },
  {
    header: "Income",
    cell: (point) => <Price amount={point.income} size="xs" />,
    className: "text-right",
    headerClassName: "text-right",
  },
  {
    header: "Refunds",
    cell: (point) => <Price amount={-point.refunds} size="xs" />,
    className: "text-right",
    headerClassName: "text-right",
  },
  {
    header: "COGS",
    cell: (point) => <Price amount={-point.cogs} size="xs" />,
    className: "text-right",
    headerClassName: "text-right",
  },
  {
    header: "Operating",
    cell: (point) => <Price amount={-point.operatingExpenses} size="xs" />,
    className: "text-right",
    headerClassName: "text-right",
  },
  {
    header: "Purchases",
    cell: (point) => <Price amount={-point.productPurchases} size="xs" />,
    className: "text-right",
    headerClassName: "text-right",
  },
  {
    header: "Net profit",
    cell: (point) => (
      <span
        className={
          point.netProfit >= 0
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-red-600 dark:text-red-400"
        }
      >
        <Price amount={point.netProfit} size="xs" />
      </span>
    ),
    className: "text-right",
    headerClassName: "text-right",
  },
];

export function AccountingView() {
  const [startDate, setStartDate] = React.useState(startOfMonth);
  const [endDate, setEndDate] = React.useState(() => isoDate(new Date()));
  const [granularity, setGranularity] = React.useState<"day" | "month">("day");
  const [preset, setPreset] = React.useState("month");
  const [breakdownPage, setBreakdownPage] = React.useState(1);
  const [breakdownLimit, setBreakdownLimit] = React.useState(10);

  const rangeValid = Boolean(startDate && endDate && startDate <= endDate);

  const summary = useQuery({
    queryKey: ["accounting", "summary", startDate, endDate],
    queryFn: () => accountingApi.summary(startDate, endDate),
    enabled: rangeValid,
  });

  const report = useQuery({
    queryKey: ["accounting", "report", startDate, endDate, granularity],
    queryFn: () => accountingApi.report({ startDate, endDate, granularity }),
    enabled: rangeValid,
  });

  const applyPreset = (value: string) => {
    setPreset(value);
    const now = new Date();
    if (value === "today") {
      setStartDate(isoDate(now));
      setEndDate(isoDate(now));
      setGranularity("day");
    } else if (value === "week") {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      setStartDate(isoDate(start));
      setEndDate(isoDate(now));
      setGranularity("day");
    } else if (value === "month") {
      setStartDate(startOfMonth());
      setEndDate(isoDate(now));
      setGranularity("day");
    } else if (value === "quarter") {
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      setStartDate(isoDate(start));
      setEndDate(isoDate(now));
      setGranularity("month");
    } else if (value === "year") {
      setStartDate(isoDate(new Date(now.getFullYear(), 0, 1)));
      setEndDate(isoDate(now));
      setGranularity("month");
    }
  };

  const financial = summary.data;
  const breakdown = report.data?.breakdown ?? [];
  const chartData = breakdown.map((point) => ({
    ...point,
    label: granularity === "month" ? point.period : formatDate(point.period, "short"),
  }));

  const breakdownPages = Math.max(1, Math.ceil(breakdown.length / breakdownLimit));
  const safeBreakdownPage = Math.min(breakdownPage, breakdownPages);
  const pagedBreakdown = breakdown.slice(
    (safeBreakdownPage - 1) * breakdownLimit,
    safeBreakdownPage * breakdownLimit,
  );

  React.useEffect(() => {
    setBreakdownPage(1);
  }, [startDate, endDate, granularity, breakdownLimit]);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Financial control
            </p>
            <CardTitle className="font-display text-xl sm:text-2xl">Accounting</CardTitle>
            <CardDescription>
              Profit, expenses and report lines for any period you choose.
            </CardDescription>
          </div>
          <Badge tone={rangeValid ? "success" : "warning"} dot>
            {rangeValid ? "Range active" : "Invalid range"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FormField label="Start date" htmlFor="accounting-start">
              <Input
                id="accounting-start"
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(event) => {
                  setPreset("custom");
                  setStartDate(event.target.value);
                }}
              />
            </FormField>
            <FormField label="End date" htmlFor="accounting-end">
              <Input
                id="accounting-end"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => {
                  setPreset("custom");
                  setEndDate(event.target.value);
                }}
              />
            </FormField>
            <FormField label="Granularity" htmlFor="accounting-granularity">
              <Select
                id="accounting-granularity"
                value={granularity}
                onChange={(event) => setGranularity(event.target.value as "day" | "month")}
              >
                <option value="day">Daily</option>
                <option value="month">Monthly</option>
              </Select>
            </FormField>
            <FormField label="Quick range" htmlFor="accounting-preset">
              <Select
                id="accounting-preset"
                value={preset}
                onChange={(event) => applyPreset(event.target.value)}
              >
                <option value="today">Today</option>
                <option value="week">Last 7 days</option>
                <option value="month">This month</option>
                <option value="quarter">Last 3 months</option>
                <option value="year">This year</option>
                <option value="custom">Custom</option>
              </Select>
            </FormField>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs
              items={[
                { value: "day", label: "Daily view" },
                { value: "month", label: "Monthly view" },
              ]}
              value={granularity}
              onChange={(value) => setGranularity(value as "day" | "month")}
            />
            <p className="text-xs text-muted-foreground">
              {rangeValid
                ? `${formatDate(startDate, "long").split(",")[0]} → ${formatDate(endDate, "long").split(",")[0]}`
                : "Choose a valid date range."}
            </p>
          </div>
        </CardContent>
      </Card>

      {summary.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Net revenue"
            value={<Price amount={financial?.revenue.net ?? 0} size="lg" />}
            hint={`${financial?.orders.paidCount ?? 0} paid orders · ${financial?.orders.itemsSold ?? 0} items`}
            icon={Banknote}
            tone="success"
          />
          <StatCard
            label="Gross profit"
            value={<Price amount={financial?.grossProfit ?? 0} size="lg" />}
            hint={`COGS ${formatCompact(financial?.cogs ?? 0)}`}
            icon={TrendingUp}
          />
          <StatCard
            label="Expenses"
            value={<Price amount={financial?.expenses.total ?? 0} size="lg" />}
            hint={`Operating ${formatCompact(financial?.expenses.operating ?? 0)}`}
            icon={Receipt}
            tone="warning"
          />
          <StatCard
            label="Net profit"
            value={<Price amount={financial?.netProfit ?? 0} size="lg" />}
            hint={`${formatPercent(financial?.netProfitMargin ?? 0)} margin`}
            icon={financial?.isProfit === false ? ArrowDownRight : ArrowUpRight}
            tone={financial?.isProfit === false ? "danger" : "success"}
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Profit &amp; loss</CardTitle>
          <CardDescription>
            {rangeValid
              ? `${granularity === "month" ? "Monthly" : "Daily"} breakdown for the selected period.`
              : "Select a valid range to load the report."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {report.isLoading ? (
            <Skeleton className="h-72 w-full rounded-2xl" />
          ) : report.isError ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              The report could not be loaded. Adjust the range and try again.
            </p>
          ) : chartData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No financial activity in this period.
            </p>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="accounting-profit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" {...axisProps} />
                  <YAxis
                    {...axisProps}
                    tickFormatter={(value: number) => formatCompact(value)}
                    width={48}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#C6A46A"
                    strokeWidth={2}
                    fill="url(#accounting-profit)"
                  />
                  <Area
                    type="monotone"
                    dataKey="netProfit"
                    name="Net profit"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Period breakdown</CardTitle>
            <CardDescription>Every line of the profit and loss statement.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-4 sm:px-0">
            <DataTable
              columns={reportColumns}
              rows={pagedBreakdown}
              getKey={(point) => point.period}
              loading={report.isLoading}
              empty="No report rows for this period."
            />
            {breakdown.length > 0 ? (
              <div className="px-4 sm:px-5">
                <ListPagination
                  page={safeBreakdownPage}
                  pageCount={breakdownPages}
                  totalItems={breakdown.length}
                  pageSize={breakdownLimit}
                  onPageChange={setBreakdownPage}
                  onPageSizeChange={setBreakdownLimit}
                />
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Expense mix</CardTitle>
            <CardDescription>Operating spend by category.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.isLoading ? (
              <Skeleton className="h-56 w-full rounded-xl" />
            ) : (financial?.expenseBreakdown ?? []).length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No expenses recorded.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(financial?.expenseBreakdown ?? []).map((row) => ({
                        ...row,
                        label:
                          EXPENSE_CATEGORY_LABEL[
                            row.category as keyof typeof EXPENSE_CATEGORY_LABEL
                          ] ?? row.category,
                      }))}
                      layout="vertical"
                      margin={{ top: 4, right: 12, left: 8, bottom: 4 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        {...axisProps}
                        tickFormatter={(value: number) => formatCompact(value)}
                      />
                      <YAxis type="category" dataKey="label" {...axisProps} width={104} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="total" fill="#8C6C3A" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <Separator />
                <ul className="divide-y divide-border">
                  {(financial?.expenseBreakdown ?? []).map((row) => (
                    <li key={row.category} className="flex items-center justify-between gap-3 py-2">
                      <span className="text-xs font-semibold">
                        {EXPENSE_CATEGORY_LABEL[
                          row.category as keyof typeof EXPENSE_CATEGORY_LABEL
                        ] ?? row.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {row.count} · <Price amount={row.total} size="xs" />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Investment &amp; capital</CardTitle>
          <CardDescription>Capital added during this period.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Investments
              </p>
              <p className="mt-1 text-lg font-extrabold">
                <Price amount={financial?.investments ?? 0} size="md" />
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Sales value
              </p>
              <p className="mt-1 text-lg font-extrabold">
                <Price amount={financial?.orders.salesValue ?? 0} size="md" />
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Refunds
              </p>
              <p className="mt-1 text-lg font-extrabold">
                <Price amount={-(financial?.revenue.refunds ?? 0)} size="md" />
              </p>
            </div>
            <div className="ml-auto">
              <Button asChild variant="outline" size="sm">
                <Link href="/super-admin/transactions">
                  <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
                  Open ledger
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
