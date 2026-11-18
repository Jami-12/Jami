"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AdminFormPage } from "@/components/admin/admin-form-page";
import { ImageUploadField } from "@/components/admin/shared/image-upload-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, Input, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { brandsApi, categoriesApi } from "@/lib/api/services";
import { formResolver } from "@/lib/form-resolver";
import { slugify } from "@/lib/slug";
import { getErrorMessage } from "@/lib/utils";
import { brandSchema, categorySchema } from "@/lib/validations";
import type { Brand, Category } from "@/types";

type Mode = "categories" | "brands";

interface TaxonomyFormValues {
  name: string;
  slug: string;
  description: string;
}

const EMPTY: TaxonomyFormValues = {
  name: "",
  slug: "",
  description: "",
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

  const item = useQuery<Category | Brand>({
    queryKey: [mode, "detail", itemId],
    queryFn: () => (mode === "categories" ? categoriesApi.get(itemId!) : brandsApi.get(itemId!)),
    enabled: Boolean(itemId),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaxonomyFormValues>({
    resolver: formResolver<TaxonomyFormValues>(
      mode === "categories" ? categorySchema : brandSchema,
    ),
    defaultValues: EMPTY,
  });

  const name = watch("name");

  React.useEffect(() => {
    if (!slugTouched) setValue("slug", slugify(name ?? ""), { shouldDirty: true });
  }, [name, slugTouched, setValue]);

  React.useEffect(() => {
    if (!item.data) return;
    setSlugTouched(true);
    setExistingImage(itemImage(item.data, mode));
    setImageFile(null);
    reset({
      name: item.data.name,
      slug: item.data.slug,
      description: item.data.description ?? "",
    });
  }, [item.data, mode, reset]);

  const save = useMutation<Category | Brand, Error, TaxonomyFormValues>({
    mutationFn: (values: TaxonomyFormValues) => {
      const imageValue = imageFile ? undefined : (existingImage ?? "");
      const common = {
        name: values.name,
        slug: values.slug || undefined,
        description: values.description || null,
      };

      if (mode === "categories") {
        const payload = { ...common, image: imageValue };
        return itemId
          ? categoriesApi.update(itemId, payload, imageFile)
          : categoriesApi.create(payload, imageFile);
      }

      const payload = { ...common, logo: imageValue };
      return itemId
        ? brandsApi.update(itemId, payload, imageFile)
        : brandsApi.create(payload, imageFile);
    },
    onSuccess: () => {
      toast.success(
        `${singular[0]!.toUpperCase()}${singular.slice(1)} ${isEdit ? "updated" : "created"}`,
      );
      void queryClient.invalidateQueries({ queryKey: [mode] });
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
      void queryClient.invalidateQueries({ queryKey: ["brands"] });
      router.push(`/admin/${mode}`);
      router.refresh();
    },
    onError: (error) => toast.error(getErrorMessage(error, `Could not save the ${singular}`)),
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
        <Skeleton className="h-72 w-full max-w-3xl rounded-2xl" />
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
    >
      <form
        id="taxonomy-form"
        onSubmit={handleSubmit((values) => {
          if (save.isPending) return;
          save.mutate(values);
        })}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
        noValidate
      >
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
              hint="Auto-generated from the name."
              error={errors.slug?.message}
            >
              <Input
                id="taxonomy-slug"
                placeholder="outerwear"
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
