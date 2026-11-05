"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, UserMinus, UserRound, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { DataTable, type DataColumn } from "@/components/dashboard/data-table";
import { PageSection } from "@/components/dashboard/page-section";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { FormField, Input, Select } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Price } from "@/components/ui/price";
import { Tabs } from "@/components/ui/tabs";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { employeesApi } from "@/lib/api/services";
import { formResolver } from "@/lib/form-resolver";
import { formatDate, getErrorMessage } from "@/lib/utils";
import { employeeSchema, type EmployeeValues } from "@/lib/validations";
import type { Employee } from "@/types";

const EMPTY: EmployeeValues = {
  name: "",
  email: "",
  phone: "",
  position: "",
  department: "",
  monthlySalary: "" as unknown as number,
  joiningDate: "",
  isActive: true,
};

export function EmployeesView() {
  const queryClient = useQueryClient();
  const [status, setStatus] = React.useState("ALL");
  const [department, setDepartment] = React.useState("ALL");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const debounced = useDebouncedValue(search, 300);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Employee | null>(null);
  const [deactivating, setDeactivating] = React.useState<Employee | null>(null);

  React.useEffect(() => setPage(1), [status, department, debounced]);

  const summary = useQuery({
    queryKey: ["employees", "summary"],
    queryFn: employeesApi.summary,
    staleTime: 60_000,
  });

  const query = useQuery({
    queryKey: ["employees", { page, status, department, search: debounced }],
    queryFn: () =>
      employeesApi.list({
        page,
        limit: 15,
        isActive: status === "ALL" ? undefined : status === "ACTIVE",
        department: department === "ALL" ? undefined : department,
        search: debounced.trim() || undefined,
      }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EmployeeValues>({
    resolver: formResolver<EmployeeValues>(employeeSchema),
    defaultValues: EMPTY,
  });

  const openCreate = () => {
    setEditing(null);
    reset(EMPTY);
    setOpen(true);
  };

  const openEdit = (employee: Employee) => {
    setEditing(employee);
    reset({
      name: employee.name,
      email: employee.email ?? "",
      phone: employee.phone ?? "",
      position: employee.position,
      department: employee.department ?? "",
      monthlySalary: employee.monthlySalary,
      joiningDate: employee.joiningDate.slice(0, 10),
      isActive: employee.isActive,
    });
    setOpen(true);
  };

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["employees"] });
    void queryClient.invalidateQueries({ queryKey: ["salaries"] });
    void queryClient.invalidateQueries({ queryKey: ["accounting"] });
  };

  const save = useMutation({
    mutationFn: (values: EmployeeValues) => {
      const payload = {
        name: values.name,
        email: values.email || undefined,
        phone: values.phone || undefined,
        position: values.position,
        department: values.department || undefined,
        monthlySalary: Number(values.monthlySalary),
        joiningDate: values.joiningDate,
        isActive: Boolean(values.isActive),
      };
      return editing
        ? employeesApi.update(editing.id, payload)
        : employeesApi.create(payload);
    },
    onSuccess: () => {
      toast.success(editing ? "Employee updated" : "Employee added");
      setOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not save the employee")),
  });

  const deactivate = useMutation({
    mutationFn: (id: string) => employeesApi.deactivate(id),
    onSuccess: () => {
      toast.success("Employee deactivated");
      setDeactivating(null);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not deactivate the employee")),
  });

  const rows = query.data?.items ?? [];
  const departments = summary.data?.departments ?? [];

  const columns: DataColumn<Employee>[] = [
    {
      header: "Employee",
      cell: (employee) => (
        <div>
          <p className="text-xs font-bold">{employee.name}</p>
          <p className="text-[11px] text-muted-foreground">{employee.position}</p>
        </div>
      ),
    },
    {
      header: "Contact",
      cell: (employee) => (
        <div>
          <p className="text-[11px] text-muted-foreground">{employee.email ?? "—"}</p>
          <p className="text-[11px] text-muted-foreground">{employee.phone ?? "—"}</p>
        </div>
      ),
    },
    {
      header: "Department",
      cell: (employee) => (
        <span className="text-xs">{employee.department || "—"}</span>
      ),
    },
    {
      header: "Monthly salary",
      cell: (employee) => <Price amount={employee.monthlySalary} size="sm" />,
      className: "text-right",
      headerClassName: "text-right",
    },
    {
      header: "Joined",
      cell: (employee) => (
        <span className="text-[11px] text-muted-foreground">{formatDate(employee.joiningDate)}</span>
      ),
    },
    {
      header: "Status",
      cell: (employee) => (
        <div className="flex flex-col items-start gap-1">
          <Badge tone={employee.isActive ? "success" : "danger"} dot>
            {employee.isActive ? "Active" : "Inactive"}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {employee.salaryPaymentsCount} payment{employee.salaryPaymentsCount === 1 ? "" : "s"}
          </span>
        </div>
      ),
    },
    {
      header: "",
      cell: (employee) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${employee.name}`}
            onClick={() => openEdit(employee)}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
          {employee.isActive ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Deactivate ${employee.name}`}
              className="text-muted-foreground hover:text-red-600"
              onClick={() => setDeactivating(employee)}
            >
              <UserMinus className="h-4 w-4" aria-hidden="true" />
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
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Team size"
          value={summary.data?.total ?? "—"}
          hint={`${summary.data?.active ?? 0} active · ${summary.data?.inactive ?? 0} inactive`}
          icon={Users}
        />
        <StatCard
          label="Monthly payroll"
          value={<Price amount={summary.data?.monthlyPayroll ?? 0} size="lg" />}
          hint="Base salary commitment"
          icon={UserRound}
          tone="accent"
        />
        <StatCard
          label="Departments"
          value={departments.length}
          hint={departments.map((row) => row.department ?? "Unassigned").slice(0, 3).join(", ") || "—"}
          icon={Users}
          tone="accent"
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end">
          <Tabs
            items={[
              { value: "ALL", label: "All" },
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
            ]}
            value={status}
            onChange={setStatus}
          />
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or position…"
              aria-label="Search employees"
              className="pl-9"
            />
          </div>
          <Select
            aria-label="Filter by department"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="w-auto"
          >
            <option value="ALL">All departments</option>
            {departments.map((row) => (
              <option key={row.department ?? "unassigned"} value={row.department ?? ""}>
                {row.department ?? "Unassigned"}
              </option>
            ))}
          </Select>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add employee
        </Button>
      </div>

      <PageSection>
        <DataTable
          columns={columns}
          rows={rows}
          getKey={(employee) => employee.id}
          loading={query.isLoading}
          empty="No employees match these filters."
        />
        <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {query.data
              ? `${query.data.meta.total} employee${query.data.meta.total === 1 ? "" : "s"}`
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
        title={editing ? "Edit employee" : "Add employee"}
        description="Employees are the base for monthly payroll and salary payments."
        size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={save.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="employee-form" size="sm" loading={save.isPending}>
              {editing ? "Save changes" : "Add employee"}
            </Button>
          </>
        }
      >
        <form
          id="employee-form"
          onSubmit={handleSubmit((values) => save.mutate(values))}
          className="grid gap-4 sm:grid-cols-2"
          noValidate
        >
          <FormField label="Full name" htmlFor="employee-name" required error={errors.name?.message}>
            <Input id="employee-name" invalid={Boolean(errors.name)} {...register("name")} />
          </FormField>
          <FormField label="Position" htmlFor="employee-position" required error={errors.position?.message}>
            <Input id="employee-position" invalid={Boolean(errors.position)} {...register("position")} />
          </FormField>
          <FormField label="Email" htmlFor="employee-email" error={errors.email?.message}>
            <Input id="employee-email" type="email" invalid={Boolean(errors.email)} {...register("email")} />
          </FormField>
          <FormField label="Phone" htmlFor="employee-phone" error={errors.phone?.message}>
            <Input id="employee-phone" {...register("phone")} />
          </FormField>
          <FormField label="Department" htmlFor="employee-department" error={errors.department?.message}>
            <Input id="employee-department" {...register("department")} />
          </FormField>
          <FormField
            label="Monthly salary (BDT)"
            htmlFor="employee-salary"
            required
            error={errors.monthlySalary?.message}
          >
            <Input
              id="employee-salary"
              type="number"
              step="0.01"
              min="0"
              invalid={Boolean(errors.monthlySalary)}
              {...register("monthlySalary")}
            />
          </FormField>
          <FormField
            label="Joining date"
            htmlFor="employee-joining"
            required
            error={errors.joiningDate?.message}
          >
            <Input id="employee-joining" type="date" {...register("joiningDate")} />
          </FormField>
          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <input type="checkbox" className="h-4 w-4 rounded border-border" {...register("isActive")} />
            Active employee
          </label>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deactivating)}
        onClose={() => setDeactivating(null)}
        onConfirm={() => deactivating && deactivate.mutate(deactivating.id)}
        title="Deactivate this employee?"
        description="They remain in payroll history but will no longer be selectable for new salary payments."
        confirmLabel="Deactivate"
        loading={deactivate.isPending}
        destructive
      />
    </div>
  );
}
