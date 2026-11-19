"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Banknote,
  Boxes,
  TrendingDown,
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
import { accountingApi } from "@/lib/api/services";
import { PAYMENT_METHOD_META } from "@/lib/constants";
import { formatDate, humanizeEnum } from "@/lib/utils";
import type { FinancialTransaction } from "@/types";

const transactionColumns: DataColumn<FinancialTransaction>[] = [
  {
    header: "Transaction",
    cell: (transaction) => (
      <div className="min-w-0">
        <p className="text-xs font-bold">{humanizeEnum(transaction.category)}</p>
        <p className="max-w-64 truncate text-[11px] text-muted-foreground">
          {transaction.description || transaction.referenceType || "—"}
        </p>
      </div>
    ),
  },
  {
    header: "Type",
    cell: (transaction) => (
      <Badge
        tone={
          transaction.transactionType === "INCOME"
            ? "success"
            : transaction.transactionType === "INVESTMENT"
              ? "accent"
              : "warning"
        }
        dot
      >
        {humanizeEnum(transaction.transactionType)}
      </Badge>
    ),
  },
  {
    header: "Date",
    cell: (transaction) => (
      <span className="text-[11px] text-muted-foreground">{formatDate(transaction.date)}</span>
    ),
  },
  {
    header: "Amount",
    cell: (transaction) => (
      <Price
        amount={transaction.transactionType === "INCOME" ? transaction.amount : -transaction.amount}
        size="sm"
      />
    ),
    className: "text-right",
    headerClassName: "text-right",
  },
];

export function SuperOverview() {
  const query = useQuery({
    queryKey: ["accounting", "dashboard"],
    queryFn: accountingApi.dashboard,
    staleTime: 60_000,
  });

  const dashboard = query.data;

  return (
    <div className="space-y-5">
      <Card className="bg-muted/30">
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Business pulse
            </p>
            <CardTitle className="font-display text-xl sm:text-2xl">
              Profit, capital and operations
            </CardTitle>
            <CardDescription>
              A financial snapshot of the business with the latest ledger activity.
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/super-admin/analytics">
              View analytics
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's net profit"
          value={<Price amount={dashboard?.today.netProfit ?? 0} size="lg" />}
          hint={`${dashboard?.today.orders.paidCount ?? 0} paid orders`}
          icon={dashboard?.today.isProfit === false ? TrendingDown : TrendingUp}
          tone={dashboard?.today.isProfit === false ? "danger" : "success"}
        />
        <StatCard
          label="This month"
          value={<Price amount={dashboard?.thisMonth.netProfit ?? 0} size="lg" />}
          hint={`${dashboard?.thisMonth.netProfitMargin ?? 0}% margin`}
          icon={Banknote}
          tone="accent"
        />
        <StatCard
          label="Revenue this year"
          value={<Price amount={dashboard?.thisYear.revenue.net ?? 0} size="lg" />}
          hint={`${dashboard?.thisYear.orders.paidCount ?? 0} paid orders`}
          icon={Wallet}
        />
        <StatCard
          label="Inventory cost"
          value={<Price amount={dashboard?.inventory.inventoryCostValue ?? 0} size="lg" />}
          hint={`${dashboard?.inventory.lowStockCount ?? 0} low stock`}
          icon={Boxes}
          tone="warning"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="font-display text-base">Recent transactions</CardTitle>
              <CardDescription>Latest entries in the accounting ledger.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/super-admin/transactions">
                All transactions
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-2 sm:px-0">
            <DataTable
              columns={transactionColumns}
              rows={dashboard?.recentTransactions ?? []}
              getKey={(transaction) => transaction.id}
              loading={query.isLoading}
              empty="No transactions recorded yet."
            />
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">Week in review</CardTitle>
              <CardDescription>Profit and loss at a glance.</CardDescription>
            </CardHeader>
            <CardContent>
              {query.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Metric</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-xs text-muted-foreground">Revenue</TableCell>
                      <TableCell className="text-right font-bold">
                        <Price amount={dashboard?.today.revenue.net ?? 0} size="sm" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-xs text-muted-foreground">Cost of goods</TableCell>
                      <TableCell className="text-right font-bold">
                        <Price amount={dashboard?.today.cogs ?? 0} size="sm" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-xs text-muted-foreground">
                        Operating expenses
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        <Price amount={dashboard?.today.expenses.operating ?? 0} size="sm" />
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableCell className="font-bold">Net profit</TableCell>
                      <TableCell className="text-right font-extrabold">
                        <Price amount={dashboard?.today.netProfit ?? 0} size="sm" />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">Payment methods</CardTitle>
              <CardDescription>Share of recent payments.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Count / total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(dashboard?.paymentMethods ?? []).map((method) => (
                    <TableRow key={method.method}>
                      <TableCell className="text-xs font-semibold">
                        {PAYMENT_METHOD_META[method.method].label}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {method.count} · <Price amount={method.total} size="xs" />
                      </TableCell>
                    </TableRow>
                  ))}
                  {(dashboard?.paymentMethods ?? []).length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={2} className="py-6 text-center text-xs text-muted-foreground">
                        No payments yet.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">Operations</CardTitle>
              <CardDescription>Customers, catalogue and overheads.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-xs text-muted-foreground">Customers</TableCell>
                    <TableCell className="text-right font-bold">
                      {dashboard?.management.users.customers ?? "—"}
                      <span className="ml-1.5 text-[11px] font-medium text-muted-foreground">
                        +{dashboard?.management.users.newThisMonth ?? 0} new
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs text-muted-foreground">Products</TableCell>
                    <TableCell className="text-right font-bold">
                      {dashboard?.management.products.total ?? "—"}
                      <span className="ml-1.5 text-[11px] font-medium text-muted-foreground">
                        {dashboard?.management.products.active ?? 0} active
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs text-muted-foreground">Unpaid bills</TableCell>
                    <TableCell className="text-right font-bold">
                      <Price amount={dashboard?.bills.unpaidTotal ?? 0} size="sm" />
                      <span className="ml-1.5 text-[11px] font-medium text-muted-foreground">
                        {dashboard?.bills.overdueCount ?? 0} overdue
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs text-muted-foreground">Monthly payroll</TableCell>
                    <TableCell className="text-right font-bold">
                      <Price amount={dashboard?.employees.monthlyPayroll ?? 0} size="sm" />
                      <span className="ml-1.5 text-[11px] font-medium text-muted-foreground">
                        {dashboard?.employees.active ?? 0} active
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
