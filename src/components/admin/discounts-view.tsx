"use client";

import * as React from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Pencil, Percent, Plus, Search, Tag, Trash2 } from "lucide-react";
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
import { FlatDiscountSettings } from "@/components/admin/settings/flat-discount-settings";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { FormField, Input, Select } from "@/components/ui/input";
import { Price } from "@/components/ui/price";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { invalidateKeys } from "@/hooks/use-optimistic-mutation";
import { productDiscountsApi, productsApi } from "@/lib/api/services";
import { formResolver } from "@/lib/form-resolver";
import { queryKeys, relatedKeys } from "@/lib/query-keys";
import { formatDate, getErrorMessage, humanizeEnum, isoDate } from "@/lib/utils";
import { discountSchema, type DiscountValues } from "@/lib/validations";
import type { Product, ProductDiscount, ProductDiscountDetail } from "@/types";

function inDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

const EMPTY: DiscountValues = {
  discountType: "PERCENTAGE",
  discountValue: "" as unknown as number,
  startDate: isoDate(new Date()),
  endDate: inDays(30),
  isActive: true,
};

type DiscountStatus = "ACTIVE" | "SCHEDULED" | "EXPIRED" | "INACTIVE" | "NONE";

const STATUS_TONE: Record<DiscountStatus, "success" | "info" | "warning" | "neutral"> = {
  ACTIVE: "success",
  SCHEDULED: "info",
  EXPIRED: "warning",
  INACTIVE: "neutral",
  NONE: "neutral",
};

function summaryStatus(discount: ProductDiscount | null): DiscountStatus {
  if (!discount) return "NONE";
  const now = Date.now();
  if (discount.startDate && new Date(discount.startDate).getTime() > now) return "SCHEDULED";
  if (discount.endDate && new Date(discount.endDate).getTime() < now) return "EXPIRED";
  return "ACTIVE";
}

/** Manual sale price set in the product form (independent of campaigns). */
function hasFlagDiscount(product: Product): boolean {
  return Boolean(
    product.isDiscountActive &&
      product.discountPrice !== null &&
      product.discountPrice > 0 &&
      product.discountPrice < product.price,
  );
}

export function DiscountsView() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(15);
  const debounced = useDebouncedValue(search, 300);
  const [open, setOpen] = React.useState(false);
  const [productId, setProductId] = React.useState("");
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [removing, setRemoving] = React.useState<Product | null>(null);
  const [productError, setProductError] = React.useState<string | undefined>();

  React.useEffect(() => setPage(1), [debounced, limit]);

  const query = useQuery({
    queryKey: queryKeys.products.discounts({ page, limit, search: debounced }),
    queryFn: () =>
      productsApi.list({
        page,
        limit,
        search: debounced.trim() || undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
  });

  const options = useQuery({
    queryKey: queryKeys.products.discountOptions(),
    queryFn: () => productsApi.list({ limit: 100, sortBy: "title", sortOrder: "asc" }),
    staleTime: 5 * 60_000,
  });

  const rows = React.useMemo(() => query.data?.items ?? [], [query.data]);

  // The product list only exposes active discounts, so each visible product's
  // discount is fetched to surface scheduled, expired and paused campaigns too.
  const discountQueries = useQueries({
    queries: rows.map((product) => ({
      queryKey: queryKeys.products.discount(product.id),
      queryFn: () => productDiscountsApi.get(product.id),
      staleTime: 60_000,
    })),
  });

  const detailById = React.useMemo(() => {
    const map = new Map<string, ProductDiscountDetail | null>();
    rows.forEach((product, index) => {
      const result = discountQueries[index];
      if (result?.isSuccess) map.set(product.id, result.data ?? null);
    });
    return map;
  }, [rows, discountQueries]);

  const detailFor = (product: Product): ProductDiscountDetail | null | undefined =>
    detailById.has(product.id) ? detailById.get(product.id) : undefined;

  const statusFor = (product: Product): DiscountStatus => {
    const detail = detailFor(product);
    if (detail !== undefined && detail) return detail.status;
    if (hasFlagDiscount(product)) return "ACTIVE";
    if (detail === undefined) return summaryStatus(product.discount);
    return "NONE";
  };

  const hasDiscount = (product: Product): boolean => {
    if (hasFlagDiscount(product)) return true;
    const detail = detailFor(product);
    return detail !== undefined ? Boolean(detail) : Boolean(product.discount);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DiscountValues>({
    resolver: formResolver<DiscountValues>(discountSchema),
    defaultValues: EMPTY,
  });

  const openCreate = () => {
    setEditingProduct(null);
    setProductId("");
    setProductError(undefined);
    reset(EMPTY);
    setOpen(true);
  };

  const openEdit = (product: Product) => {
    const detail = detailFor(product);
    const startDate = detail?.startDate ?? product.discount?.startDate;
    const endDate = detail?.endDate ?? product.discount?.endDate;
    setEditingProduct(product);
    setProductId(product.id);
    setProductError(undefined);
    reset({
      discountType: detail?.discountType ?? product.discount?.type ?? "PERCENTAGE",
      discountValue: detail?.discountValue ?? product.discount?.value ?? ("" as unknown as number),
      startDate: startDate ? startDate.slice(0, 10) : isoDate(new Date()),
      endDate: endDate ? endDate.slice(0, 10) : inDays(30),
      isActive: detail?.isActive ?? true,
    });
    setOpen(true);
  };

  const invalidate = () => invalidateKeys(queryClient, relatedKeys("discounts"));

  const save = useMutation({
    mutationFn: (values: DiscountValues) => {
      const targetId = editingProduct?.id ?? productId;
      const payload = {
        discountType: values.discountType,
        discountValue: Number(values.discountValue),
        startDate: values.startDate || undefined,
        endDate: values.endDate,
        isActive: Boolean(values.isActive),
      };
      return editingProduct
        ? productDiscountsApi.update(targetId, payload)
        : productDiscountsApi.create(targetId, payload);
    },
    onSuccess: () => {
      toast.success(editingProduct ? "Discount updated" : "Discount applied");
      setOpen(false);
      setEditingProduct(null);
      setProductId("");
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not save the discount")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => productDiscountsApi.remove(id),
    onSuccess: () => {
      toast.success("Discount removed");
      setRemoving(null);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not remove the discount")),
  });

  const submit = (values: DiscountValues) => {
    if (!editingProduct && !productId) {
      setProductError("Choose a product to discount");
      return;
    }
    setProductError(undefined);
    save.mutate(values);
  };

  const productOptions = options.data?.items ?? [];

  const columns: DataColumn<Product>[] = [
    {
      header: "Product",
      cell: (product) => (
        <div className="min-w-0">
          <p className="max-w-64 truncate text-xs font-bold">{product.title}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{product.sku}</p>
        </div>
      ),
    },
    {
      header: "Price",
      cell: (product) => (
        <div className="text-right">
          <Price amount={product.finalPrice} size="sm" compareAt={product.originalPrice} />
        </div>
      ),
      className: "text-right",
      headerClassName: "text-right",
    },
    {
      header: "Discount",
      cell: (product) => {
        const detail = detailFor(product);
        if (detail) {
          const amount =
            detail.discountType === "PERCENTAGE"
              ? `${detail.discountValue}% off`
              : `${detail.discountValue} BDT off`;
          return (
            <div>
              <p className="text-xs font-bold">{amount}</p>
              <p className="text-[10px] text-muted-foreground">
                {detail.status === "ACTIVE" ? (
                  <>
                    Saves <Price amount={detail.amount} size="xs" /> per unit
                  </>
                ) : (
                  humanizeEnum(detail.status)
                )}
              </p>
            </div>
          );
        }
        if (product.discount) {
          return (
            <div>
              <p className="text-xs font-bold">
                {product.discount.type === "PERCENTAGE"
                  ? `${product.discount.value}% off`
                  : `${product.discount.value} BDT off`}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Saves <Price amount={product.discount.amount} size="xs" /> per unit
              </p>
            </div>
          );
        }
        return (
          <span className="text-[11px] text-muted-foreground">
            {detail === undefined ? "Checking…" : "No discount"}
          </span>
        );
      },
    },
    {
      header: "Window",
      cell: (product) => {
        const detail = detailFor(product);
        const startDate = detail?.startDate ?? product.discount?.startDate;
        const endDate = detail?.endDate ?? product.discount?.endDate;
        if (!startDate && !endDate)
          return <span className="text-[11px] text-muted-foreground">—</span>;
        return (
          <div className="text-[11px] text-muted-foreground">
            <p>{startDate ? formatDate(startDate) : "Immediate"}</p>
            <p>to {endDate ? formatDate(endDate) : "No end"}</p>
          </div>
        );
      },
    },
    {
      header: "Status",
      cell: (product) => {
        const status = statusFor(product);
        return (
          <Badge tone={STATUS_TONE[status]} dot={status !== "NONE"}>
            {humanizeEnum(status)}
          </Badge>
        );
      },
    },
    {
      header: "",
      cell: (product) => {
        const discounted = hasDiscount(product);
        const pending =
          detailFor(product) === undefined && !product.discount && !hasFlagDiscount(product);
        return (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => openEdit(product)} disabled={pending}>
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              {discounted ? "Edit" : "Add"}
            </Button>
            {discounted ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove discount from ${product.title}`}
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setRemoving(product)}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : null}
          </div>
        );
      },
      className: "text-right",
      headerClassName: "text-right",
    },
  ];

  const withDiscount = rows.filter((product) => hasDiscount(product)).length;
  const activeDiscounts = rows.filter((product) => statusFor(product) === "ACTIVE").length;

  return (
    <div className="space-y-4">
      <Card className="bg-muted/30">
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Pricing campaigns
            </p>
            <CardTitle className="font-display text-xl">Discounts</CardTitle>
            <CardDescription>
              Apply, schedule and monitor product discounts from one place.
            </CardDescription>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New discount
          </Button>
        </CardHeader>
      </Card>

      <FlatDiscountSettings compact />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Discounted on page"
          value={withDiscount}
          hint={`${rows.length} product${rows.length === 1 ? "" : "s"} listed`}
          icon={Tag}
          tone="accent"
        />
        <StatCard
          label="Active campaigns"
          value={activeDiscounts}
          hint="Live right now"
          icon={Percent}
          tone="success"
        />
        <StatCard
          label="Scheduled or expired"
          value={Math.max(0, withDiscount - activeDiscounts)}
          hint="Needs review"
          icon={CalendarClock}
          tone="warning"
        />
      </div>

      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="font-display text-base">Product discounts</CardTitle>
            <CardDescription>Paginated catalogue with live campaign status.</CardDescription>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products…"
              aria-label="Search products for discounts"
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-4 sm:px-0">
          <DataTable
            columns={columns}
            rows={rows}
            getKey={(product) => product.id}
            loading={query.isLoading}
            empty="No products match this search."
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
        title={editingProduct ? "Edit discount" : "Apply discount"}
        description={
          editingProduct
            ? `Update the campaign for ${editingProduct.title}.`
            : "Apply a percentage or fixed discount to a specific product."
        }
        size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={save.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="discount-form" size="sm" loading={save.isPending}>
              {editingProduct ? "Save discount" : "Apply discount"}
            </Button>
          </>
        }
      >
        <form
          id="discount-form"
          onSubmit={handleSubmit(submit)}
          className="grid gap-4 sm:grid-cols-2"
          noValidate
        >
          <FormField
            label="Product"
            htmlFor="discount-product"
            required
            error={productError}
            hint={editingProduct ? "A product can only have one active discount." : undefined}
            className="sm:col-span-2"
          >
            <Select
              id="discount-product"
              value={productId}
              disabled={Boolean(editingProduct)}
              invalid={Boolean(productError)}
              onChange={(event) => {
                setProductId(event.target.value);
                setProductError(undefined);
              }}
            >
              <option value="">Choose a product…</option>
              {productOptions.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.title} — {product.sku}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Discount type" htmlFor="discount-type" required error={errors.discountType?.message}>
            <Select id="discount-type" {...register("discountType")}>
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED_AMOUNT">Fixed amount (BDT)</option>
            </Select>
          </FormField>
          <FormField
            label="Discount value"
            htmlFor="discount-value"
            required
            error={errors.discountValue?.message}
          >
            <Input
              id="discount-value"
              type="number"
              step="0.01"
              min="0"
              invalid={Boolean(errors.discountValue)}
              {...register("discountValue")}
            />
          </FormField>
          <FormField label="Starts" htmlFor="discount-start" error={errors.startDate?.message}>
            <Input id="discount-start" type="date" {...register("startDate")} />
          </FormField>
          <FormField label="Expires" htmlFor="discount-end" required error={errors.endDate?.message}>
            <Input id="discount-end" type="date" {...register("endDate")} />
          </FormField>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" className="h-4 w-4 rounded border-border" {...register("isActive")} />
            Campaign enabled
          </label>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing && remove.mutate(removing.id)}
        title="Remove this discount?"
        description={
          removing
            ? hasFlagDiscount(removing)
              ? `The scheduled campaign on ${removing.title} is removed. Its manual sale price stays active until disabled in the product form.`
              : `The discount on ${removing.title} is removed and the product returns to full price.`
            : undefined
        }
        confirmLabel="Remove discount"
        loading={remove.isPending}
        destructive
      />
    </div>
  );
}
