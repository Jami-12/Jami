"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Boxes,
  Receipt,
  TrendingDown,
  TrendingUp,
  Users,
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Customers"
          value={dashboard?.management.users.customers ?? "—"}
          hint={`${dashboard?.management.users.newThisMonth ?? 0} new this month`}
          icon={Users}
        />
        <StatCard
          label="Products"
          value={dashboard?.management.products.total ?? "—"}
          hint={`${dashboard?.management.products.active ?? 0} active`}
          icon={Receipt}
        />
        <StatCard
          label="Unpaid bills"
          value={<Price amount={dashboard?.bills.unpaidTotal ?? 0} size="lg" />}
          hint={`${dashboard?.bills.overdueCount ?? 0} overdue`}
          icon={ArrowDownRight}
          tone={dashboard?.bills.overdueCount ? "danger" : "warning"}
        />
        <StatCard
          label="Monthly payroll"
          value={<Price amount={dashboard?.employees.monthlyPayroll ?? 0} size="lg" />}
          hint={`${dashboard?.employees.active ?? 0} active employees`}
          icon={Banknote}
          tone="accent"
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
        </div>
      </div>

      <PageSection title="Management" description="Where to go next.">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/super-admin/analytics", label: "Analytics", icon: TrendingUp },
            { href: "/super-admin/users", label: "Users & roles", icon: Users },
            { href: "/super-admin/salaries", label: "Payroll", icon: Banknote },
            { href: "/super-admin/audit", label: "Audit trail", icon: ArrowUpRight },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 text-sm font-semibold transition hover:border-primary-300 hover:bg-muted/40"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-primary-600 dark:text-accent-300">
                <action.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              {action.label}
            </Link>
          ))}
        </div>
      </PageSection>
    </div>
  );
}
