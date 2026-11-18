"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { ProductImagesDialog } from "./product-images-dialog";
import { productColumns } from "./product-columns";

import { DataTable } from "@/components/dashboard/data-table";
import { PageSection } from "@/components/dashboard/page-section";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Input, Select } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { categoriesApi, productsApi } from "@/lib/api/services";
import { PRODUCT_STATUSES } from "@/lib/constants";
import { getErrorMessage, humanizeEnum } from "@/lib/utils";
import type { Paginated, Product } from "@/types";
import { productName } from "@/types";

export function ProductsAdmin() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("ALL");
  const [categoryId, setCategoryId] = React.useState("ALL");
  const [deleting, setDeleting] = React.useState<Product | null>(null);
  const [imagesFor, setImagesFor] = React.useState<Product | null>(null);
  const [statusPendingId, setStatusPendingId] = React.useState<string | null>(null);
  const [featuredPendingId, setFeaturedPendingId] = React.useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);

  React.useEffect(() => setPage(1), [debouncedSearch, status, categoryId]);

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
        { page, search: debouncedSearch, status, categoryId },
      ] as const,
    [page, debouncedSearch, status, categoryId],
  );

  const query = useQuery({
    queryKey: listKey,
    queryFn: () =>
      productsApi.list({
        page,
        limit: 12,
        search: debouncedSearch.trim() || undefined,
        status: status === "ALL" ? undefined : (status as Product["status"]),
        category: categoryId === "ALL" ? undefined : categorySlug,
      }),
    enabled: categoryId === "ALL" || Boolean(categorySlug),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    void queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const remove = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      toast.success("Product deleted");
      setDeleting(null);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not delete the product")),
  });

  const toggleFeatured = useMutation({
    mutationFn: (product: Product) =>
      productsApi.update(product.id, { isFeatured: !product.isFeatured }),
    onMutate: async (product) => {
      setFeaturedPendingId(product.id);
      await queryClient.cancelQueries({ queryKey: ["admin", "products"] });
      const previous = queryClient.getQueryData<Paginated<Product>>(listKey);
      queryClient.setQueryData<Paginated<Product>>(listKey, (current) =>
        current
          ? {
              ...current,
              items: current.items.map((item) =>
                item.id === product.id
                  ? { ...item, isFeatured: !item.isFeatured }
                  : item,
              ),
            }
          : current,
      );
      return { previous };
    },
    onSuccess: () => toast.success("Featured flag updated"),
    onError: (error, _product, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listKey, context.previous);
      }
      toast.error(getErrorMessage(error, "Could not update the product"));
    },
    onSettled: () => {
      setFeaturedPendingId(null);
      invalidate();
    },
  });

  const toggleStatus = useMutation({
    mutationFn: (product: Product) =>
      productsApi.updateStatus(
        product.id,
        product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      ),
    onMutate: async (product) => {
      setStatusPendingId(product.id);
      await queryClient.cancelQueries({ queryKey: ["admin", "products"] });
      const previous = queryClient.getQueryData<Paginated<Product>>(listKey);
      const nextStatus = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      queryClient.setQueryData<Paginated<Product>>(listKey, (current) =>
        current
          ? {
              ...current,
              items: current.items.map((item) =>
                item.id === product.id ? { ...item, status: nextStatus } : item,
              ),
            }
          : current,
      );
      return { previous };
    },
    onSuccess: (_product, input) => {
      toast.success(input.status === "ACTIVE" ? "Product enabled" : "Product disabled");
    },
    onError: (error, _product, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listKey, context.previous);
      }
      toast.error(getErrorMessage(error, "Could not update the status"));
    },
    onSettled: () => {
      setStatusPendingId(null);
      invalidate();
    },
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative w-full sm:max-w-xs">
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
            className="sm:max-w-44"
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
            className="sm:max-w-40"
          >
            <option value="ALL">All statuses</option>
            {PRODUCT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {humanizeEnum(value)}
              </option>
            ))}
          </Select>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New product
          </Link>
        </Button>
      </div>

      <PageSection>
        <DataTable
          columns={columns}
          rows={rows}
          getKey={(product) => product.id}
          loading={query.isLoading}
          empty="No products match these filters."
        />
        <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {query.data
              ? `${query.data.meta.total} product${query.data.meta.total === 1 ? "" : "s"}`
              : "—"}
          </p>
          <Pagination
            page={query.data?.meta.page ?? 1}
            totalPages={query.data?.meta.totalPages ?? 1}
            onPageChange={setPage}
          />
        </div>
      </PageSection>

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
