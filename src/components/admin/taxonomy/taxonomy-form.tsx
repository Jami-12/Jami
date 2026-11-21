"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AdminFormPage } from "@/components/admin/admin-form-page";
import { ImageUploadField } from "@/components/admin/shared/image-upload-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, Input, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { invalidateKeys } from "@/hooks/use-optimistic-mutation";
import { brandsApi, categoriesApi } from "@/lib/api/services";
import { formResolver } from "@/lib/form-resolver";
import { queryKeys, relatedKeys } from "@/lib/query-keys";
import { slugify } from "@/lib/slug";
import { getErrorMessage } from "@/lib/utils";
import type { Brand, Category } from "@/types";

type Mode = "categories" | "brands";

const taxonomyFormSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required").max(120),
    slug: z.string().trim().max(160).optional().or(z.literal("")),
    description: z.string().trim().max(5000).optional().or(z.literal("")),
    isActive: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (!slugify(values.slug || values.name)) {
      ctx.addIssue({
        code: "custom",
        path: ["slug"],
        message: "Enter a slug containing letters or numbers.",
      });
    }
  });

type TaxonomyFormValues = z.infer<typeof taxonomyFormSchema>;

const EMPTY: TaxonomyFormValues = {
  name: "",
  slug: "",
  description: "",
  isActive: true,
};

function itemImage(item: Category | Brand, mode: Mode): string | null {
  return mode === "categories"
    ? ((item as Category).image ?? null)
    : ((item as Brand).logo ?? null);
}

export function TaxonomyForm({ mode, itemId }: { mode: Mode; itemId?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = Boolean(itemId);
  const singular = mode === "categories" ? "category" : "brand";
  const [slugTouched, setSlugTouched] = React.useState(isEdit);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [existingImage, setExistingImage] = React.useState<string | null>(null);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const item = useQuery<Category | Brand>({
    queryKey: queryKeys.taxonomy.detail(mode, itemId ?? ""),
    queryFn: () => (mode === "categories" ? categoriesApi.get(itemId!) : brandsApi.get(itemId!)),
    enabled: Boolean(itemId),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<TaxonomyFormValues>({
    resolver: formResolver<TaxonomyFormValues>(taxonomyFormSchema),
    defaultValues: EMPTY,
  });

  const name = watch("name");
  const isActive = watch("isActive");

  React.useEffect(() => {
    if (!slugTouched) setValue("slug", slugify(name ?? ""), { shouldDirty: true });
  }, [name, slugTouched, setValue]);

  React.useEffect(() => {
    if (!item.data) return;
    setSlugTouched(true);
    setExistingImage(itemImage(item.data, mode));
    setImageFile(null);
    setSaveError(null);
    reset({
      name: item.data.name,
      slug: item.data.slug,
      description: item.data.description ?? "",
      isActive: item.data.isActive,
    });
  }, [item.data, mode, reset]);

  const save = useMutation<Category | Brand, Error, TaxonomyFormValues>({
    mutationFn: (values) => {
      const description = values.description?.trim() || "";
      const base = {
        name: values.name.trim(),
        slug: values.slug?.trim() || undefined,
        isActive: values.isActive,
      };

      if (mode === "categories") {
        const payload = {
          ...base,
          description: isEdit ? description || null : description || undefined,
          image: imageFile ? undefined : (existingImage ?? (isEdit ? "" : undefined)),
        };
        return itemId
          ? categoriesApi.update(itemId, payload, imageFile)
          : categoriesApi.create(payload, imageFile);
      }

      const payload = {
        ...base,
        description: isEdit ? description || null : description || undefined,
        logo: imageFile ? undefined : (existingImage ?? (isEdit ? "" : undefined)),
      };
      return itemId
        ? brandsApi.update(itemId, payload, imageFile)
        : brandsApi.create(payload, imageFile);
    },
    onSuccess: () => {
      setSaveError(null);
      toast.success(
        `${singular[0]!.toUpperCase()}${singular.slice(1)} ${isEdit ? "updated" : "created"}`,
      );
      invalidateKeys(queryClient, [
        ...relatedKeys(mode),
        queryKeys.taxonomy.storefront.categories(),
        queryKeys.taxonomy.storefront.brands(),
      ]);
      router.push(`/admin/${mode}`);
      router.refresh();
    },
    onError: (error) => {
      const message = getErrorMessage(error, `Could not save the ${singular}`);
      setSaveError(message);
      toast.error(message);
    },
  });

  if (isEdit && item.isLoading) {
    return (
      <AdminFormPage
        backHref={`/admin/${mode}`}
        backLabel={mode === "categories" ? "Categories" : "Brands"}
        eyebrow="Catalogue"
        title={`Edit ${singular}`}
        description="Loading…"
      >
        <Skeleton className="h-72 w-full max-w-3xl rounded-none" />
      </AdminFormPage>
    );
  }

  if (isEdit && (item.isError || (!item.isLoading && !item.data))) {
    return (
      <AdminFormPage
        backHref={`/admin/${mode}`}
        backLabel={mode === "categories" ? "Categories" : "Brands"}
        eyebrow="Catalogue"
        title={`${singular[0]!.toUpperCase()}${singular.slice(1)} not found`}
        description="This record may have been deleted."
      >
        <Button asChild>
          <Link href={`/admin/${mode}`}>Back to {mode}</Link>
        </Button>
      </AdminFormPage>
    );
  }

  return (
    <AdminFormPage
      backHref={`/admin/${mode}`}
      backLabel={mode === "categories" ? "Categories" : "Brands"}
      eyebrow="Catalogue"
      title={isEdit ? `Edit ${singular}` : `New ${singular}`}
      description={
        mode === "categories"
          ? "Categories organise the storefront navigation and home page edits."
          : "Brands power the maker filters and the Shop by brand section."
      }
      badge={isEdit ? item.data?.name : undefined}
    >
      <form
        id="taxonomy-form"
        onSubmit={handleSubmit((values) => {
          if (save.isPending) return;
          setSaveError(null);
          save.mutate(values);
        })}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
        noValidate
      >
        <div className="space-y-6">
          {saveError ? (
            <Alert variant="destructive">
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Basics</CardTitle>
              <CardDescription>
                The name customers see, the URL segment and a short description.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Name"
                htmlFor="taxonomy-name"
                required
                error={errors.name?.message}
              >
                <Input
                  id="taxonomy-name"
                  placeholder={mode === "categories" ? "Outerwear" : "Studio name"}
                  invalid={Boolean(errors.name)}
                  {...register("name")}
                />
              </FormField>
              <FormField
                label="Slug"
                htmlFor="taxonomy-slug"
                hint="Auto-generated from the name. Letters, numbers and dashes work best."
                error={errors.slug?.message}
              >
                <Input
                  id="taxonomy-slug"
                  placeholder="outerwear"
                  invalid={Boolean(errors.slug)}
                  {...register("slug", { onChange: () => setSlugTouched(true) })}
                />
              </FormField>
              <FormField
                label="Description"
                htmlFor="taxonomy-description"
                error={errors.description?.message}
                className="sm:col-span-2"
              >
                <Textarea
                  id="taxonomy-description"
                  rows={4}
                  placeholder="A short note shown on the storefront."
                  {...register("description")}
                />
              </FormField>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 self-start lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <CardTitle>{mode === "categories" ? "Cover image" : "Logo"}</CardTitle>
              <CardDescription>
                Upload from this device. Square images work best.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploadField
                id="taxonomy-image"
                label={mode === "categories" ? "Category image" : "Brand logo"}
                description="Optional — shown in navigation, cards and the home page."
                value={existingImage}
                file={imageFile}
                onFileChange={setImageFile}
                onClearExisting={() => setExistingImage(null)}
                aspect="square"
                disabled={save.isPending}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
              <CardDescription>
                Inactive {mode} stay in the admin but are hidden from the storefront.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <div className="flex items-start justify-between gap-3 rounded-none border border-border bg-muted/30 p-3">
                    <div>
                      <p className="text-xs font-semibold">{isActive ? "Active" : "Inactive"}</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                        {isActive
                          ? `Customers can browse this ${singular}.`
                          : `This ${singular} is hidden from the storefront.`}
                      </p>
                    </div>
                    <Switch
                      checked={Boolean(field.value)}
                      onCheckedChange={field.onChange}
                      disabled={save.isPending}
                      aria-label={`${singular} active`}
                    />
                  </div>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              form="taxonomy-form"
              loading={save.isPending}
              disabled={save.isPending}
              size="lg"
            >
              {save.isPending
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : `Create ${singular}`}
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={`/admin/${mode}`}>Cancel</Link>
            </Button>
          </div>
        </aside>
      </form>
    </AdminFormPage>
  );
}
