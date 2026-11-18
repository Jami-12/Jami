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
import { PageSection } from "@/components/dashboard/page-section";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { Skeleton } from "@/components/ui/skeleton";
import { accountingApi } from "@/lib/api/services";
import { PAYMENT_METHOD_META } from "@/lib/constants";
import { formatDate, humanizeEnum } from "@/lib/utils";
import type { FinancialTransaction } from "@/types";

const transactionColumns: DataColumn<FinancialTransaction>[] = [
  {
    header: "Transaction",
    cell: (transaction) => (
      <div>
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
        <PageSection
          title="Recent transactions"
          description="Latest entries in the accounting ledger."
          actions={
            <Button asChild variant="outline" size="sm">
              <Link href="/super-admin/transactions">
                All transactions
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          }
        >
          <DataTable
            columns={transactionColumns}
            rows={dashboard?.recentTransactions ?? []}
            getKey={(transaction) => transaction.id}
            loading={query.isLoading}
            empty="No transactions recorded yet."
          />
        </PageSection>

        <div className="space-y-5">
          <PageSection title="Week in review" description="Profit and loss at a glance.">
            {query.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Revenue</dt>
                  <dd className="font-bold">
                    <Price amount={dashboard?.today.revenue.net ?? 0} size="sm" />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Cost of goods</dt>
                  <dd className="font-bold">
                    <Price amount={dashboard?.today.cogs ?? 0} size="sm" />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Operating expenses</dt>
                  <dd className="font-bold">
                    <Price amount={dashboard?.today.expenses.operating ?? 0} size="sm" />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-border pt-2">
                  <dt className="font-bold">Net profit</dt>
                  <dd className="font-extrabold">
                    <Price amount={dashboard?.today.netProfit ?? 0} size="sm" />
                  </dd>
                </div>
              </dl>
            )}
          </PageSection>

          <PageSection title="Payment methods" description="Share of recent payments.">
            <ul className="space-y-2.5">
              {(dashboard?.paymentMethods ?? []).map((method) => (
                <li key={method.method} className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold">
                    {PAYMENT_METHOD_META[method.method].label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {method.count} · <Price amount={method.total} size="xs" />
                  </span>
                </li>
              ))}
              {(dashboard?.paymentMethods ?? []).length === 0 ? (
                <li className="py-3 text-center text-xs text-muted-foreground">No payments yet.</li>
              ) : null}
            </ul>
          </PageSection>
          <PageSection title="Operations" description="Customers, catalogue and overheads.">
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Customers</dt>
                <dd className="font-bold">
                  {dashboard?.management.users.customers ?? "—"}
                  <span className="ml-1.5 text-[11px] font-medium text-muted-foreground">
                    +{dashboard?.management.users.newThisMonth ?? 0} new
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Products</dt>
                <dd className="font-bold">
                  {dashboard?.management.products.total ?? "—"}
                  <span className="ml-1.5 text-[11px] font-medium text-muted-foreground">
                    {dashboard?.management.products.active ?? 0} active
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Unpaid bills</dt>
                <dd className="font-bold">
                  <Price amount={dashboard?.bills.unpaidTotal ?? 0} size="sm" />
                  <span className="ml-1.5 text-[11px] font-medium text-muted-foreground">
                    {dashboard?.bills.overdueCount ?? 0} overdue
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Monthly payroll</dt>
                <dd className="font-bold">
                  <Price amount={dashboard?.employees.monthlyPayroll ?? 0} size="sm" />
                  <span className="ml-1.5 text-[11px] font-medium text-muted-foreground">
                    {dashboard?.employees.active ?? 0} active
                  </span>
                </dd>
              </div>
            </dl>
          </PageSection>
        </div>
      </div>
    </div>
  );
}
