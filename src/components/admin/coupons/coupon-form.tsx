"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { AdminFormPage } from "@/components/admin/admin-form-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, Input, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { invalidateKeys } from "@/hooks/use-optimistic-mutation";
import { couponsApi } from "@/lib/api/services";
import { queryKeys, relatedKeys } from "@/lib/query-keys";
import { formResolver } from "@/lib/form-resolver";
import { getErrorMessage } from "@/lib/utils";
import { couponSchema, type CouponValues } from "@/lib/validations";

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
  return value ? value.slice(0, 10) : "";
}

export function CouponForm({ couponId }: { couponId?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = Boolean(couponId);

  const coupon = useQuery({
    queryKey: queryKeys.coupons.detail(couponId ?? ""),
    queryFn: () => couponsApi.get(couponId!),
    enabled: Boolean(couponId),
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CouponValues>({
    resolver: formResolver<CouponValues>(couponSchema),
    defaultValues: EMPTY,
  });

  React.useEffect(() => {
    if (!coupon.data) return;
    reset({
      code: coupon.data.code,
      description: coupon.data.description ?? "",
      discountPercent: coupon.data.discountPercent ?? "",
      discountAmount: coupon.data.discountAmount ?? "",
      minimumAmount: coupon.data.minimumAmount ?? "",
      maxDiscount: coupon.data.maxDiscount ?? "",
      usageLimit: coupon.data.usageLimit ?? "",
      isActive: coupon.data.isActive,
      startDate: toDateInput(coupon.data.startDate),
      endDate: toDateInput(coupon.data.endDate),
    });
  }, [coupon.data, reset]);

  const save = useMutation({
    mutationFn: (values: CouponValues) => {
      const payload = {
        code: values.code.toUpperCase(),
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
      return couponId
        ? couponsApi.update(couponId, payload)
        : couponsApi.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Coupon updated" : "Coupon created");
      invalidateKeys(queryClient, relatedKeys("coupons"));
      router.push("/admin/coupons");
      router.refresh();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not save the coupon")),
  });

  if (isEdit && coupon.isLoading) {
    return (
      <AdminFormPage
        backHref="/admin/coupons"
        backLabel="Coupons"
        eyebrow="Marketing"
        title="Edit coupon"
        description="Loading…"
      >
        <Skeleton className="h-72 w-full max-w-3xl rounded-none" />
      </AdminFormPage>
    );
  }

  if (isEdit && (coupon.isError || (!coupon.isLoading && !coupon.data))) {
    return (
      <AdminFormPage
        backHref="/admin/coupons"
        backLabel="Coupons"
        eyebrow="Marketing"
        title="Coupon not found"
        description="This code may have been deleted."
      >
        <Button asChild>
          <Link href="/admin/coupons">Back to coupons</Link>
        </Button>
      </AdminFormPage>
    );
  }

  return (
    <AdminFormPage
      backHref="/admin/coupons"
      backLabel="Coupons"
      eyebrow="Marketing"
      title={isEdit ? "Edit coupon" : "New coupon"}
      description="Provide exactly one discount type — a percentage or a fixed amount — and the window it can be redeemed in."
      badge={isEdit ? coupon.data?.code : undefined}
    >
      <form
        id="coupon-form"
        onSubmit={handleSubmit((values) => {
          if (save.isPending) return;
          save.mutate(values);
        })}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
        noValidate
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Discount</CardTitle>
              <CardDescription>
                Codes are case-insensitive and stored in uppercase.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Code"
                htmlFor="coupon-code"
                required
                error={errors.code?.message}
              >
                <Input
                  id="coupon-code"
                  className="font-mono uppercase"
                  placeholder="SPRING26"
                  invalid={Boolean(errors.code)}
                  {...register("code")}
                />
              </FormField>
              <FormField
                label="Usage limit"
                htmlFor="coupon-limit"
                hint="Leave blank for unlimited."
                error={errors.usageLimit?.message}
              >
                <Input
                  id="coupon-limit"
                  type="number"
                  min="1"
                  {...register("usageLimit")}
                />
              </FormField>
              <FormField
                label="Discount percent"
                htmlFor="coupon-percent"
                hint="Use this or a fixed amount, not both."
                error={errors.discountPercent?.message}
              >
                <Input
                  id="coupon-percent"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  invalid={Boolean(errors.discountPercent)}
                  {...register("discountPercent")}
                />
              </FormField>
              <FormField
                label="Discount amount (BDT)"
                htmlFor="coupon-amount"
                error={errors.discountAmount?.message}
              >
                <Input
                  id="coupon-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("discountAmount")}
                />
              </FormField>
              <FormField
                label="Minimum spend"
                htmlFor="coupon-min"
                error={errors.minimumAmount?.message}
              >
                <Input
                  id="coupon-min"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("minimumAmount")}
                />
              </FormField>
              <FormField
                label="Maximum discount"
                htmlFor="coupon-max"
                hint="Caps percentage discounts."
                error={errors.maxDiscount?.message}
              >
                <Input
                  id="coupon-max"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("maxDiscount")}
                />
              </FormField>
              <FormField
                label="Description"
                htmlFor="coupon-description"
                error={errors.description?.message}
                className="sm:col-span-2"
              >
                <Textarea
                  id="coupon-description"
                  rows={3}
                  placeholder="Shown to customers at checkout when the code applies."
                  {...register("description")}
                />
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Window</CardTitle>
              <CardDescription>
                Leave dates blank for a code that starts now and never expires.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField label="Starts" htmlFor="coupon-start" error={errors.startDate?.message}>
                <Input id="coupon-start" type="date" {...register("startDate")} />
              </FormField>
              <FormField label="Ends" htmlFor="coupon-end" error={errors.endDate?.message}>
                <Input id="coupon-end" type="date" {...register("endDate")} />
              </FormField>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 self-start lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
              <CardDescription>Inactive codes fail validation at checkout.</CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <div className="flex items-start justify-between gap-3 rounded-none border border-border bg-muted/30 p-3">
                    <div>
                      <p className="text-xs font-semibold">Active</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                        Customers can redeem this code immediately.
                      </p>
                    </div>
                    <Switch
                      checked={Boolean(field.value)}
                      onCheckedChange={field.onChange}
                      aria-label="Coupon active"
                    />
                  </div>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button type="submit" form="coupon-form" loading={save.isPending} size="lg">
              {save.isPending
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Create coupon"}
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/admin/coupons">Cancel</Link>
            </Button>
          </div>
        </aside>
      </form>
    </AdminFormPage>
  );
}
