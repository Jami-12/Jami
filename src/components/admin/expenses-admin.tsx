"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Plus, Search, Trash2, Wallet } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { FormField, Input, Select, Textarea } from "@/components/ui/input";
import { Price } from "@/components/ui/price";
import { Tabs } from "@/components/ui/tabs";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { clampPage, invalidateKeys } from "@/hooks/use-optimistic-mutation";
import { expensesApi } from "@/lib/api/services";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABEL } from "@/lib/constants";
import { formResolver } from "@/lib/form-resolver";
import { queryKeys, relatedKeys } from "@/lib/query-keys";
import { formatDate, getErrorMessage, humanizeEnum } from "@/lib/utils";
import { expenseSchema, type ExpenseValues } from "@/lib/validations";
import type { Expense } from "@/types";

const EMPTY: ExpenseValues = {
  category: "OTHER",
  amount: "" as unknown as number,
  description: "",
  expenseDate: "",
  dueDate: "",
  isPaid: false,
  receiptUrl: "",
  status: "PENDING",
};

const STATUS_TONE = {
  PENDING: "warning",
  APPROVED: "success",
  CANCELLED: "danger",
} as const;

export function ExpensesAdmin({ canApprove = false }: { canApprove?: boolean }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = React.useState("ALL");
  const [search, setSearch] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(15);
  const debounced = useDebouncedValue(search, 300);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Expense | null>(null);
  const [cancelling, setCancelling] = React.useState<Expense | null>(null);

  React.useEffect(() => setPage(1), [filter, debounced, sortOrder, limit]);

  const summary = useQuery({
    queryKey: queryKeys.expenses.summary(),
    queryFn: expensesApi.summary,
    staleTime: 60_000,
  });

  const query = useQuery({
    queryKey: queryKeys.expenses.list({ page, limit, filter, search: debounced, sortOrder }),
    queryFn: () =>
      expensesApi.list({
        page,
        limit,
        status: filter === "ALL" ? undefined : filter,
        search: debounced.trim() || undefined,
        sortOrder,
      }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseValues>({
    resolver: formResolver<ExpenseValues>(expenseSchema),
    defaultValues: EMPTY,
  });

  const openCreate = () => {
    setEditing(null);
    reset(EMPTY);
    setOpen(true);
  };

  const openEdit = (expense: Expense) => {
    setEditing(expense);
    reset({
      category: expense.category,
      amount: expense.amount,
      description: expense.description ?? "",
      expenseDate: expense.expenseDate.slice(0, 10),
      dueDate: expense.dueDate ? expense.dueDate.slice(0, 10) : "",
      isPaid: expense.isPaid,
      receiptUrl: expense.receiptUrl ?? "",
      status: expense.status,
    });
    setOpen(true);
  };

  const invalidate = () => invalidateKeys(queryClient, relatedKeys("expenses"));

  const save = useMutation({
    mutationFn: (values: ExpenseValues) => {
      const payload = {
        category: values.category as Expense["category"],
        amount: Number(values.amount),
        description: values.description || undefined,
        expenseDate: values.expenseDate || undefined,
        dueDate: values.dueDate || undefined,
        isPaid: Boolean(values.isPaid),
        receiptUrl: values.receiptUrl || undefined,
        status: canApprove ? (values.status as Expense["status"]) : undefined,
      };
      return editing ? expensesApi.update(editing.id, payload) : expensesApi.create(payload);
    },
    onSuccess: () => {
      toast.success(
        editing
          ? "Expense updated"
          : canApprove
            ? "Expense recorded"
            : "Expense submitted for approval",
      );
      setOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not save the expense")),
  });

  const approve = useMutation({
    mutationFn: (id: string) => expensesApi.update(id, { status: "APPROVED", isPaid: true }),
    onSuccess: () => {
      toast.success("Expense approved");
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not approve the expense")),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => expensesApi.cancel(id),
    onSuccess: () => {
      toast.success("Expense cancelled");
      setCancelling(null);
      const meta = query.data?.meta;
      if (meta) {
        const safe = clampPage(page, Math.max(0, meta.total - 1), limit);
        if (safe !== page) setPage(safe);
      }
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not cancel the expense")),
  });

  const rows = query.data?.items ?? [];

  const columns: DataColumn<Expense>[] = [
    {
      header: "Expense",
      cell: (expense) => (
        <div className="min-w-0">
          <p className="text-xs font-bold">{EXPENSE_CATEGORY_LABEL[expense.category]}</p>
          <p className="max-w-64 truncate text-[11px] text-muted-foreground">
            {expense.description || "—"}
          </p>
        </div>
      ),
    },
    {
      header: "Amount",
      cell: (expense) => <Price amount={expense.amount} size="sm" />,
      className: "text-right",
      headerClassName: "text-right",
    },
    {
      header: "Date",
      cell: (expense) => (
        <span className="text-[11px] text-muted-foreground">{formatDate(expense.expenseDate)}</span>
      ),
    },
    {
      header: "Due",
      cell: (expense) => (
        <span className="text-[11px] text-muted-foreground">
          {expense.dueDate ? formatDate(expense.dueDate) : "—"}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (expense) => (
        <div className="flex flex-col items-start gap-1">
          <Badge tone={STATUS_TONE[expense.status]} dot>
            {humanizeEnum(expense.status)}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {expense.isPaid ? "Paid" : "Unpaid"}
          </span>
        </div>
      ),
    },
    {
      header: "",
      cell: (expense) => (
        <div className="flex items-center justify-end gap-1">
          {canApprove && expense.status === "PENDING" ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-emerald-600"
              onClick={() => approve.mutate(expense.id)}
              loading={approve.isPending && approve.variables === expense.id}
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Approve
            </Button>
          ) : null}
          <Button variant="ghost" size="icon" aria-label="Edit expense" onClick={() => openEdit(expense)}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
          {expense.status !== "CANCELLED" ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Cancel expense"
              className="text-muted-foreground hover:text-red-600"
              onClick={() => setCancelling(expense)}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      ),
      className: "text-right",
      headerClassName: "text-right",
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-muted/30">
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Operating spend
            </p>
            <CardTitle className="font-display text-xl">Expenses</CardTitle>
            <CardDescription>
              {canApprove
                ? "Approve, record and track business expenses."
                : "Submit expenses and track their approval status."}
            </CardDescription>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New expense
          </Button>
        </CardHeader>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Recorded"
          value={<Price amount={summary.data?.total ?? 0} size="lg" />}
          hint={`${summary.data?.count ?? 0} entries`}
          icon={Wallet}
        />
        <StatCard label="Paid" value={<Price amount={summary.data?.paid ?? 0} size="lg" />} tone="success" />
        <StatCard
          label="Unpaid"
          value={<Price amount={summary.data?.unpaid ?? 0} size="lg" />}
          tone="warning"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Expense register</CardTitle>
          <CardDescription>Filter, sort and page through expenses.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Tabs
              items={[
                { value: "ALL", label: "All" },
                { value: "PENDING", label: "Pending" },
                { value: "APPROVED", label: "Approved" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
              value={filter}
              onChange={setFilter}
            />
            <div className="grid w-full gap-2 sm:grid-cols-2 lg:max-w-md">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search description…"
                  aria-label="Search expenses"
                  className="pl-9"
                />
              </div>
              <Select
                aria-label="Sort expenses"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as "asc" | "desc")}
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-0 pb-4 pt-4 sm:px-0">
          <DataTable
            columns={columns}
            rows={rows}
            getKey={(expense) => expense.id}
            loading={query.isLoading}
            empty="No expenses match these filters."
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

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit expense" : "New expense"}
        description={
          canApprove
            ? "Approved expenses post to the accounting ledger."
            : "Submitted expenses stay pending until a super admin approves them."
        }
        size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={save.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="expense-form" size="sm" loading={save.isPending}>
              {editing ? "Save changes" : "Save expense"}
            </Button>
          </>
        }
      >
        <form
          id="expense-form"
          onSubmit={handleSubmit((values) => save.mutate(values))}
          className="grid gap-4 sm:grid-cols-2"
          noValidate
        >
          <FormField label="Category" htmlFor="expense-category" required error={errors.category?.message}>
            <Select id="expense-category" {...register("category")}>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {EXPENSE_CATEGORY_LABEL[category]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Amount (BDT)" htmlFor="expense-amount" required error={errors.amount?.message}>
            <Input
              id="expense-amount"
              type="number"
              step="0.01"
              min="0"
              invalid={Boolean(errors.amount)}
              {...register("amount")}
            />
          </FormField>
          <FormField label="Expense date" htmlFor="expense-date" error={errors.expenseDate?.message}>
            <Input id="expense-date" type="date" {...register("expenseDate")} />
          </FormField>
          <FormField
            label="Due date"
            htmlFor="expense-due"
            hint="Leave blank for an immediate expense."
            error={errors.dueDate?.message}
          >
            <Input id="expense-due" type="date" {...register("dueDate")} />
          </FormField>
          <FormField
            label="Description"
            htmlFor="expense-description"
            error={errors.description?.message}
            className="sm:col-span-2"
          >
            <Textarea id="expense-description" rows={3} {...register("description")} />
          </FormField>
          <FormField
            label="Receipt URL"
            htmlFor="expense-receipt"
            error={errors.receiptUrl?.message}
            className="sm:col-span-2"
          >
            <Input id="expense-receipt" type="url" placeholder="https://…" {...register("receiptUrl")} />
          </FormField>
          {canApprove ? (
            <FormField label="Status" htmlFor="expense-status">
              <Select id="expense-status" {...register("status")}>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
            </FormField>
          ) : null}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 rounded border-border" {...register("isPaid")} />
            Already paid
          </label>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        onConfirm={() => cancelling && cancel.mutate(cancelling.id)}
        title="Cancel this expense?"
        description="The expense is marked cancelled and removed from the ledger. This cannot be undone."
        confirmLabel="Cancel expense"
        loading={cancel.isPending}
        destructive
      />
    </div>
  );
}
