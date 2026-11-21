"use client";

import * as React from "react";
import {
  GripVertical,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

export const ACCEPTED_IMAGE_TYPES = [
 "image/jpeg",
 "image/jpg",
 "image/png",
 "image/webp",
] as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGES_PER_PRODUCT = 20;

export interface PendingImage {
  id: string;
  file: File;
  url: string;
  isPrimary: boolean;
  isSecondary: boolean;
}

interface ProductMediaFieldProps {
  existing: ProductImage[];
  pending: PendingImage[];
  onAddFiles: (files: File[]) => void;
  onRemovePending: (id: string) => void;
  onMakePendingPrimary: (id: string) => void;
  onMakePendingSecondary: (id: string) => void;
  onMakeExistingPrimary?: (id: string) => void;
  onMakeExistingSecondary?: (id: string) => void;
  onRemoveExisting?: (image: ProductImage) => void;
  disabled?: boolean;
  uploading?: boolean;
  uploadProgress?: { done: number; total: number } | null;
  error?: string;
}

export function ProductMediaField({
  existing,
  pending,
  onAddFiles,
  onRemovePending,
  onMakePendingPrimary,
  onMakePendingSecondary,
  onMakeExistingPrimary,
  onMakeExistingSecondary,
  onRemoveExisting,
  disabled = false,
  uploading = false,
  uploadProgress = null,
  error,
}: ProductMediaFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const total = existing.length + pending.length;
  const existingSecondaryId = existing
    .filter((image) => !image.isPrimary)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)[0]?.id;

  const pick = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    onAddFiles(Array.from(fileList));
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    pick(event.dataTransfer.files);
  };

  return (
    <div className="space-y-3 sm:col-span-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">
            Product images <span className="text-danger">*</span>
          </p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            Select multiple photos straight from your device. The primary image
            is shown on cards; the next image becomes the hover view.
          </p>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {total} / {MAX_IMAGES_PER_PRODUCT} images
        </span>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "rounded-none border-2 border-dashed p-3 transition sm:p-4",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/20",
          disabled && "opacity-60",
        )}
      >
        {total > 0 ? (
          <ul className="mb-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {existing.map((image) => (
              <ImageTile
                key={image.id}
                src={image.imageUrl || image.url}
                alt={image.altText ?? "Product image"}
                label={
                  image.isPrimary
                    ? "Primary"
                    : image.id === existingSecondaryId
                      ? "Secondary"
                      : "Gallery"
                }
                primary={image.isPrimary}
                secondary={image.id === existingSecondaryId}
                disabled={disabled}
                onMakePrimary={
                  image.isPrimary || !onMakeExistingPrimary
                    ? undefined
                    : () => onMakeExistingPrimary(image.id)
                }
                onMakeSecondary={
                  image.isPrimary ||
                  image.id === existingSecondaryId ||
                  !onMakeExistingSecondary
                    ? undefined
                    : () => onMakeExistingSecondary(image.id)
                }
                onRemove={onRemoveExisting ? () => onRemoveExisting(image) : undefined}
              />
            ))}
            {pending.map((image) => (
              <ImageTile
                key={image.id}
                src={image.url}
                alt={image.file.name}
                label={image.isPrimary ? "Primary" : image.isSecondary ? "Secondary" : "New"}
                primary={image.isPrimary}
                secondary={image.isSecondary}
                badge="Uploading on save"
                disabled={disabled}
                onMakePrimary={
                  image.isPrimary ? undefined : () => onMakePendingPrimary(image.id)
                }
                onMakeSecondary={
                  image.isPrimary || image.isSecondary
                    ? undefined
                    : () => onMakePendingSecondary(image.id)
                }
                onRemove={() => onRemovePending(image.id)}
              />
            ))}
          </ul>
        ) : null}

        <label
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-none px-4 py-6 text-center transition hover:bg-muted/40",
            disabled && "pointer-events-none",
          )}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
          ) : (
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-none border border-border bg-card text-primary">
              <UploadCloud className="h-5 w-5" aria-hidden="true" />
            </span>
          )}
          <span className="text-sm font-semibold">
            {uploading
              ? uploadProgress
                ? `Uploading ${uploadProgress.done} of ${uploadProgress.total}…`
                : "Uploading images…"
              : total > 0
                ? "Add more from your device"
                : "Choose images from your device"}
          </span>
          <span className="max-w-md text-[11px] leading-relaxed text-muted-foreground">
            Drag &amp; drop or tap to browse · JPG, JPEG, PNG, WEBP · up to 5 MB
            each · {MAX_IMAGES_PER_PRODUCT} per product
          </span>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            multiple
            className="sr-only"
            disabled={disabled}
            onChange={(event) => pick(event.target.files)}
          />
        </label>

        {uploading ? (
          <div
            className="mt-3 h-1.5 overflow-hidden rounded-none bg-border"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={uploadProgress?.total ?? 1}
            aria-valuenow={uploadProgress?.done ?? 0}
          >
            <div
              className="h-full rounded-none bg-primary transition-all duration-300"
              style={{
                width: uploadProgress
                  ? `${Math.round((uploadProgress.done / Math.max(uploadProgress.total, 1)) * 100)}%`
                  : "35%",
              }}
            />
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="text-[11px] font-medium text-danger" role="alert">
          {error}
        </p>
      ) : (
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <GripVertical className="h-3 w-3" aria-hidden="true" />
          You can change the primary image at any time. No URLs to paste.
        </p>
      )}
    </div>
  );
}

function ImageTile({
  src,
  alt,
  label,
  primary,
  secondary,
  badge,
  disabled,
  onMakePrimary,
  onMakeSecondary,
  onRemove,
}: {
  src: string;
  alt: string;
  label: string;
  primary: boolean;
  secondary: boolean;
  badge?: string;
  disabled?: boolean;
  onMakePrimary?: () => void;
  onMakeSecondary?: () => void;
  onRemove?: () => void;
}) {
  return (
    <li className="overflow-hidden rounded-none border border-border bg-card">
      <div className="relative aspect-square bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-full w-full object-cover" />
        <span
          className={cn(
            "absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-none px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] ",
            primary
              ? "bg-primary text-primary-foreground"
              : secondary
                ? "bg-secondary text-secondary-foreground"
                : "bg-foreground/70 text-background",
          )}
        >
          {primary || secondary ? (
            <Star className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
          ) : null}
          {label}
        </span>
        {badge ? (
          <span className="absolute inset-x-1.5 bottom-1.5 rounded-none bg-foreground/70 px-1.5 py-0.5 text-center text-[9px] font-semibold text-background ">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-1 p-1.5">
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-1.5 text-[10px]"
            disabled={disabled || !onMakePrimary}
            onClick={onMakePrimary}
          >
            <ImagePlus className="h-3 w-3" aria-hidden="true" />
            Main
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-1.5 text-[10px]"
            disabled={disabled || !onMakeSecondary}
            onClick={onMakeSecondary}
          >
            <Star className="h-3 w-3" aria-hidden="true" />
            Hover
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Remove image"
          className="h-7 w-7 text-muted-foreground hover:text-danger"
          disabled={disabled || !onRemove}
          onClick={onRemove}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </li>
  );
}
