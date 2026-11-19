"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";

import { ProductImagesDialog } from "./product-images-dialog";
import { productColumns } from "./product-columns";

import { AdminListCard } from "@/components/admin/shared/admin-list-card";
import { AdminListHeader } from "@/components/admin/shared/admin-list-header";
import { ListPagination } from "@/components/dashboard/list-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Input, Select } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  clampPage,
  useOptimisticMutation,
} from "@/hooks/use-optimistic-mutation";
import { categoriesApi, productsApi } from "@/lib/api/services";
import { PRODUCT_STATUSES } from "@/lib/constants";
import { relatedKeys } from "@/lib/query-keys";
import { humanizeEnum } from "@/lib/utils";
import type { Paginated, Product } from "@/types";
import { productName } from "@/types";

export function ProductsAdmin() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("ALL");
  const [categoryId, setCategoryId] = React.useState("ALL");
  const [deleting, setDeleting] = React.useState<Product | null>(null);
  const [imagesFor, setImagesFor] = React.useState<Product | null>(null);
  const [statusPendingId, setStatusPendingId] = React.useState<string | null>(null);
  const [featuredPendingId, setFeaturedPendingId] = React.useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);

  React.useEffect(
    () => setPage(1),
    [debouncedSearch, status, categoryId, limit],
  );

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
    staleTime: 120_000,
  });

  const categorySlug = categories.data?.find((item) => item.id === categoryId)?.slug;

  const listKey = React.useMemo(
    () =>
      [
        "admin",
        "products",
        { page, limit, search: debouncedSearch, status, categoryId },
      ] as const,
    [page, limit, debouncedSearch, status, categoryId],
  );

  const query = useQuery({
    queryKey: listKey,
    queryFn: () =>
      productsApi.list({
        page,
        limit,
        search: debouncedSearch.trim() || undefined,
        status: status === "ALL" ? undefined : (status as Product["status"]),
        category: categoryId === "ALL" ? undefined : categorySlug,
      }),
    enabled: categoryId === "ALL" || Boolean(categorySlug),
  });

  const invalidateKeys = React.useMemo(() => relatedKeys("products"), []);

  const patchItems = (
    current: unknown,
    update: (items: Product[]) => Product[],
  ): unknown => {
    if (!current || typeof current !== "object" || !("items" in current)) return current;
    const data = current as Paginated<Product>;
    return { ...data, items: update(data.items) };
  };

  const remove = useOptimisticMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    optimisticKeys: [listKey],
    applyOptimistic: (current, id) =>
      patchItems(current, (items) => items.filter((item) => item.id !== id)),
    invalidateKeys,
    successMessage: "Product deleted",
    errorMessage: "Could not delete the product",
    onSuccess: () => {
      setDeleting(null);
      const cached = queryClient.getQueryData<Paginated<Product>>(listKey);
      if (cached) {
        const safe = clampPage(page, Math.max(0, cached.meta.total - 1), limit);
        if (safe !== page) setPage(safe);
      }
    },
  });

  const toggleFeatured = useOptimisticMutation({
    mutationFn: (product: Product) =>
      productsApi.update(product.id, { isFeatured: !product.isFeatured }),
    optimisticKeys: [listKey],
    applyOptimistic: (current, product) =>
      patchItems(current, (items) =>
        items.map((item) =>
          item.id === product.id ? { ...item, isFeatured: !item.isFeatured } : item,
        ),
      ),
    invalidateKeys,
    successMessage: "Featured flag updated",
    errorMessage: "Could not update the product",
    onMutate: (product) => setFeaturedPendingId(product.id),
    onSettled: () => setFeaturedPendingId(null),
  });

  const toggleStatus = useOptimisticMutation({
    mutationFn: (product: Product) =>
      productsApi.updateStatus(
        product.id,
        product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      ),
    optimisticKeys: [listKey],
    applyOptimistic: (current, product) =>
      patchItems(current, (items) =>
        items.map((item) =>
          item.id === product.id
            ? {
                ...item,
                status: item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
              }
            : item,
        ),
      ),
    invalidateKeys,
    successMessage: (_, product) =>
      product.status === "ACTIVE" ? "Product enabled" : "Product disabled",
    errorMessage: "Could not update the status",
    onMutate: (product) => setStatusPendingId(product.id),
    onSettled: () => setStatusPendingId(null),
  });

  const rows = query.data?.items ?? [];

  const columns = productColumns({
    statusPendingId,
    featuredPendingId,
    onToggleStatus: (product) => toggleStatus.mutate(product),
    onToggleFeatured: (product) => toggleFeatured.mutate(product),
    onManageImages: (product) => setImagesFor(product),
    onDelete: (product) => setDeleting(product),
  });

  const meta = query.data?.meta;

  return (
    <div className="space-y-5">
      <AdminListHeader
        eyebrow="Catalogue"
        title="Products"
        description="Search, filter and manage the catalogue. Visibility, featured flags and imagery update immediately."
        actions={
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New product
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_12rem_12rem]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, SKU…"
              aria-label="Search products"
              className="pl-9"
            />
          </div>
          <Select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="ALL">All categories</option>
            {categories.data?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="ALL">All statuses</option>
            {PRODUCT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {humanizeEnum(value)}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <AdminListCard
        title="All products"
        description="Tablet and desktop layouts show full details; swipe horizontally on a phone."
        count={meta?.total}
        countLabel="products"
        columns={columns}
        rows={rows}
        getKey={(product) => product.id}
        loading={query.isLoading}
        empty="No products match these filters."
        pagination={
          <ListPagination
            page={page}
            totalPages={meta?.totalPages ?? 1}
            totalItems={meta?.total}
            pageSize={limit}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setLimit(size);
              setPage(1);
            }}
          />
        }
      />

      {imagesFor ? (
        <ProductImagesDialog
          productId={imagesFor.id}
          productTitle={productName(imagesFor)}
          open={Boolean(imagesFor)}
          onClose={() => setImagesFor(null)}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        title="Delete this product?"
        description="Archived products disappear from the storefront. Existing order history is preserved."
        confirmLabel="Delete product"
        loading={remove.isPending}
        destructive
      />
    </div>
  );
}
