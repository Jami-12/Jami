"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Search } from "lucide-react";

import { DataTable, type DataColumn } from "@/components/dashboard/data-table";
import { PageSection } from "@/components/dashboard/page-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Price } from "@/components/ui/price";
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
  const [page, setPage] = React.useState(1);
  const debounced = useDebouncedValue(search, 300);

  React.useEffect(() => setPage(1), [type, category, debounced, startDate, endDate]);

  const query = useQuery({
    queryKey: [
      "accounting",
      "transactions",
      { page, type, category, search: debounced, startDate, endDate },
    ],
    queryFn: () =>
      accountingApi.transactions({
        page,
        limit: 20,
        transactionType: type === "ALL" ? undefined : type,
        category: category === "ALL" ? undefined : category,
        search: debounced.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
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
        <div>
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
      <div className="flex flex-col gap-3">
        <Tabs
          items={[
            { value: "ALL", label: "All" },
            ...TYPES.map((item) => ({ value: item, label: humanizeEnum(item) })),
          ]}
          value={type}
          onChange={setType}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2">
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
          <div className="grid grid-cols-2 gap-2">
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
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Entries on page
          </p>
          <p className="mt-1 text-xl font-extrabold">{rows.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Credits
          </p>
          <p className="mt-1 text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            <Price amount={totals.credit} size="md" />
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Debits
          </p>
          <p className="mt-1 text-xl font-extrabold text-red-600 dark:text-red-400">
            <Price amount={-totals.debit} size="md" />
          </p>
        </div>
      </div>

      <PageSection
        actions={
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Export CSV
          </Button>
        }
      >
        <DataTable
          columns={columns}
          rows={rows}
          getKey={(transaction) => transaction.id}
          loading={query.isLoading}
          empty="No transactions match these filters."
        />
        <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {query.data
              ? `${query.data.meta.total} transaction${query.data.meta.total === 1 ? "" : "s"}`
              : "—"}
          </p>
          <Pagination
            page={query.data?.meta.page ?? 1}
            totalPages={query.data?.meta.totalPages ?? 1}
            onPageChange={setPage}
          />
        </div>
      </PageSection>
    </div>
  );
}
