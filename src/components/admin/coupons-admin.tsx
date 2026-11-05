"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { DataTable, type DataColumn } from "@/components/dashboard/data-table";
import { PageSection } from "@/components/dashboard/page-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { FormField, Input, Textarea } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { couponsApi } from "@/lib/api/services";
import { formResolver } from "@/lib/form-resolver";
import { formatCurrency, formatDate, getErrorMessage } from "@/lib/utils";
import { couponSchema, type CouponValues } from "@/lib/validations";
import type { Coupon } from "@/types";

const EMPTY: CouponValues = {
  code: "",
  description: "",
  discountPercent: "",
  discountAmount: "",
  minimumAmount: "",
  maxDiscount: "",
  usageLimit: "",
  isActive: true,
  startDate: "",
  endDate: "",
};

function toDateInput(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export function CouponsAdmin() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("ALL");
  const debounced = useDebouncedValue(search, 300);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Coupon | null>(null);
  const [deleting, setDeleting] = React.useState<Coupon | null>(null);

  const query = useQuery({
    queryKey: ["admin", "coupons", { search: debounced, filter }],
    queryFn: () =>
      couponsApi.list({
        search: debounced.trim() || undefined,
        isActive: filter === "ACTIVE" ? true : filter === "INACTIVE" ? false : undefined,
      }),
    staleTime: 30_000,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CouponValues>({
    resolver: formResolver<CouponValues>(couponSchema),
    defaultValues: EMPTY,
  });

  const openCreate = () => {
    setEditing(null);
    reset(EMPTY);
    setOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon);
    reset({
      code: coupon.code,
      description: coupon.description ?? "",
      discountPercent: coupon.discountPercent ?? "",
      discountAmount: coupon.discountAmount ?? "",
      minimumAmount: coupon.minimumAmount ?? "",
      maxDiscount: coupon.maxDiscount ?? "",
      usageLimit: coupon.usageLimit ?? "",
      isActive: coupon.isActive,
      startDate: toDateInput(coupon.startDate),
      endDate: toDateInput(coupon.endDate),
    });
    setOpen(true);
  };

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });

  const save = useMutation({
    mutationFn: (values: CouponValues) => {
      const payload = {
        code: values.code,
        description: values.description || undefined,
        discountPercent:
          values.discountPercent === "" ? undefined : Number(values.discountPercent),
        discountAmount:
          values.discountAmount === "" ? undefined : Number(values.discountAmount),
        minimumAmount:
          values.minimumAmount === "" ? undefined : Number(values.minimumAmount),
        maxDiscount: values.maxDiscount === "" ? undefined : Number(values.maxDiscount),
        usageLimit: values.usageLimit === "" ? undefined : Number(values.usageLimit),
        isActive: values.isActive,
        startDate: values.startDate || undefined,
        endDate: values.endDate || undefined,
      };
      return editing ? couponsApi.update(editing.id, payload) : couponsApi.create(payload);
    },
    onSuccess: () => {
      toast.success(editing ? "Coupon updated" : "Coupon created");
      setOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not save the coupon")),
  });

  const toggle = useMutation({
    mutationFn: (coupon: Coupon) => couponsApi.update(coupon.id, { isActive: !coupon.isActive }),
    onSuccess: () => {
      toast.success("Coupon updated");
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not update the coupon")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => couponsApi.remove(id),
    onSuccess: () => {
      toast.success("Coupon deleted");
      setDeleting(null);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not delete the coupon")),
  });

  const rows = query.data ?? [];

  const columns: DataColumn<Coupon>[] = [
    {
      header: "Code",
      cell: (coupon) => (
        <div>
          <p className="font-mono text-xs font-bold">{coupon.code}</p>
          <p className="max-w-56 truncate text-[11px] text-muted-foreground">
            {coupon.description || "—"}
          </p>
        </div>
      ),
    },
    {
      header: "Discount",
      cell: (coupon) =>
        coupon.discountPercent != null ? (
          <span className="font-semibold">{coupon.discountPercent}%</span>
        ) : (
          <span className="font-semibold">{formatCurrency(coupon.discountAmount ?? 0)}</span>
        ),
    },
    {
      header: "Min spend",
      cell: (coupon) => (coupon.minimumAmount ? formatCurrency(coupon.minimumAmount) : "—"),
    },
    {
      header: "Used",
      cell: (coupon) => (
        <span className="text-xs">
          {coupon.usedCount}
          {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
        </span>
      ),
    },
    {
      header: "Window",
      cell: (coupon) => (
        <span className="text-[11px] text-muted-foreground">
          {coupon.startDate ? formatDate(coupon.startDate, "short") : "Now"} →{" "}
          {coupon.endDate ? formatDate(coupon.endDate, "short") : "Open"}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (coupon) => (
        <button type="button" onClick={() => toggle.mutate(coupon)} aria-label="Toggle coupon status">
          <Badge tone={coupon.isActive ? "success" : "neutral"} dot>
            {coupon.isActive ? "Active" : "Inactive"}
          </Badge>
        </button>
      ),
    },
    {
      header: "",
      cell: (coupon) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Edit coupon" onClick={() => openEdit(coupon)}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete coupon"
            className="text-muted-foreground hover:text-red-600"
            onClick={() => setDeleting(coupon)}
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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <Tabs
            items={[
              { value: "ALL", label: "All" },
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
            ]}
            value={filter}
            onChange={setFilter}
          />
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search codes…"
              aria-label="Search coupons"
              className="pl-9"
            />
          </div>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New coupon
        </Button>
      </div>

      <PageSection>
        <DataTable
          columns={columns}
          rows={rows}
          getKey={(coupon) => coupon.id}
          loading={query.isLoading}
          empty="No coupons match these filters."
        />
      </PageSection>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit coupon" : "New coupon"}
        description="Provide exactly one discount type: percentage or fixed amount."
        size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={save.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="coupon-form" size="sm" loading={save.isPending}>
              {editing ? "Save changes" : "Create coupon"}
            </Button>
          </>
        }
      >
        <form
          id="coupon-form"
          onSubmit={handleSubmit((values) => save.mutate(values))}
          className="grid gap-4 sm:grid-cols-2"
          noValidate
        >
          <FormField label="Code" htmlFor="coupon-code" required error={errors.code?.message}>
            <Input id="coupon-code" className="font-mono uppercase" invalid={Boolean(errors.code)} {...register("code")} />
          </FormField>
          <FormField label="Usage limit" htmlFor="coupon-limit" hint="Leave blank for unlimited." error={errors.usageLimit?.message}>
            <Input id="coupon-limit" type="number" min="1" {...register("usageLimit")} />
          </FormField>
          <FormField label="Discount percent" htmlFor="coupon-percent" error={errors.discountPercent?.message}>
            <Input id="coupon-percent" type="number" step="0.01" min="0" max="100" {...register("discountPercent")} />
          </FormField>
          <FormField label="Discount amount (BDT)" htmlFor="coupon-amount" error={errors.discountAmount?.message}>
            <Input id="coupon-amount" type="number" step="0.01" min="0" {...register("discountAmount")} />
          </FormField>
          <FormField label="Minimum spend" htmlFor="coupon-min" error={errors.minimumAmount?.message}>
            <Input id="coupon-min" type="number" step="0.01" min="0" {...register("minimumAmount")} />
          </FormField>
          <FormField label="Maximum discount" htmlFor="coupon-max" error={errors.maxDiscount?.message}>
            <Input id="coupon-max" type="number" step="0.01" min="0" {...register("maxDiscount")} />
          </FormField>
          <FormField label="Starts" htmlFor="coupon-start" error={errors.startDate?.message}>
            <Input id="coupon-start" type="date" {...register("startDate")} />
          </FormField>
          <FormField label="Ends" htmlFor="coupon-end" error={errors.endDate?.message}>
            <Input id="coupon-end" type="date" {...register("endDate")} />
          </FormField>
          <FormField label="Description" htmlFor="coupon-description" error={errors.description?.message} className="sm:col-span-2">
            <Textarea id="coupon-description" rows={2} {...register("description")} />
          </FormField>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" className="h-4 w-4 rounded border-border" {...register("isActive")} />
            Active immediately
          </label>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        title="Delete this coupon?"
        description="Customers will no longer be able to redeem this code. Existing orders keep their discount."
        confirmLabel="Delete coupon"
        loading={remove.isPending}
        destructive
      />
    </div>
  );
}
