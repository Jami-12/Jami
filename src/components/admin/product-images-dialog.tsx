"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Star, Trash2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SmartImage } from "@/components/ui/smart-image";
import { productImagesApi } from "@/lib/api/services";
import { cn, getErrorMessage } from "@/lib/utils";
import type { ProductImage } from "@/types";

const MAX_FILES = 10;
const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

interface PendingImage {
  key: string;
  file: File;
  preview: string;
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
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [altText, setAltText] = React.useState("");
  const [pending, setPending] = React.useState<PendingImage[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const [deleting, setDeleting] = React.useState<ProductImage | null>(null);

  const query = useQuery({
    queryKey: ["product-images", productId],
    queryFn: () => productImagesApi.list(productId),
    enabled: open,
  });

  const clearPending = React.useCallback((items: PendingImage[]) => {
    items.forEach((item) => URL.revokeObjectURL(item.preview));
  }, []);

  const addFiles = (files: File[]) => {
    const errors: string[] = [];
    const accepted: PendingImage[] = [];

    for (const file of files) {
      if (!ACCEPTED.includes(file.type)) {
        errors.push(`${file.name}: unsupported file type`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        errors.push(`${file.name}: larger than 5 MB`);
        continue;
      }
      accepted.push({
        key: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
      });
    }

    const available = Math.max(0, MAX_FILES - pending.length);
    const next = accepted.slice(0, available);
    if (accepted.length > available) {
      errors.push(`Only ${MAX_FILES} images can be uploaded at once`);
      accepted.slice(available).forEach((item) => URL.revokeObjectURL(item.preview));
    }
    setPending((current) => [...current, ...next]);

    if (errors.length > 0) {
      toast.error(errors[0]!, { description: errors.length > 1 ? `${errors.length - 1} more issue(s)` : undefined });
    }
  };

  const removePending = (key: string) => {
    const target = pending.find((item) => item.key === key);
    if (target) URL.revokeObjectURL(target.preview);
    setPending((current) => current.filter((item) => item.key !== key));
  };

  const resetPending = React.useCallback(() => {
    clearPending(pending);
    setPending([]);
  }, [clearPending, pending]);

  React.useEffect(() => {
    if (!open) {
      resetPending();
      setAltText("");
      setDragging(false);
    }
  }, [open, resetPending]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["product-images", productId] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    void queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const upload = useMutation({
    mutationFn: () =>
      productImagesApi.upload(
        productId,
        pending.map((item) => item.file),
        { altText: altText.trim() || undefined },
      ),
    onSuccess: () => {
      toast.success("Images uploaded");
      resetPending();
      setAltText("");
      if (inputRef.current) inputRef.current.value = "";
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not upload images")),
  });

  const setPrimary = useMutation({
    mutationFn: (imageId: string) => productImagesApi.setPrimary(productId, imageId),
    onSuccess: () => {
      toast.success("Primary image updated");
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not update the primary image")),
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

  const images = query.data ?? [];

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
        <div className="space-y-5">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              addFiles(Array.from(event.dataTransfer.files));
            }}
            className={cn(
              "rounded-2xl border-2 border-dashed p-4 transition",
              dragging ? "border-primary-400 bg-accent-100/40 dark:bg-accent-300/5" : "border-border bg-muted/30",
            )}
          >
            <label className="flex cursor-pointer flex-col items-center gap-2 py-4 text-center">
              <UploadCloud className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-semibold">
                {dragging
                  ? "Drop images here"
                  : pending.length > 0
                    ? `${pending.length} file${pending.length === 1 ? "" : "s"} ready to upload`
                    : "Drag & drop images, or choose files"}
              </span>
              <span className="text-[11px] text-muted-foreground">
                JPEG, PNG, WebP or AVIF · up to 5 MB each · {MAX_FILES} files max
              </span>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED.join(",")}
                multiple
                className="sr-only"
                onChange={(event) => {
                  addFiles(Array.from(event.target.files ?? []));
                  event.target.value = "";
                }}
              />
            </label>

            {pending.length > 0 ? (
              <ul className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {pending.map((item) => (
                  <li key={item.key} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.preview} alt={item.file.name} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePending(item.key)}
                      aria-label={`Remove ${item.file.name}`}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-100 transition hover:bg-black/80 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={altText}
                onChange={(event) => setAltText(event.target.value)}
                placeholder="Alt text for accessibility (optional)"
                aria-label="Image alt text"
              />
              <Button
                onClick={() => upload.mutate()}
                loading={upload.isPending}
                disabled={pending.length === 0}
              >
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                Upload {pending.length > 0 ? `${pending.length}` : ""}
              </Button>
            </div>
          </div>

          {query.isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="aspect-square w-full rounded-xl" />
            </div>
          ) : images.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No uploaded images yet. The product thumbnail still appears in the storefront.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((image) => (
                <li key={image.id} className="overflow-hidden rounded-xl border border-border">
                  <div className="relative aspect-square bg-muted">
                    <SmartImage
                      src={image.imageUrl}
                      alt={image.altText ?? productTitle}
                      fill
                      sizes="(max-width: 640px) 45vw, 200px"
                      className="object-cover"
                    />
                    {image.isPrimary ? (
                      <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        Primary
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-1 p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-[11px]"
                      disabled={image.isPrimary}
                      onClick={() => setPrimary.mutate(image.id)}
                    >
                      <Star className="h-3 w-3" aria-hidden="true" />
                      Primary
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove image"
                      className="h-8 w-8 text-muted-foreground hover:text-red-600"
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
