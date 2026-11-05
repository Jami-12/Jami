"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2, TrendingUp, Wallet } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { DataTable, type DataColumn } from "@/components/dashboard/data-table";
import { PageSection } from "@/components/dashboard/page-section";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { FormField, Input, Textarea } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Price } from "@/components/ui/price";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { investmentsApi } from "@/lib/api/services";
import { formResolver } from "@/lib/form-resolver";
import { formatDate, getErrorMessage } from "@/lib/utils";
import { investmentSchema, type InvestmentValues } from "@/lib/validations";
import type { Investment } from "@/types";

const EMPTY: InvestmentValues = {
  amount: "" as unknown as number,
  source: "",
  description: "",
  investmentDate: "",
};

export function InvestmentsView() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [page, setPage] = React.useState(1);
  const debounced = useDebouncedValue(search, 300);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Investment | null>(null);
  const [deleting, setDeleting] = React.useState<Investment | null>(null);

  React.useEffect(() => setPage(1), [debounced, startDate, endDate]);

  const summary = useQuery({
    queryKey: ["investments", "summary"],
    queryFn: investmentsApi.summary,
    staleTime: 60_000,
  });

  const query = useQuery({
    queryKey: ["investments", { page, search: debounced, startDate, endDate }],
    queryFn: () =>
      investmentsApi.list({
        page,
        limit: 15,
        search: debounced.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InvestmentValues>({
    resolver: formResolver<InvestmentValues>(investmentSchema),
    defaultValues: EMPTY,
  });

  const openCreate = () => {
    setEditing(null);
    reset(EMPTY);
    setOpen(true);
  };

  const openEdit = (investment: Investment) => {
    setEditing(investment);
    reset({
      amount: investment.amount,
      source: investment.source,
      description: investment.description ?? "",
      investmentDate: investment.investmentDate.slice(0, 10),
    });
    setOpen(true);
  };

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["investments"] });
    void queryClient.invalidateQueries({ queryKey: ["accounting"] });
  };

  const save = useMutation({
    mutationFn: (values: InvestmentValues) => {
      const payload = {
        amount: Number(values.amount),
        source: values.source,
        description: values.description || undefined,
        investmentDate: values.investmentDate || undefined,
      };
      return editing
        ? investmentsApi.update(editing.id, payload)
        : investmentsApi.create(payload);
    },
    onSuccess: () => {
      toast.success(editing ? "Investment updated" : "Investment recorded");
      setOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not save the investment")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => investmentsApi.remove(id),
    onSuccess: () => {
      toast.success("Investment removed");
      setDeleting(null);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not remove the investment")),
  });

  const rows = query.data?.items ?? [];

  const columns: DataColumn<Investment>[] = [
    {
      header: "Source",
      cell: (investment) => (
        <div>
          <p className="text-xs font-bold">{investment.source}</p>
          <p className="max-w-72 truncate text-[11px] text-muted-foreground">
            {investment.description || "—"}
          </p>
        </div>
      ),
    },
    {
      header: "Date",
      cell: (investment) => (
        <span className="text-[11px] text-muted-foreground">
          {formatDate(investment.investmentDate)}
        </span>
      ),
    },
    {
      header: "Amount",
      cell: (investment) => <Price amount={investment.amount} size="sm" />,
      className: "text-right",
      headerClassName: "text-right",
    },
    {
      header: "",
      cell: (investment) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Edit investment"
            onClick={() => openEdit(investment)}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete investment"
            className="text-muted-foreground hover:text-red-600"
            onClick={() => setDeleting(investment)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ),
      className: "text-right",
      headerClassName: "text-right",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Total capital"
          value={<Price amount={summary.data?.total ?? 0} size="lg" />}
          hint={`${summary.data?.count ?? 0} contributions`}
          icon={Wallet}
          tone="accent"
        />
        <StatCard
          label="This month"
          value={<Price amount={summary.data?.thisMonth ?? 0} size="lg" />}
          icon={TrendingUp}
        />
        <StatCard
          label="This year"
          value={<Price amount={summary.data?.thisYear ?? 0} size="lg" />}
          icon={TrendingUp}
          tone="success"
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end">
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search source or description…"
              aria-label="Search investments"
              className="pl-9"
            />
          </div>
          <FormField label="From" htmlFor="investment-start" className="w-full sm:w-40">
            <Input
              id="investment-start"
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </FormField>
          <FormField label="To" htmlFor="investment-end" className="w-full sm:w-40">
            <Input
              id="investment-end"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </FormField>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Record investment
        </Button>
      </div>

      <PageSection>
        <DataTable
          columns={columns}
          rows={rows}
          getKey={(investment) => investment.id}
          loading={query.isLoading}
          empty="No investments recorded yet."
        />
        <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {query.data
              ? `${query.data.meta.total} investment${query.data.meta.total === 1 ? "" : "s"}`
              : "—"}
          </p>
          <Pagination
            page={query.data?.meta.page ?? 1}
            totalPages={query.data?.meta.totalPages ?? 1}
            onPageChange={setPage}
          />
        </div>
      </PageSection>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit investment" : "Record investment"}
        description="Capital contributions post to the accounting ledger as investment transactions."
        size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={save.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="investment-form" size="sm" loading={save.isPending}>
              {editing ? "Save changes" : "Record investment"}
            </Button>
          </>
        }
      >
        <form
          id="investment-form"
          onSubmit={handleSubmit((values) => save.mutate(values))}
          className="grid gap-4 sm:grid-cols-2"
          noValidate
        >
          <FormField label="Source" htmlFor="investment-source" required error={errors.source?.message}>
            <Input
              id="investment-source"
              placeholder="Owner, investor, bank…"
              invalid={Boolean(errors.source)}
              {...register("source")}
            />
          </FormField>
          <FormField label="Amount (BDT)" htmlFor="investment-amount" required error={errors.amount?.message}>
            <Input
              id="investment-amount"
              type="number"
              step="0.01"
              min="0"
              invalid={Boolean(errors.amount)}
              {...register("amount")}
            />
          </FormField>
          <FormField label="Investment date" htmlFor="investment-date" error={errors.investmentDate?.message}>
            <Input id="investment-date" type="date" {...register("investmentDate")} />
          </FormField>
          <FormField
            label="Description"
            htmlFor="investment-description"
            error={errors.description?.message}
            className="sm:col-span-2"
          >
            <Textarea id="investment-description" rows={3} {...register("description")} />
          </FormField>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        title="Remove this investment?"
        description="The investment and its ledger entry will be removed. This cannot be undone."
        confirmLabel="Remove investment"
        loading={remove.isPending}
        destructive
      />
    </div>
  );
}
