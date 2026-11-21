"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, Check, Plus, Search, X } from "lucide-react";
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
import { employeesApi, salariesApi } from "@/lib/api/services";
import { queryKeys, relatedKeys } from "@/lib/query-keys";
import { MONTHS } from "@/lib/constants";
import { formResolver } from "@/lib/form-resolver";
import { formatDate, formatMonth, getErrorMessage, humanizeEnum } from "@/lib/utils";
import { salarySchema, type SalaryValues } from "@/lib/validations";
import type { SalaryPayment, SalaryStatus } from "@/types";

const STATUS_TONE: Record<SalaryStatus, "success" | "warning" | "danger"> = {
  PAID: "success",
  PENDING: "warning",
  CANCELLED: "danger",
};

const now = new Date();

const EMPTY: SalaryValues = {
  employeeId: "",
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  amount: "" as unknown as number,
  bonus: "" as unknown as number,
  deduction: "" as unknown as number,
  paymentDate: "",
  notes: "",
};

export function SalariesView() {
  const queryClient = useQueryClient();
  const [year, setYear] = React.useState(now.getFullYear());
  const [month, setMonth] = React.useState("ALL");
  const [status, setStatus] = React.useState("ALL");
  const [employeeId, setEmployeeId] = React.useState("ALL");
  const [search, setSearch] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(15);
  const debounced = useDebouncedValue(search, 300);
  const [open, setOpen] = React.useState(false);
  const [paying, setPaying] = React.useState<SalaryPayment | null>(null);
  const [cancelling, setCancelling] = React.useState<SalaryPayment | null>(null);

  React.useEffect(
    () => setPage(1),
    [year, month, status, employeeId, debounced, sortOrder, limit],
  );

  const summary = useQuery({
    queryKey: queryKeys.salaries.summary(year),
    queryFn: () => salariesApi.summary(year),
    staleTime: 60_000,
  });

  const employees = useQuery({
    queryKey: queryKeys.employees.options(),
    queryFn: () => employeesApi.list({ limit: 100, sortOrder: "asc" }),
    staleTime: 5 * 60_000,
  });

  const query = useQuery({
    queryKey: queryKeys.salaries.list({
      page,
      limit,
      year,
      month,
      status,
      employeeId,
      search: debounced,
      sortOrder,
    }),
    queryFn: () =>
      salariesApi.list({
        page,
        limit,
        year,
        month: month === "ALL" ? undefined : Number(month),
        status: status === "ALL" ? undefined : status,
        employeeId: employeeId === "ALL" ? undefined : employeeId,
        search: debounced.trim() || undefined,
        sortOrder,
      }),
  });

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<SalaryValues>({
    resolver: formResolver<SalaryValues>(salarySchema),
    defaultValues: EMPTY,
  });

  const selectedEmployeeId = watch("employeeId");
  const selectedEmployee = employees.data?.items.find(
    (employee) => employee.id === selectedEmployeeId,
  );

  const openCreate = () => {
    reset({ ...EMPTY, year, month: month === "ALL" ? now.getMonth() + 1 : Number(month) });
    setOpen(true);
  };

  const invalidate = () => invalidateKeys(queryClient, relatedKeys("salaries"));

  const save = useMutation({
    mutationFn: (values: SalaryValues) =>
      salariesApi.create({
        employeeId: values.employeeId,
        month: Number(values.month),
        year: Number(values.year),
        amount: values.amount === "" ? undefined : Number(values.amount),
        bonus: values.bonus === "" ? undefined : Number(values.bonus),
        deduction: values.deduction === "" ? undefined : Number(values.deduction),
        paymentDate: values.paymentDate || undefined,
        notes: values.notes || undefined,
      }),
    onSuccess: () => {
      toast.success("Salary payment recorded");
      setOpen(false);
      invalidate();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Could not record the salary payment")),
  });

  const pay = useMutation({
    mutationFn: (id: string) => salariesApi.pay(id),
    onSuccess: () => {
      toast.success("Salary marked as paid");
      setPaying(null);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not mark the salary as paid")),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => salariesApi.cancel(id),
    onSuccess: () => {
      toast.success("Salary payment cancelled");
      setCancelling(null);
      const meta = query.data?.meta;
      if (meta) {
        const safe = clampPage(page, Math.max(0, meta.total - 1), limit);
        if (safe !== page) setPage(safe);
      }
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not cancel the salary payment")),
  });

  const rows = query.data?.items ?? [];
  const employeeOptions = employees.data?.items ?? [];

  const columns: DataColumn<SalaryPayment>[] = [
    {
      header: "Employee",
      cell: (salary) => (
        <div className="min-w-0">
          <p className="text-xs font-bold">{salary.employee.name}</p>
          <p className="text-[11px] text-muted-foreground">
            {salary.employee.position}
            {salary.employee.department ? ` · ${salary.employee.department}` : ""}
          </p>
        </div>
      ),
    },
    {
      header: "Period",
      cell: (salary) => (
        <span className="text-xs">{formatMonth(salary.year, salary.month, "short")}</span>
      ),
    },
    {
      header: "Base",
      cell: (salary) => <Price amount={salary.amount} size="xs" />,
      className: "text-right",
      headerClassName: "text-right",
    },
    {
      header: "Adjustments",
      cell: (salary) => (
        <div className="text-right text-[11px]">
          <p className="text-muted-foreground">+{salary.bonus.toFixed(2)}</p>
          <p className="text-muted-foreground">−{salary.deduction.toFixed(2)}</p>
        </div>
      ),
      className: "text-right",
      headerClassName: "text-right",
    },
    {
      header: "Total",
      cell: (salary) => <Price amount={salary.finalAmount} size="sm" />,
      className: "text-right",
      headerClassName: "text-right",
    },
    {
      header: "Status",
      cell: (salary) => (
        <div className="flex flex-col items-start gap-1">
          <Badge tone={STATUS_TONE[salary.status]} dot>
            {humanizeEnum(salary.status)}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {salary.paymentDate ? formatDate(salary.paymentDate) : "Not paid"}
          </span>
        </div>
      ),
    },
    {
      header: "",
      cell: (salary) => (
        <div className="flex items-center justify-end gap-1">
          {salary.status === "PENDING" ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setPaying(salary)}
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Pay
            </Button>
          ) : null}
          {salary.status !== "CANCELLED" ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Cancel salary payment"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setCancelling(salary)}
            >
              <X className="h-4 w-4" aria-hidden="true" />
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
              Payroll
            </p>
            <CardTitle className="font-display text-xl">Salaries</CardTitle>
            <CardDescription>Record, pay and track monthly salary payments.</CardDescription>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New salary
          </Button>
        </CardHeader>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label={`Paid in ${year}`}
          value={<Price amount={summary.data?.totalPaid ?? 0} size="lg" />}
          hint={`${summary.data?.paidCount ?? 0} payments`}
          icon={Banknote}
          tone="success"
        />
        <StatCard
          label="Pending"
          value={<Price amount={summary.data?.totalPending ?? 0} size="lg" />}
          hint={`${summary.data?.pendingCount ?? 0} payments`}
          icon={Banknote}
          tone="warning"
        />
        <StatCard
          label="Payroll cycles"
          value={summary.data?.byMonth.length ?? 0}
          hint="Months with salary activity"
          icon={Banknote}
          tone="accent"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Salary payments</CardTitle>
          <CardDescription>Filter by period, employee and status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs
            items={[
              { value: "ALL", label: "All" },
              { value: "PENDING", label: "Pending" },
              { value: "PAID", label: "Paid" },
              { value: "CANCELLED", label: "Cancelled" },
            ]}
            value={status}
            onChange={setStatus}
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <div className="relative sm:col-span-2 xl:col-span-2">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notes or employee…"
                aria-label="Search salaries"
                className="pl-9"
              />
            </div>
            <Select
              aria-label="Filter by month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            >
              <option value="ALL">All months</option>
              {MONTHS.map((label, index) => (
                <option key={label} value={index + 1}>
                  {label}
                </option>
              ))}
            </Select>
            <Select
              aria-label="Filter by year"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
            >
              {[now.getFullYear() + 1, now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2].map(
                (value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ),
              )}
            </Select>
            <Select
              aria-label="Filter by employee"
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
            >
              <option value="ALL">All employees</option>
              {employeeOptions.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </Select>
            <Select
              aria-label="Sort salaries"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as "asc" | "desc")}
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-0 pb-4 pt-4 sm:px-0">
          <DataTable
            columns={columns}
            rows={rows}
            getKey={(salary) => salary.id}
            loading={query.isLoading}
            empty="No salary payments match these filters."
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
        title="Record salary payment"
        description="Salaries post to operating expenses once paid."
        size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={save.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="salary-form" size="sm" loading={save.isPending}>
              Record salary
            </Button>
          </>
        }
      >
        <form
          id="salary-form"
          onSubmit={handleSubmit((values) => save.mutate(values))}
          className="grid gap-4 sm:grid-cols-2"
          noValidate
        >
          <FormField
            label="Employee"
            htmlFor="salary-employee"
            required
            error={errors.employeeId?.message}
            className="sm:col-span-2"
          >
            <Select
              id="salary-employee"
              invalid={Boolean(errors.employeeId)}
              {...register("employeeId")}
            >
              <option value="">Choose an employee…</option>
              {employeeOptions.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} — {employee.position}
                  {employee.isActive ? "" : " (inactive)"}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Month" htmlFor="salary-month" required error={errors.month?.message}>
            <Select id="salary-month" {...register("month")}>
              {MONTHS.map((label, index) => (
                <option key={label} value={index + 1}>
                  {label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Year" htmlFor="salary-year" required error={errors.year?.message}>
            <Input id="salary-year" type="number" min="2000" max="2100" {...register("year")} />
          </FormField>
          <FormField
            label="Base amount (BDT)"
            htmlFor="salary-amount"
            hint={
              selectedEmployee
                ? `Leave blank to use ${selectedEmployee.name}'s ${selectedEmployee.monthlySalary.toFixed(2)} salary.`
                : "Leave blank to use the employee's monthly salary."
            }
            error={errors.amount?.message}
          >
            <Input id="salary-amount" type="number" step="0.01" min="0" {...register("amount")} />
          </FormField>
          <FormField label="Payment date" htmlFor="salary-date" error={errors.paymentDate?.message}>
            <Input id="salary-date" type="date" {...register("paymentDate")} />
          </FormField>
          <FormField label="Bonus (BDT)" htmlFor="salary-bonus" error={errors.bonus?.message}>
            <Input id="salary-bonus" type="number" step="0.01" min="0" {...register("bonus")} />
          </FormField>
          <FormField label="Deduction (BDT)" htmlFor="salary-deduction" error={errors.deduction?.message}>
            <Input
              id="salary-deduction"
              type="number"
              step="0.01"
              min="0"
              {...register("deduction")}
            />
          </FormField>
          <FormField label="Notes" htmlFor="salary-notes" error={errors.notes?.message} className="sm:col-span-2">
            <Textarea id="salary-notes" rows={3} {...register("notes")} />
          </FormField>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(paying)}
        onClose={() => setPaying(null)}
        onConfirm={() => paying && pay.mutate(paying.id)}
        title="Mark this salary as paid?"
        description={
          paying
            ? `This records ${paying.employee.name}'s payment for ${formatMonth(paying.year, paying.month)} and posts it to expenses.`
            : undefined
        }
        confirmLabel="Mark paid"
        loading={pay.isPending}
      />

      <ConfirmDialog
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        onConfirm={() => cancelling && cancel.mutate(cancelling.id)}
        title="Cancel this salary payment?"
        description="The payment is cancelled and its ledger entry removed. This cannot be undone."
        confirmLabel="Cancel payment"
        loading={cancel.isPending}
        destructive
      />
    </div>
  );
}
