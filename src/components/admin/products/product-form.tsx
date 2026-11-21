"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { AdminFormPage } from "@/components/admin/admin-form-page";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_IMAGES_PER_PRODUCT,
  ProductMediaField,
  type PendingImage,
} from "./product-media-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { FormField, Input, Select, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { invalidateKeys } from "@/hooks/use-optimistic-mutation";
import {
  brandsApi,
  categoriesApi,
  productImagesApi,
  productsApi,
} from "@/lib/api/services";
import { PRODUCT_STATUSES } from "@/lib/constants";
import { queryKeys, relatedKeys } from "@/lib/query-keys";
import { formResolver } from "@/lib/form-resolver";
import { generateSku, slugify } from "@/lib/slug";
import { getErrorMessage, humanizeEnum } from "@/lib/utils";
import { productFormSchema, type ProductFormValues } from "@/lib/validations";
import type { Product, ProductImage, ProductInput } from "@/types";

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
  sizes: [],
  colors: [],
};

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = Boolean(productId);

  const [pendingImages, setPendingImages] = React.useState<PendingImage[]>([]);
  const [existingImages, setExistingImages] = React.useState<ProductImage[]>([]);
  const [removingImage, setRemovingImage] = React.useState<ProductImage | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState<{
    done: number;
    total: number;
  } | null>(null);
  const [slugTouched, setSlugTouched] = React.useState(isEdit);
  const [skuTouched, setSkuTouched] = React.useState(isEdit);
  const [sizeInput, setSizeInput] = React.useState("");
  const [colorName, setColorName] = React.useState("");
  const [colorHex, setColorHex] = React.useState("#facc15");
  const pendingRef = React.useRef<PendingImage[]>([]);

  React.useEffect(() => {
    pendingRef.current = pendingImages;
  }, [pendingImages]);

  React.useEffect(
    () => () => {
      for (const image of pendingRef.current) URL.revokeObjectURL(image.url);
    },
    [],
  );

  const clearPendingImages = React.useCallback(() => {
    setPendingImages((current) => {
      for (const image of current) URL.revokeObjectURL(image.url);
      return [];
    });
    setUploadProgress(null);
  }, []);

  const categories = useQuery({
    queryKey: queryKeys.categories.all(),
    queryFn: () => categoriesApi.list(),
    staleTime: 120_000,
  });
  const brands = useQuery({
    queryKey: queryKeys.brands.all(),
    queryFn: () => brandsApi.list(),
    staleTime: 120_000,
  });
  const product = useQuery({
    queryKey: queryKeys.products.admin.detail(productId ?? ""),
    queryFn: () => productsApi.get(productId!),
    enabled: Boolean(productId),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: formResolver<ProductFormValues>(productFormSchema),
    defaultValues: EMPTY,
  });

  const title = watch("title");
  const sizes = watch("sizes");
  const colors = watch("colors");

  const addSize = () => {
    const value = sizeInput.trim();
    if (!value) return;
    setValue(
      "sizes",
      Array.from(new Set([...(sizes ?? []), value])).slice(0, 30),
      { shouldDirty: true },
    );
    setSizeInput("");
  };

  const addColor = () => {
    const name = colorName.trim();
    if (!name || !/^#[0-9a-fA-F]{6}$/.test(colorHex)) return;
    setValue(
      "colors",
      [...(colors ?? []), { name, hex: colorHex.toLowerCase() }].slice(0, 30),
      { shouldDirty: true },
    );
    setColorName("");
  };

  React.useEffect(() => {
    if (!slugTouched) {
      setValue("slug", slugify(title ?? ""), { shouldDirty: true });
    }
    if (!skuTouched) {
      setValue("sku", generateSku(title ?? ""), { shouldDirty: true });
    }
  }, [title, slugTouched, skuTouched, setValue]);

  React.useEffect(() => {
    if (!isEdit && !watch("categoryId") && categories.data?.[0]) {
      setValue("categoryId", categories.data[0].id);
    }
  }, [categories.data, isEdit, setValue, watch]);

  React.useEffect(() => {
    if (!product.data) return;
    const item = product.data;
    setSlugTouched(true);
    setSkuTouched(true);
    setExistingImages(item.images);
    reset({
      title: item.title,
      sku: item.sku,
      description: item.description,
      shortDescription: item.shortDescription ?? "",
      price: item.price,
      discountPrice: item.discountPrice ?? "",
      purchasePrice: item.purchasePrice ?? "",
      stock: item.stock,
      minimumStockLevel: item.minimumStockLevel,
      status: item.status,
      isFeatured: item.isFeatured,
      categoryId: item.category.id,
      brandId: item.brand?.id ?? "",
      brandName: "",
      modelUrl: item.modelUrl ?? "",
      thumbnail: item.thumbnail ?? "",
      slug: item.slug,
      sizes: item.sizes ?? [],
      colors: item.colors ?? [],
    });
  }, [product.data, reset]);

  const invalidate = () => invalidateKeys(queryClient, relatedKeys("products"));

  const addFiles = React.useCallback(
    (files: File[]) => {
      const room = MAX_IMAGES_PER_PRODUCT - existingImages.length - pendingImages.length;
      if (room <= 0) {
        toast.error(`A product can hold up to ${MAX_IMAGES_PER_PRODUCT} images.`);
        return;
      }

      const errors: string[] = [];
      const accepted: PendingImage[] = [];
      let hasPrimary =
        pendingImages.some((image) => image.isPrimary) ||
        existingImages.some((image) => image.isPrimary);
      let hasSecondary =
        pendingImages.some((image) => image.isSecondary) ||
        Boolean(
          existingImages
            .filter((image) => !image.isPrimary)
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)[0],
        );

      for (const file of files) {
        const supported =
          ACCEPTED_IMAGE_TYPES.includes(
            file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
          ) || /\.(jpe?g|png|webp)$/i.test(file.name);

        if (!supported) {
          errors.push(`${file.name}: unsupported file type`);
          continue;
        }
        if (file.size > MAX_IMAGE_BYTES) {
          errors.push(`${file.name}: larger than 5 MB`);
          continue;
        }
        if (accepted.length >= room) {
          errors.push(`Only ${room} more image${room === 1 ? "" : "s"} can be added`);
          break;
        }

        accepted.push({
          id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,
          file,
          url: URL.createObjectURL(file),
          isPrimary: !hasPrimary,
          isSecondary: hasPrimary && !hasSecondary,
        });
        if (!hasPrimary) hasPrimary = true;
        else if (!hasSecondary) hasSecondary = true;
      }

      if (errors.length > 0) {
        toast.error(errors[0]!, {
          description:
            errors.length > 1 ? `${errors.length - 1} more issue(s)` : undefined,
        });
      }
      if (accepted.length > 0) {
        setPendingImages((current) => [...current, ...accepted]);
      }
    },
    [existingImages, pendingImages],
  );

  const removePendingImage = (id: string) => {
    setPendingImages((current) => {
      const removed = current.find((image) => image.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      const next = current.filter((image) => image.id !== id);
      if (
        removed?.isPrimary &&
        next.length > 0 &&
        !next.some((image) => image.isPrimary) &&
        !existingImages.some((image) => image.isPrimary)
      ) {
        next[0] = { ...next[0]!, isPrimary: true };
      }
      if (removed?.isSecondary && next.length > 0 && !next.some((image) => image.isSecondary)) {
        const candidate = next.find((image) => !image.isPrimary);
        if (candidate) candidate.isSecondary = true;
      }
      return next;
    });
  };

  const save = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const blankToUndefined = (
        value: string | null | undefined,
      ): string | undefined => {
        if (value === null || value === undefined) return undefined;
        const trimmed = value.trim();
        return trimmed === "" ? undefined : trimmed;
      };
      const optionalNumber = (
        value: number | "" | null | undefined,
      ): number | undefined => {
        if (value === "" || value === undefined || value === null) {
          return undefined;
        }
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : undefined;
      };

      const payload: ProductInput = {
        title: values.title.trim(),
        sku: values.sku.trim(),
        description: values.description.trim(),
        price: Number(values.price),
        stock: Number(values.stock),
        status: values.status as Product["status"],
        isFeatured: Boolean(values.isFeatured),
        categoryId: values.categoryId,
        sizes: values.sizes,
        colors: values.colors,
      };

      const slug = blankToUndefined(values.slug);
      if (slug) payload.slug = slug;

      // Nullable fields: omit when creating, clear explicitly when editing.
      const shortDescription = blankToUndefined(values.shortDescription);
      if (shortDescription !== undefined) payload.shortDescription = shortDescription;
      else if (isEdit) payload.shortDescription = null;

      const discountPrice = optionalNumber(values.discountPrice);
      if (discountPrice !== undefined) payload.discountPrice = discountPrice;
      else if (isEdit) payload.discountPrice = null;

      const purchasePrice = optionalNumber(values.purchasePrice);
      if (purchasePrice !== undefined) payload.purchasePrice = purchasePrice;
      else if (isEdit) payload.purchasePrice = null;

      const minimumStockLevel = optionalNumber(values.minimumStockLevel);
      if (minimumStockLevel !== undefined) {
        payload.minimumStockLevel = minimumStockLevel;
      }

      if (values.brandId) payload.brandId = values.brandId;
      else if (isEdit) payload.brandId = null;

      const modelUrl = blankToUndefined(values.modelUrl);
      if (modelUrl !== undefined) payload.modelUrl = modelUrl;
      else if (isEdit) payload.modelUrl = null;

      const uploadPending = async (id: string, hasExistingPrimary: boolean) => {
        if (pendingImages.length === 0) return;
        const designated =
          pendingImages.find((image) => image.isPrimary) ??
          (hasExistingPrimary ? undefined : pendingImages[0]);
        const ordered = designated
          ? [designated, ...pendingImages.filter((image) => image.id !== designated.id)]
          : pendingImages;

        setUploadProgress({ done: 0, total: ordered.length });
        try {
          let done = 0;
          const uploadedIds = new Map<string, string>();
          for (const image of ordered) {
            const uploaded = await productImagesApi.upload(id, [image.file], {
              altText: values.title,
              isPrimary: designated?.id === image.id,
            });
            if (uploaded[0]) uploadedIds.set(image.id, uploaded[0].id);
            done += 1;
            setUploadProgress({ done, total: ordered.length });
          }

          const secondary = ordered.find((image) => image.isSecondary);
          const secondaryId = secondary ? uploadedIds.get(secondary.id) : undefined;
          if (secondaryId) {
            const images = await productImagesApi.list(id);
            const primaryId = images.find((image) => image.isPrimary)?.id;
            if (secondaryId !== primaryId) {
              const rest = images
                .filter((image) => image.id !== primaryId && image.id !== secondaryId)
                .map((image) => image.id);
              await productImagesApi.reorder(id, [
                ...(primaryId ? [primaryId] : []),
                secondaryId,
                ...rest,
              ]);
            }
          }
        } finally {
          setUploadProgress(null);
        }
      };

      if (!productId) {
        const draft = await productsApi.create({ ...payload, status: "DRAFT" });
        await uploadPending(draft.id, false);
        const finalStatus = values.status as Product["status"];
        if (finalStatus !== "DRAFT") {
          return productsApi.update(draft.id, { status: finalStatus });
        }
        return draft;
      }

      const updated = await productsApi.update(productId, payload);
      await uploadPending(
        productId,
        existingImages.some((image) => image.isPrimary),
      );
      if (pendingImages.length === 0) return updated;
      return productsApi.get(productId).catch(() => updated);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Product updated" : "Product created");
      clearPendingImages();
      invalidate();
      router.push("/admin/products");
      router.refresh();
    },
    onError: (error) => {
      setUploadProgress(null);
      toast.error(getErrorMessage(error, "Could not save the product"));
    },
  });

  const setExistingPrimary = useMutation({
    mutationFn: (imageId: string) => productImagesApi.setPrimary(productId!, imageId),
    onSuccess: (result) => {
      setExistingImages(result.images);
      toast.success("Primary image updated");
      invalidate();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Could not update the primary image")),
  });

  const makeExistingSecondary = useMutation({
    mutationFn: (imageId: string) => {
      const primaryId = existingImages.find((image) => image.isPrimary)?.id;
      const rest = existingImages
        .filter((image) => image.id !== primaryId && image.id !== imageId)
        .map((image) => image.id);
      return productImagesApi.reorder(productId!, [
        ...(primaryId ? [primaryId] : []),
        imageId,
        ...rest,
      ]);
    },
    onSuccess: (result) => {
      setExistingImages(result.images);
      toast.success("Secondary image updated");
      invalidate();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Could not update the secondary image")),
  });

  const removeExistingImage = useMutation({
    mutationFn: (image: ProductImage) => productImagesApi.remove(productId!, image.id),
    onSuccess: (result) => {
      setExistingImages(result.images);
      setRemovingImage(null);
      toast.success("Image removed");
      invalidate();
    },
    onError: (error) => {
      setRemovingImage(null);
      toast.error(getErrorMessage(error, "Could not remove the image"));
    },
  });

  if (isEdit && product.isLoading) {
    return (
      <AdminFormPage
        backHref="/admin/products"
        backLabel="Products"
        eyebrow="Catalogue"
        title="Edit product"
        description="Loading this product…"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-4">
            <Skeleton className="h-72 w-full rounded-none" />
            <Skeleton className="h-64 w-full rounded-none" />
          </div>
          <Skeleton className="h-64 w-full rounded-none" />
        </div>
      </AdminFormPage>
    );
  }

  if (isEdit && (product.isError || (!product.isLoading && !product.data))) {
    return (
      <AdminFormPage
        backHref="/admin/products"
        backLabel="Products"
        eyebrow="Catalogue"
        title="Product not found"
        description="This product may have been deleted. Return to the catalogue and choose another piece."
      >
        <Button asChild>
          <Link href="/admin/products">Back to products</Link>
        </Button>
      </AdminFormPage>
    );
  }

  return (
    <AdminFormPage
      backHref="/admin/products"
      backLabel="Products"
      eyebrow="Catalogue"
      title={isEdit ? "Edit product" : "New product"}
      description="Pricing, stock, imagery and publication settings. Slug and SKU follow the title until you change them."
      badge={isEdit ? product.data?.status : "Draft"}
    >
      <form
        id="product-form"
        onSubmit={handleSubmit((values) => {
          if (save.isPending) return;
          const totalImages = existingImages.length + pendingImages.length;
          if (totalImages === 0 && values.status !== "DRAFT") {
            toast.error("Select at least one image from your device before publishing.");
            return;
          }
          save.mutate(values);
        })}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
        noValidate
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>
                What the piece is called, how it reads and how it is found.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Title"
                htmlFor="product-title"
                required
                error={errors.title?.message}
                className="sm:col-span-2"
              >
                <Input
                  id="product-title"
                  placeholder="e.g. Washed linen overshirt"
                  invalid={Boolean(errors.title)}
                  {...register("title")}
                />
              </FormField>
              <FormField
                label="Slug"
                htmlFor="product-slug"
                hint="Auto-generated from the title."
                error={errors.slug?.message}
              >
                <Input
                  id="product-slug"
                  placeholder="washed-linen-overshirt"
                  {...register("slug", { onChange: () => setSlugTouched(true) })}
                />
              </FormField>
              <FormField
                label="SKU"
                htmlFor="product-sku"
                required
                hint="Auto-generated until edited."
                error={errors.sku?.message}
              >
                <Input
                  id="product-sku"
                  placeholder="AETH-OVERSHIRT-XXXXX"
                  invalid={Boolean(errors.sku)}
                  {...register("sku", { onChange: () => setSkuTouched(true) })}
                />
              </FormField>
              <FormField
                label="Category"
                htmlFor="product-category"
                required
                error={errors.categoryId?.message}
              >
                <Select
                  id="product-category"
                  invalid={Boolean(errors.categoryId)}
                  {...register("categoryId")}
                >
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
              <FormField
                label="Short description"
                htmlFor="product-short"
                error={errors.shortDescription?.message}
                className="sm:col-span-2"
              >
                <Textarea
                  id="product-short"
                  rows={2}
                  placeholder="One sentence shown in cards and search."
                  {...register("shortDescription")}
                />
              </FormField>
              <FormField
                label="Description"
                htmlFor="product-description"
                required
                error={errors.description?.message}
                className="sm:col-span-2"
              >
                <Textarea
                  id="product-description"
                  rows={6}
                  invalid={Boolean(errors.description)}
                  {...register("description")}
                />
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing and stock</CardTitle>
              <CardDescription>
                Amounts in BDT. Leave the discount blank when there is no sale.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Price (BDT)"
                htmlFor="product-price"
                required
                error={errors.price?.message}
              >
                <Input
                  id="product-price"
                  type="number"
                  step="0.01"
                  min="0"
                  invalid={Boolean(errors.price)}
                  {...register("price")}
                />
              </FormField>
              <FormField
                label="Discount price"
                htmlFor="product-discount"
                hint="Must be lower than the price."
                error={errors.discountPrice?.message}
              >
                <Input
                  id="product-discount"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("discountPrice")}
                />
              </FormField>
              <FormField
                label="Purchase cost"
                htmlFor="product-cost"
                hint="Used for margin reporting."
                error={errors.purchasePrice?.message}
              >
                <Input
                  id="product-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("purchasePrice")}
                />
              </FormField>
              <FormField
                label="Stock"
                htmlFor="product-stock"
                required
                error={errors.stock?.message}
              >
                <Input
                  id="product-stock"
                  type="number"
                  min="0"
                  invalid={Boolean(errors.stock)}
                  {...register("stock")}
                />
              </FormField>
              <FormField
                label="Minimum stock level"
                htmlFor="product-min-stock"
                error={errors.minimumStockLevel?.message}
              >
                <Input
                  id="product-min-stock"
                  type="number"
                  min="0"
                  {...register("minimumStockLevel")}
                />
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <CardDescription>
                Optional sizes and colours shown on the product page. Leave empty
                for one-size, single-colour items.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="mb-2 text-xs font-semibold">Sizes</p>
                <div className="flex gap-2">
                  <Input
                    aria-label="Add a size"
                    placeholder="e.g. M, 42, XL"
                    maxLength={24}
                    value={sizeInput}
                    onChange={(event) => setSizeInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addSize();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSize}
                    disabled={!sizeInput.trim()}
                  >
                    Add
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(sizes ?? []).map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() =>
                        setValue(
                          "sizes",
                          (sizes ?? []).filter((value) => value !== size),
                          { shouldDirty: true },
                        )
                      }
                      className="inline-flex items-center gap-1 border border-border bg-muted px-2 py-1 text-xs hover:border-foreground"
                    >
                      {size}
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  ))}
                  {!sizes?.length ? (
                    <p className="text-xs text-muted-foreground">No sizes added.</p>
                  ) : null}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold">Colours</p>
                <div className="flex flex-wrap gap-2">
                  <Input
                    aria-label="Colour name"
                    placeholder="Colour name"
                    maxLength={40}
                    className="w-auto min-w-32 flex-1"
                    value={colorName}
                    onChange={(event) => setColorName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addColor();
                      }
                    }}
                  />
                  <input
                    aria-label="Colour value"
                    type="color"
                    value={colorHex}
                    onChange={(event) => setColorHex(event.target.value)}
                    className="h-9 w-12 cursor-pointer border border-border bg-background p-0.5"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addColor}
                    disabled={!colorName.trim()}
                  >
                    Add colour
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(colors ?? []).map((color, index) => (
                    <button
                      type="button"
                      key={`${color.name}-${color.hex}-${index}`}
                      onClick={() =>
                        setValue(
                          "colors",
                          (colors ?? []).filter((_, position) => position !== index),
                          { shouldDirty: true },
                        )
                      }
                      className="inline-flex items-center gap-1.5 border border-border bg-muted px-2 py-1 text-xs hover:border-foreground"
                    >
                      <span
                        className="inline-block h-3 w-3 rounded-full border border-foreground/20"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  ))}
                  {!colors?.length ? (
                    <p className="text-xs text-muted-foreground">No colours added.</p>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media and 3D</CardTitle>
              <CardDescription>
                Upload straight from this device. The first image becomes the card
                image and the next the hover view.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <ProductMediaField
                  existing={existingImages}
                  pending={pendingImages}
                  onAddFiles={addFiles}
                  onRemovePending={removePendingImage}
                  onMakePendingPrimary={(id) =>
                    setPendingImages((current) =>
                      current.map((image) => ({
                        ...image,
                        isPrimary: image.id === id,
                        isSecondary: image.id === id ? false : image.isSecondary,
                      })),
                    )
                  }
                  onMakePendingSecondary={(id) =>
                    setPendingImages((current) =>
                      current.map((image) => ({
                        ...image,
                        isSecondary: image.id === id,
                        isPrimary: image.id === id ? false : image.isPrimary,
                      })),
                    )
                  }
                  onMakeExistingPrimary={
                    productId ? (imageId) => setExistingPrimary.mutate(imageId) : undefined
                  }
                  onMakeExistingSecondary={
                    productId
                      ? (imageId) => makeExistingSecondary.mutate(imageId)
                      : undefined
                  }
                  onRemoveExisting={
                    productId ? (image) => setRemovingImage(image) : undefined
                  }
                  disabled={
                    save.isPending ||
                    setExistingPrimary.isPending ||
                    makeExistingSecondary.isPending
                  }
                  uploading={save.isPending || removeExistingImage.isPending}
                  uploadProgress={uploadProgress}
                />
                <FormField
                  label="3D model URL (GLB/GLTF)"
                  htmlFor="product-model"
                  hint="Optional — enables the 3D viewer on the product page."
                  error={errors.modelUrl?.message}
                  className="sm:col-span-2"
                >
                  <Input
                    id="product-model"
                    type="url"
                    placeholder="https://…/model.glb"
                    {...register("modelUrl")}
                  />
                </FormField>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 self-start lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <CardTitle>Publication</CardTitle>
              <CardDescription>
                Draft stays hidden. Active appears on the storefront immediately.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Status" htmlFor="product-status">
                <Select id="product-status" {...register("status")}>
                  {PRODUCT_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {humanizeEnum(value)}
                    </option>
                  ))}
                </Select>
              </FormField>

              <Controller
                control={control}
                name="isFeatured"
                render={({ field }) => (
                  <div className="flex items-start justify-between gap-3 rounded-none border border-border bg-muted/30 p-3">
                    <div>
                      <p className="text-xs font-semibold">Featured piece</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                        Surfaces in the hero rotation and home page edits.
                      </p>
                    </div>
                    <Switch
                      checked={Boolean(field.value)}
                      onCheckedChange={field.onChange}
                      aria-label="Feature this product"
                    />
                  </div>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button type="submit" form="product-form" loading={save.isPending} size="lg">
              {save.isPending
                ? uploadProgress
                  ? `Uploading ${uploadProgress.done}/${uploadProgress.total}…`
                  : "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Create product"}
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/admin/products">Cancel</Link>
            </Button>
            {uploadProgress ? (
              <p className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                Keep this tab open while images upload.
              </p>
            ) : null}
          </div>
        </aside>
      </form>

      <ConfirmDialog
        open={Boolean(removingImage)}
        onClose={() => setRemovingImage(null)}
        onConfirm={() => removingImage && removeExistingImage.mutate(removingImage)}
        title="Remove this image?"
        description="The image is deleted from storage and removed from the product gallery."
        confirmLabel="Remove image"
        loading={removeExistingImage.isPending}
        destructive
      />
    </AdminFormPage>
  );
}
