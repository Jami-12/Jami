"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ImageIcon,
  Pencil,
  Plus,
  Search,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ProductImagesDialog } from "@/components/admin/product-images-dialog";
import { DataTable, type DataColumn } from "@/components/dashboard/data-table";
import { PageSection } from "@/components/dashboard/page-section";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { Input, FormField, Select, Textarea } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Price } from "@/components/ui/price";
import { SmartImage } from "@/components/ui/smart-image";
import { ProductStatusBadge } from "@/components/ui/status-badge";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { brandsApi, categoriesApi, productsApi } from "@/lib/api/services";
import { PRODUCT_STATUSES } from "@/lib/constants";
import { formResolver } from "@/lib/form-resolver";
import { getErrorMessage, humanizeEnum } from "@/lib/utils";
import { productFormSchema, type ProductFormValues } from "@/lib/validations";
import type { Product } from "@/types";
import { productImage, productName } from "@/types";

const EMPTY: ProductFormValues = {
  title: "",
  sku: "",
  description: "",
  shortDescription: "",
  price: "" as unknown as number,
  discountPrice: "",
  purchasePrice: "",
  stock: 0,
  minimumStockLevel: 5,
  status: "DRAFT",
  isFeatured: false,
  categoryId: "",
  brandId: "",
  brandName: "",
  modelUrl: "",
  thumbnail: "",
  slug: "",
};

export function ProductsAdmin() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("ALL");
  const [categoryId, setCategoryId] = React.useState("ALL");
  const debouncedSearch = useDebouncedValue(search, 300);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [deleting, setDeleting] = React.useState<Product | null>(null);
  const [imagesFor, setImagesFor] = React.useState<Product | null>(null);

  React.useEffect(() => setPage(1), [debouncedSearch, status, categoryId]);

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
    staleTime: 120_000,
  });
  const brands = useQuery({
    queryKey: ["brands"],
    queryFn: () => brandsApi.list(),
    staleTime: 120_000,
  });

  const categorySlug = categories.data?.find((item) => item.id === categoryId)?.slug;

  const query = useQuery({
    queryKey: ["admin", "products", { page, search: debouncedSearch, status, categoryId }],
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: formResolver<ProductFormValues>(productFormSchema),
    defaultValues: EMPTY,
  });

  const openCreate = () => {
    setEditing(null);
    reset({ ...EMPTY, categoryId: categories.data?.[0]?.id ?? "" });
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    reset({
      title: product.title,
      sku: product.sku,
      description: product.description,
      shortDescription: product.shortDescription ?? "",
      price: product.price,
      discountPrice: product.discountPrice ?? "",
      purchasePrice: product.purchasePrice ?? "",
      stock: product.stock,
      minimumStockLevel: product.minimumStockLevel,
      status: product.status,
      isFeatured: product.isFeatured,
      categoryId: product.category.id,
      brandId: product.brand?.id ?? "",
      brandName: "",
      modelUrl: product.modelUrl ?? "",
      thumbnail: product.thumbnail ?? "",
      slug: product.slug,
    });
    setDialogOpen(true);
  };

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    void queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const save = useMutation({
    mutationFn: (values: ProductFormValues) => {
      const discountPrice =
        values.discountPrice === "" || values.discountPrice === undefined
          ? null
          : Number(values.discountPrice);
      const purchasePrice =
        values.purchasePrice === "" || values.purchasePrice === undefined
          ? null
          : Number(values.purchasePrice);

      const payload = {
        title: values.title,
        sku: values.sku,
        description: values.description,
        shortDescription: values.shortDescription || null,
        price: Number(values.price),
        discountPrice,
        purchasePrice,
        stock: Number(values.stock),
        minimumStockLevel: values.minimumStockLevel ? Number(values.minimumStockLevel) : undefined,
        status: values.status as Product["status"],
        isFeatured: Boolean(values.isFeatured),
        categoryId: values.categoryId,
        brandId: values.brandId ? values.brandId : null,
        modelUrl: values.modelUrl || null,
        thumbnail: values.thumbnail || null,
        slug: values.slug || undefined,
      };

      return editing ? productsApi.update(editing.id, payload) : productsApi.create(payload);
    },
    onSuccess: (product) => {
      toast.success(editing ? "Product updated" : "Product created");
      setDialogOpen(false);
      setEditing(null);
      invalidate();
      if (!editing) setImagesFor(product);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not save the product")),
  });

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
    onSuccess: () => {
      toast.success("Featured flag updated");
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not update the product")),
  });

  const rows = query.data?.items ?? [];

  const columns: DataColumn<Product>[] = [
    {
      header: "Product",
      cell: (product) => (
        <div className="flex items-center gap-3">
          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
            <SmartImage
              src={productImage(product)}
              alt={productName(product)}
              fill
              sizes="40px"
              className="object-cover"
            />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold">{productName(product)}</p>
            <p className="text-[11px] text-muted-foreground">
              {product.sku} · {product.category.name}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Price",
      cell: (product) => (
        <Price amount={product.finalPrice} compareAt={product.originalPrice} size="sm" />
      ),
    },
    {
      header: "Stock",
      cell: (product) => (
        <span
          className={
            product.stock <= product.minimumStockLevel
              ? "font-bold text-amber-600 dark:text-amber-400"
              : "font-semibold"
          }
        >
          {product.stock}
        </span>
      ),
    },
    { header: "Status", cell: (product) => <ProductStatusBadge status={product.status} /> },
    {
      header: "Featured",
      cell: (product) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={product.isFeatured ? "Remove from featured" : "Mark as featured"}
          onClick={() => toggleFeatured.mutate(product)}
          disabled={toggleFeatured.isPending}
        >
          {product.isFeatured ? (
            <Star className="h-4 w-4 fill-amber-400 text-amber-500" aria-hidden="true" />
          ) : (
            <StarOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          )}
        </Button>
      ),
    },
    {
      header: "",
      cell: (product) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Manage images for ${productName(product)}`}
            onClick={() => setImagesFor(product)}
          >
            <ImageIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${productName(product)}`}
            onClick={() => openEdit(product)}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${productName(product)}`}
            className="text-muted-foreground hover:text-red-600"
            onClick={() => setDeleting(product)}
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
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
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
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New product
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
            {query.data ? `${query.data.meta.total} product${query.data.meta.total === 1 ? "" : "s"}` : "—"}
          </p>
          <Pagination
            page={query.data?.meta.page ?? 1}
            totalPages={query.data?.meta.totalPages ?? 1}
            onPageChange={setPage}
          />
        </div>
      </PageSection>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? "Edit product" : "New product"}
        description="Pricing, stock and publication settings."
        size="xl"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)} disabled={save.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="product-form" size="sm" loading={save.isPending}>
              {editing ? "Save changes" : "Create product"}
            </Button>
          </>
        }
      >
        <form
          id="product-form"
          onSubmit={handleSubmit((values) => {
            if (!editing && !values.thumbnail) {
              toast.error("Add a thumbnail image URL — the API requires at least one image.");
              return;
            }
            save.mutate(values);
          })}
          className="grid gap-4 sm:grid-cols-2"
          noValidate
        >
          <FormField label="Title" htmlFor="product-title" required error={errors.title?.message} className="sm:col-span-2">
            <Input id="product-title" invalid={Boolean(errors.title)} {...register("title")} />
          </FormField>
          <FormField label="SKU" htmlFor="product-sku" required error={errors.sku?.message}>
            <Input id="product-sku" invalid={Boolean(errors.sku)} {...register("sku")} />
          </FormField>
          <FormField label="Slug" htmlFor="product-slug" hint="Generated from the title when blank." error={errors.slug?.message}>
            <Input id="product-slug" {...register("slug")} />
          </FormField>
          <FormField label="Category" htmlFor="product-category" required error={errors.categoryId?.message}>
            <Select id="product-category" invalid={Boolean(errors.categoryId)} {...register("categoryId")}>
              <option value="">Choose a category</option>
              {categories.data?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Brand" htmlFor="product-brand" error={errors.brandId?.message}>
            <Select id="product-brand" {...register("brandId")}>
              <option value="">No brand</option>
              {brands.data?.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Price (BDT)" htmlFor="product-price" required error={errors.price?.message}>
            <Input id="product-price" type="number" step="0.01" min="0" invalid={Boolean(errors.price)} {...register("price")} />
          </FormField>
          <FormField label="Discount price" htmlFor="product-discount" hint="Leave blank for no discount." error={errors.discountPrice?.message}>
            <Input id="product-discount" type="number" step="0.01" min="0" {...register("discountPrice")} />
          </FormField>
          <FormField label="Purchase cost" htmlFor="product-cost" error={errors.purchasePrice?.message}>
            <Input id="product-cost" type="number" step="0.01" min="0" {...register("purchasePrice")} />
          </FormField>
          <FormField label="Stock" htmlFor="product-stock" required error={errors.stock?.message}>
            <Input id="product-stock" type="number" min="0" invalid={Boolean(errors.stock)} {...register("stock")} />
          </FormField>
          <FormField label="Minimum stock level" htmlFor="product-min-stock" error={errors.minimumStockLevel?.message}>
            <Input id="product-min-stock" type="number" min="0" {...register("minimumStockLevel")} />
          </FormField>
          <FormField label="Status" htmlFor="product-status">
            <Select id="product-status" {...register("status")}>
              {PRODUCT_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {humanizeEnum(value)}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField
            label="Thumbnail URL"
            htmlFor="product-thumbnail"
            hint="Required for new products. You can upload more images afterwards."
            error={errors.thumbnail?.message}
            className="sm:col-span-2"
          >
            <Input id="product-thumbnail" type="url" placeholder="https://…" {...register("thumbnail")} />
          </FormField>
          <FormField label="3D model URL (GLB/GLTF)" htmlFor="product-model" error={errors.modelUrl?.message} className="sm:col-span-2">
            <Input id="product-model" type="url" placeholder="Optional — enables the 3D viewer" {...register("modelUrl")} />
          </FormField>
          <FormField label="Short description" htmlFor="product-short" error={errors.shortDescription?.message} className="sm:col-span-2">
            <Textarea id="product-short" rows={2} {...register("shortDescription")} />
          </FormField>
          <FormField label="Description" htmlFor="product-description" required error={errors.description?.message} className="sm:col-span-2">
            <Textarea id="product-description" rows={5} invalid={Boolean(errors.description)} {...register("description")} />
          </FormField>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" className="h-4 w-4 rounded border-border" {...register("isFeatured")} />
            Feature this product on the storefront
          </label>
        </form>
      </Dialog>

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
