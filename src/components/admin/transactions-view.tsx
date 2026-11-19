"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownCircle, ArrowUpCircle, Download, Search } from "lucide-react";

import { DataTable, type DataColumn } from "@/components/dashboard/data-table";
import { ListPagination } from "@/components/dashboard/list-pagination";
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
import { StatCard } from "@/components/dashboard/stat-card";
import { Tabs } from "@/components/ui/tabs";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { accountingApi } from "@/lib/api/services";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABEL } from "@/lib/constants";
import { formatDate, humanizeEnum, isoDate } from "@/lib/utils";
import type { FinancialTransaction, TransactionType } from "@/types";

const TYPES: TransactionType[] = [
  "INCOME",
  "EXPENSE",
  "INVESTMENT",
  "WITHDRAWAL",
  "REFUND",
];

const TYPE_TONE: Record<TransactionType, "success" | "warning" | "accent" | "danger" | "info"> = {
  INCOME: "success",
  EXPENSE: "warning",
  INVESTMENT: "accent",
  WITHDRAWAL: "danger",
  REFUND: "info",
};

const CATEGORY_OPTIONS = [
  "SALES_REVENUE",
  "SALES_REFUND",
  "INVESTMENT",
  ...EXPENSE_CATEGORIES,
];

function categoryLabel(category: string): string {
  if (category === "SALES_REVENUE") return "Sales revenue";
  if (category === "SALES_REFUND") return "Sales refund";
  if (category === "INVESTMENT") return "Investment";
  return EXPENSE_CATEGORY_LABEL[category as keyof typeof EXPENSE_CATEGORY_LABEL] ?? humanizeEnum(category);
}

function signedAmount(transaction: FinancialTransaction): number {
  return transaction.transactionType === "EXPENSE" ||
    transaction.transactionType === "REFUND" ||
    transaction.transactionType === "WITHDRAWAL"
    ? -transaction.amount
    : transaction.amount;
}

export function TransactionsView() {
  const [type, setType] = React.useState("ALL");
  const [category, setCategory] = React.useState("ALL");
  const [search, setSearch] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);
  const debounced = useDebouncedValue(search, 300);

  React.useEffect(
    () => setPage(1),
    [type, category, debounced, startDate, endDate, sortOrder, limit],
  );

  const query = useQuery({
    queryKey: [
      "accounting",
      "transactions",
      { page, limit, type, category, search: debounced, startDate, endDate, sortOrder },
    ],
    queryFn: () =>
      accountingApi.transactions({
        page,
        limit,
        transactionType: type === "ALL" ? undefined : type,
        category: category === "ALL" ? undefined : category,
        search: debounced.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortOrder,
      }),
  });

  const rows = query.data?.items ?? [];
  const totals = rows.reduce(
    (acc, transaction) => {
      const amount = signedAmount(transaction);
      if (amount >= 0) acc.credit += amount;
      else acc.debit += Math.abs(amount);
      return acc;
    },
    { credit: 0, debit: 0 },
  );

  const columns: DataColumn<FinancialTransaction>[] = [
    {
      header: "Transaction",
      cell: (transaction) => (
        <div className="min-w-0">
          <p className="text-xs font-bold">{categoryLabel(transaction.category)}</p>
          <p className="max-w-64 truncate text-[11px] text-muted-foreground">
            {transaction.description || transaction.referenceType || "—"}
          </p>
        </div>
      ),
    },
    {
      header: "Type",
      cell: (transaction) => (
        <Badge tone={TYPE_TONE[transaction.transactionType]} dot>
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
      header: "Reference",
      cell: (transaction) =>
        transaction.referenceId ? (
          <span className="font-mono text-[10px] text-muted-foreground">
            {transaction.referenceType ?? "ref"} · {transaction.referenceId.slice(0, 8)}
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground">—</span>
        ),
    },
    {
      header: "Amount",
      cell: (transaction) => (
        <Price
          amount={signedAmount(transaction)}
          size="sm"
          className={
            signedAmount(transaction) >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }
        />
      ),
      className: "text-right",
      headerClassName: "text-right",
    },
  ];

  const exportCsv = () => {
    if (rows.length === 0) return;
    const header = ["Type", "Category", "Date", "Description", "Reference", "Amount"];
    const lines = rows.map((transaction) =>
      [
        transaction.transactionType,
        categoryLabel(transaction.category),
        isoDate(new Date(transaction.date)),
        transaction.description ?? "",
        transaction.referenceId ?? "",
        signedAmount(transaction).toFixed(2),
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions-${isoDate(new Date())}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Transactions</CardTitle>
          <CardDescription>
            Search, filter and page through the full accounting ledger.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs
            items={[
              { value: "ALL", label: "All" },
              ...TYPES.map((item) => ({ value: item, label: humanizeEnum(item) })),
            ]}
            value={type}
            onChange={setType}
          />
          <Separator />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <div className="relative sm:col-span-2 xl:col-span-2">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search description or reference…"
                aria-label="Search transactions"
                className="pl-9"
              />
            </div>
            <FormField label="Category" htmlFor="transaction-category">
              <Select
                id="transaction-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="ALL">All categories</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {categoryLabel(option)}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Sort" htmlFor="transaction-sort">
              <Select
                id="transaction-sort"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as "asc" | "desc")}
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </Select>
            </FormField>
            <FormField label="From" htmlFor="transaction-start">
              <Input
                id="transaction-start"
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </FormField>
            <FormField label="To" htmlFor="transaction-end">
              <Input
                id="transaction-end"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Entries (this page)"
          value={rows.length}
          hint={`${query.data?.meta.total ?? 0} total matching`}
          icon={ArrowUpCircle}
        />
        <StatCard
          label="Credits"
          value={<Price amount={totals.credit} size="lg" />}
          hint="Incoming on this page"
          icon={ArrowUpCircle}
          tone="success"
        />
        <StatCard
          label="Debits"
          value={<Price amount={-totals.debit} size="lg" />}
          hint="Outgoing on this page"
          icon={ArrowDownCircle}
          tone="danger"
        />
      </div>

      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="font-display text-base">Ledger entries</CardTitle>
            <CardDescription>
              {query.data
                ? `${query.data.meta.total} transaction${query.data.meta.total === 1 ? "" : "s"}`
                : "Loading transactions…"}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent className="px-0 pb-4 sm:px-0">
          <DataTable
            columns={columns}
            rows={rows}
            getKey={(transaction) => transaction.id}
            loading={query.isLoading}
            empty="No transactions match these filters."
          />
          <div className="px-4 sm:px-5">
            <ListPagination
              page={query.data?.meta.page ?? page}
              pageCount={query.data?.meta.totalPages ?? 1}
              totalItems={query.data?.meta.total ?? 0}
              pageSize={query.data?.meta.limit ?? limit}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setLimit(size);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
