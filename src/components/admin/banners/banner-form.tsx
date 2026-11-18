"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { AdminFormPage } from "@/components/admin/admin-form-page";
import { ImageUploadField } from "@/components/admin/shared/image-upload-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, Input, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { bannersApi } from "@/lib/api/services";
import { getErrorMessage } from "@/lib/utils";
import type { BannerInput } from "@/types";

interface BannerFormValues {
  title: string;
  subtitle: string;
  linkUrl: string;
  placement: "HERO" | "PROMO";
  isActive: boolean;
  sortOrder: number;
}

const EMPTY: BannerFormValues = {
  title: "",
  subtitle: "",
  linkUrl: "",
  placement: "PROMO",
  isActive: true,
  sortOrder: 0,
};

export function BannerForm({ bannerId }: { bannerId?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = Boolean(bannerId);

  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [existingImage, setExistingImage] = React.useState<string | null>(null);
  const [imageError, setImageError] = React.useState<string | undefined>();

  const banner = useQuery({
    queryKey: ["admin", "banner", bannerId],
    queryFn: () => bannersApi.get(bannerId!),
    enabled: Boolean(bannerId),
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<BannerFormValues>({
    defaultValues: EMPTY,
  });

  React.useEffect(() => {
    if (!banner.data) return;
    setExistingImage(banner.data.imageUrl);
    reset({
      title: banner.data.title,
      subtitle: banner.data.subtitle ?? "",
      linkUrl: banner.data.linkUrl ?? "",
      placement: banner.data.placement,
      isActive: banner.data.isActive,
      sortOrder: banner.data.sortOrder,
    });
  }, [banner.data, reset]);

  const save = useMutation({
    mutationFn: (values: BannerFormValues) => {
      const payload: BannerInput = {
        title: values.title.trim(),
        subtitle: values.subtitle.trim() || null,
        imageUrl: existingImage ?? "",
        linkUrl: values.linkUrl.trim() || null,
        placement: values.placement,
        isActive: Boolean(values.isActive),
        sortOrder: Number(values.sortOrder) || 0,
      };

      return bannerId
        ? bannersApi.update(bannerId, payload, imageFile)
        : bannersApi.create(payload, imageFile);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Banner updated" : "Banner created");
      void queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
      void queryClient.invalidateQueries({ queryKey: ["public", "banners"] });
      router.push("/admin/banners");
      router.refresh();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not save the banner")),
  });

  if (isEdit && banner.isLoading) {
    return (
      <AdminFormPage
        backHref="/admin/banners"
        backLabel="Banners"
        eyebrow="Storefront"
        title="Edit banner"
        description="Loading…"
      >
        <Skeleton className="h-96 w-full max-w-3xl rounded-2xl" />
      </AdminFormPage>
    );
  }

  if (isEdit && (banner.isError || (!banner.isLoading && !banner.data))) {
    return (
      <AdminFormPage
        backHref="/admin/banners"
        backLabel="Banners"
        eyebrow="Storefront"
        title="Banner not found"
        description="This banner may have been deleted."
      >
        <Button asChild>
          <Link href="/admin/banners">Back to banners</Link>
        </Button>
      </AdminFormPage>
    );
  }

  return (
    <AdminFormPage
      backHref="/admin/banners"
      backLabel="Banners"
      eyebrow="Storefront"
      title={isEdit ? "Edit banner" : "New banner"}
      description="Hero banners lead the home page carousel; promo banners fill the editorial grid further down."
      badge={isEdit ? banner.data?.placement : undefined}
    >
      <form
        id="banner-form"
        onSubmit={handleSubmit((values) => {
          if (!imageFile && !existingImage) {
            setImageError("Choose a banner image from your device.");
            return;
          }
          if (save.isPending) return;
          setImageError(undefined);
          save.mutate(values);
        })}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
        noValidate
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Image</CardTitle>
              <CardDescription>
                Select a photo straight from this device. It uploads when you save —
                16:9 or 21:9 works best.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploadField
                id="banner-image"
                label="Banner image"
                description="JPEG, PNG or WebP, up to 5 MB."
                value={existingImage}
                file={imageFile}
                onFileChange={(file) => {
                  setImageFile(file);
                  setImageError(undefined);
                }}
                onClearExisting={() => {
                  setExistingImage(null);
                  setImageError(undefined);
                }}
                required
                error={imageError}
                disabled={save.isPending}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Copy and destination</CardTitle>
              <CardDescription>
                Keep the title short — it sits over the image on the storefront.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Title"
                htmlFor="banner-title"
                required
                error={errors.title?.message}
                className="sm:col-span-2"
              >
                <Input
                  id="banner-title"
                  placeholder="e.g. The 2026 considered collection"
                  invalid={Boolean(errors.title)}
                  {...register("title", { required: "Title is required" })}
                />
              </FormField>
              <FormField
                label="Subtitle"
                htmlFor="banner-subtitle"
                error={errors.subtitle?.message}
                className="sm:col-span-2"
              >
                <Input
                  id="banner-subtitle"
                  placeholder="One supporting line"
                  {...register("subtitle")}
                />
              </FormField>
              <FormField
                label="Destination link"
                htmlFor="banner-link"
                hint="Leave blank for a non-clickable banner."
                error={errors.linkUrl?.message}
                className="sm:col-span-2"
              >
                <Input
                  id="banner-link"
                  placeholder="/products?sort=newest"
                  {...register("linkUrl")}
                />
              </FormField>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 self-start lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <CardTitle>Placement</CardTitle>
              <CardDescription>Where this banner appears on the home page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Slot" htmlFor="banner-placement">
                <Select id="banner-placement" {...register("placement")}>
                  <option value="PROMO">Promo banner</option>
                  <option value="HERO">Hero carousel</option>
                </Select>
              </FormField>
              <FormField
                label="Sort order"
                htmlFor="banner-sort"
                hint="Lower numbers appear first."
                error={errors.sortOrder?.message}
              >
                <Input
                  id="banner-sort"
                  type="number"
                  {...register("sortOrder", { valueAsNumber: true })}
                />
              </FormField>

              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-muted/30 p-3">
                    <div>
                      <p className="text-xs font-semibold">Active</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                        Show this banner on the storefront.
                      </p>
                    </div>
                    <Switch
                      checked={Boolean(field.value)}
                      onCheckedChange={field.onChange}
                      aria-label="Banner active"
                    />
                  </div>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              form="banner-form"
              loading={save.isPending}
              disabled={save.isPending}
              size="lg"
            >
              {save.isPending
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Create banner"}
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/admin/banners">Cancel</Link>
            </Button>
          </div>
        </aside>
      </form>
    </AdminFormPage>
  );
}
