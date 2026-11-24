"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ImagePlus,
  Star,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SmartImage } from "@/components/ui/smart-image";
import { invalidateKeys } from "@/hooks/use-optimistic-mutation";
import { productImagesApi } from "@/lib/api/services";
import { queryKeys, relatedKeys } from "@/lib/query-keys";
import { cn, getErrorMessage } from "@/lib/utils";
import type { ProductImage } from "@/types";

const MAX_FILES = 10;
const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

type Slot = "primary" | "secondary" | "gallery";

interface UploadTarget {
  slot: Slot;
  files: File[];
}

export function ProductImagesDialog({
  productId,
  productTitle,
  open,
  onClose,
}: {
  productId: string;
  productTitle: string;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [altText, setAltText] = React.useState("");
  const [dragging, setDragging] = React.useState(false);
  const [deleting, setDeleting] = React.useState<ProductImage | null>(null);
  const [preview, setPreview] = React.useState<{ slot: Slot; url: string } | null>(
    null,
  );

  const query = useQuery({
    queryKey: queryKeys.products.images(productId),
    queryFn: () => productImagesApi.list(productId),
    enabled: open,
  });

  const images = query.data ?? [];
  const primary = images.find((image) => image.isPrimary) ?? null;
  const secondary = images.find((image) => !image.isPrimary) ?? null;
  const extras = images.filter(
    (image) => !image.isPrimary && image.id !== secondary?.id,
  );

  const invalidate = () => invalidateKeys(queryClient, relatedKeys("products"));

  const upload = useMutation({
    mutationFn: async ({ slot, files }: UploadTarget) => {
      if (slot === "primary") {
        const uploaded = await productImagesApi.upload(productId, files.slice(0, 1), {
          altText: altText.trim() || undefined,
          isPrimary: true,
        });
        return uploaded;
      }

      const uploaded = await productImagesApi.upload(productId, files, {
        altText: altText.trim() || undefined,
      });

      if (slot === "secondary" && uploaded[0]) {
        const remaining = images.filter(
          (image) => image.id !== secondary?.id && !uploaded.some((item) => item.id === image.id),
        );
        const primaryId = images.find((image) => image.isPrimary)?.id;
        const order = [
          ...(primaryId ? [primaryId] : []),
          uploaded[0].id,
          ...uploaded.slice(1).map((item) => item.id),
          ...remaining.filter((image) => !image.isPrimary).map((image) => image.id),
        ];
        await productImagesApi.reorder(productId, order);
        if (secondary) {
          await productImagesApi.remove(productId, secondary.id);
        }
      }

      return uploaded;
    },
    onSuccess: (_data, variables) => {
      toast.success(
        variables.slot === "primary"
          ? "Primary image updated"
          : variables.slot === "secondary"
            ? "Secondary image updated"
            : "Images uploaded",
      );
      setPreview((current) => {
        if (current) URL.revokeObjectURL(current.url);
        return null;
      });
      setAltText("");
      invalidate();
    },
    onError: (error) => {
      setPreview((current) => {
        if (current) URL.revokeObjectURL(current.url);
        return null;
      });
      toast.error(getErrorMessage(error, "Could not upload images"));
    },
  });

  const setPrimary = useMutation({
    mutationFn: (imageId: string) => productImagesApi.setPrimary(productId, imageId),
    onSuccess: () => {
      toast.success("Primary image updated");
      invalidate();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Could not update the primary image")),
  });

  const makeSecondary = useMutation({
    mutationFn: async (image: ProductImage) => {
      const primaryId = images.find((item) => item.isPrimary)?.id;
      const rest = images
        .filter((item) => item.id !== primaryId && item.id !== image.id)
        .map((item) => item.id);
      return productImagesApi.reorder(productId, [
        ...(primaryId ? [primaryId] : []),
        image.id,
        ...rest,
      ]);
    },
    onSuccess: () => {
      toast.success("Secondary image updated");
      invalidate();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Could not update the secondary image")),
  });

  const remove = useMutation({
    mutationFn: (imageId: string) => productImagesApi.remove(productId, imageId),
    onSuccess: () => {
      toast.success("Image removed");
      setDeleting(null);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not remove the image")),
  });

  React.useEffect(() => {
    if (!open) {
      setAltText("");
      setDragging(false);
      setDeleting(null);
      setPreview((current) => {
        if (current) URL.revokeObjectURL(current.url);
        return null;
      });
    }
  }, [open]);

  const startUpload = (slot: Slot, fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;

    const errors: string[] = [];
    const accepted: File[] = [];

    for (const file of files) {
      if (!ACCEPTED.includes(file.type)) {
        errors.push(`${file.name}: unsupported file type`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        errors.push(`${file.name}: larger than 5 MB`);
        continue;
      }
      accepted.push(file);
    }

    if (slot === "gallery" && accepted.length > MAX_FILES) {
      errors.push(`Only ${MAX_FILES} images can be uploaded at once`);
    }

    if (errors.length > 0) {
      toast.error(errors[0]!, {
        description:
          errors.length > 1 ? `${errors.length - 1} more issue(s)` : undefined,
      });
    }

    if (accepted.length === 0) return;

    if (preview) URL.revokeObjectURL(preview.url);
    setPreview({
      slot,
      url: URL.createObjectURL(accepted[0]!),
    });
    upload.mutate({
      slot,
      files: accepted.slice(0, slot === "gallery" ? MAX_FILES : 1),
    });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title="Product images"
        description={productTitle}
        size="lg"
        footer={
          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
        }
      >
        <div className="space-y-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Storefront slots
            </p>
            <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
              <ImageSlot
                label="Primary image"
                hint="Shown by default on cards and the product page."
                image={primary}
                preview={preview?.slot === "primary" ? preview.url : null}
                uploading={upload.isPending && preview?.slot === "primary"}
                disabled={upload.isPending}
                onUpload={(files) => startUpload("primary", files)}
                onRemove={primary ? () => setDeleting(primary) : undefined}
              />
              <ImageSlot
                label="Secondary image"
                hint="Revealed on hover, or when a colour is selected."
                image={secondary}
                preview={preview?.slot === "secondary" ? preview.url : null}
                uploading={upload.isPending && preview?.slot === "secondary"}
                disabled={upload.isPending}
                onUpload={(files) => startUpload("secondary", files)}
                onRemove={secondary ? () => setDeleting(secondary) : undefined}
              />
            </div>
          </div>

          <div className="rounded-none border border-border bg-muted/30 p-4">
            <Input
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              placeholder="Alt text for the next upload (optional)"
              aria-label="Image alt text"
            />
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                startUpload("gallery", event.dataTransfer.files);
              }}
              className={cn(
                "mt-3 rounded-none border-2 border-dashed p-4 transition",
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-border",
              )}
            >
              <label className="flex cursor-pointer flex-col items-center gap-1.5 py-2 text-center">
                <UploadCloud
                  className="h-5 w-5 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold">
                  Add more gallery images
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Drag & drop or choose files · JPEG, PNG, WebP, AVIF · up to 5 MB
                </span>
                <input
                  type="file"
                  accept={ACCEPTED.join(",")}
                  multiple
                  className="sr-only"
                  disabled={upload.isPending}
                  onChange={(event) => {
                    startUpload("gallery", event.target.files);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Gallery
              </p>
              <span className="text-[11px] text-muted-foreground">
                {images.length} image{images.length === 1 ? "" : "s"}
              </span>
            </div>

            {query.isLoading ? (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Skeleton className="aspect-square w-full rounded-none" />
                <Skeleton className="aspect-square w-full rounded-none" />
                <Skeleton className="aspect-square w-full rounded-none" />
              </div>
            ) : extras.length === 0 ? (
              <p className="mt-3 rounded-none border border-dashed border-border px-4 py-5 text-center text-xs text-muted-foreground">
                {images.length === 0
                  ? "No uploaded images yet. Add a primary image to get started."
                  : "Additional images will appear here once you upload more than two."}
              </p>
            ) : (
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {extras.map((image) => (
                  <li
                    key={image.id}
                    className="overflow-hidden rounded-none border border-border bg-card"
                  >
                    <div className="relative aspect-square bg-muted">
                      <SmartImage
                        src={image.imageUrl}
                        alt={image.altText ?? productTitle}
                        fill
                        sizes="(max-width: 640px) 45vw, 200px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-1 p-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-[11px]"
                        onClick={() => makeSecondary.mutate(image)}
                        disabled={makeSecondary.isPending}
                      >
                        <Star className="h-3 w-3" aria-hidden="true" />
                        Secondary
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-[11px]"
                        onClick={() => setPrimary.mutate(image.id)}
                        disabled={setPrimary.isPending}
                      >
                        Primary
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remove image"
                        className="h-8 w-8 text-muted-foreground hover:text-danger"
                        onClick={() => setDeleting(image)}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        title="Remove this image?"
        description="The image is deleted from storage and removed from the product gallery."
        confirmLabel="Remove image"
        loading={remove.isPending}
        destructive
      />
    </>
  );
}

function ImageSlot({
  label,
  hint,
  image,
  preview,
  uploading,
  disabled,
  onUpload,
  onRemove,
}: {
  label: string;
  hint: string;
  image: ProductImage | null;
  preview: string | null;
  uploading: boolean;
  disabled: boolean;
  onUpload: (files: FileList | null) => void;
  onRemove?: () => void;
}) {
  const src = preview ?? image?.imageUrl ?? null;

  return (
    <div className="overflow-hidden rounded-none border border-border bg-card">
      <div className="relative aspect-[4/5] bg-muted">
        {src ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={image?.altText ?? label} className="h-full w-full object-cover" />
            {uploading ? (
              <span className="absolute inset-0 flex items-center justify-center bg-foreground/50 text-[11px] font-semibold uppercase tracking-[0.16em] text-background">
                Uploading…
              </span>
            ) : null}
          </>
        ) : (
          <label className="flex h-full cursor-pointer flex-col items-center justify-center gap-2 px-4 text-center">
            <ImagePlus className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            <span className="text-xs font-semibold">Upload {label.toLowerCase()}</span>
            <span className="text-[10px] leading-relaxed text-muted-foreground">
              {hint}
            </span>
            <input
              type="file"
              accept={ACCEPTED.join(",")}
              className="sr-only"
              disabled={disabled}
              onChange={(event) => {
                onUpload(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
        )}

        {src ? (
          <span className="absolute left-2 top-2 rounded-none bg-foreground/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-background ">
            {label}
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-1 p-2">
        <p className="min-w-0 truncate px-1 text-[10px] text-muted-foreground">{hint}</p>
        <div className="flex shrink-0 items-center gap-1">
          <label
            className={cn(
              "inline-flex h-8 cursor-pointer items-center rounded-none px-2 text-[11px] font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            {src ? "Replace" : "Upload"}
            <input
              type="file"
              accept={ACCEPTED.join(",")}
              className="sr-only"
              disabled={disabled}
              onChange={(event) => {
                onUpload(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
          {onRemove ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remove ${label.toLowerCase()}`}
              className="h-8 w-8 text-muted-foreground hover:text-danger"
              onClick={onRemove}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
