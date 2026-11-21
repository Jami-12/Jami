"use client";

import * as React from "react";
import { ImagePlus, Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";

export const MAX_ENTITY_IMAGE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_ENTITY_IMAGE_TYPES = [
 "image/jpeg",
 "image/jpg",
 "image/png",
 "image/webp",
 "image/gif",
 "image/avif",
] as const;

export interface ImageUploadFieldProps {
  id: string;
  label: string;
  description?: string;
  /** Already-saved image URL (edit mode). */
  value?: string | null;
  /** Newly selected device file, pending upload on submit. */
  file: File | null;
  onFileChange: (file: File | null) => void;
  /** Called when the saved image should be cleared on save. */
  onClearExisting?: () => void;
  required?: boolean;
  error?: string;
  aspect?: "wide" | "square";
  disabled?: boolean;
  maxBytes?: number;
}

function isAcceptedImage(file: File) {
  return (
    ACCEPTED_ENTITY_IMAGE_TYPES.includes(
      file.type as (typeof ACCEPTED_ENTITY_IMAGE_TYPES)[number],
    ) || /\.(jpe?g|png|webp|gif|avif)$/i.test(file.name)
  );
}

/**
 * Local-file image picker with a live preview. Nothing is uploaded here: the
 * parent form keeps the `File` and sends it as part of a multipart request.
 */
export function ImageUploadField({
  id,
  label,
  description,
  value,
  file,
  onFileChange,
  onClearExisting,
  required = false,
  error,
  aspect = "wide",
  disabled = false,
  maxBytes = MAX_ENTITY_IMAGE_BYTES,
}: ImageUploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState(false);

  React.useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const preview = objectUrl ?? value ?? null;

  const accept = (incoming: FileList | null) => {
    const next = incoming?.[0];
    if (!next) return;

    if (!isAcceptedImage(next)) {
      toast.error("Choose a JPEG, PNG, WebP, GIF or AVIF image.");
      return;
    }

    if (next.size > maxBytes) {
      toast.error(`Image is larger than ${Math.round(maxBytes / 1024 / 1024)} MB.`);
      return;
    }

    onFileChange(next);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = () => {
    onFileChange(null);
    onClearExisting?.();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold">
          {label} {required ? <span className="text-muted-foreground">*</span> : null}
        </p>
        {description ? (
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!disabled) accept(event.dataTransfer.files);
        }}
        className={cn(
          "rounded-none border-2 border-dashed transition",
          dragging
            ? "border-primary-400 bg-accent-100/50 p-2 dark:bg-accent-300/5"
            : "border-border bg-muted/20 p-2",
          disabled && "opacity-60",
        )}
      >
        {preview ? (
          <div
            className={cn(
              "relative w-full overflow-hidden rounded-none border border-border bg-muted",
              aspect === "square" ? "aspect-square" : "aspect-[16/8]",
            )}
          >
            <SmartImage
              src={preview}
              alt={`${label} preview`}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
            <span className="absolute left-2 top-2 rounded-none bg-black/65 px-2 py-0.5 text-[10px] font-semibold text-white ">
              {file ? "New image · uploads on save" : "Saved image"}
            </span>
            {!disabled ? (
              <button
                type="button"
                onClick={remove}
                aria-label={`Remove ${label.toLowerCase()}`}
                className="absolute right-2 top-2 rounded-none bg-black/60 p-1.5 text-white transition hover:bg-black/90"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-none px-4 py-10 text-center transition hover:bg-muted/40 disabled:cursor-not-allowed"
          >
            <span className="rounded-none border border-border bg-card p-3 text-muted-foreground">
              {disabled ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <UploadCloud className="h-5 w-5" aria-hidden="true" />
              )}
            </span>
            <span className="text-sm font-semibold">
              Choose an image from this device
            </span>
            <span className="text-[11px] text-muted-foreground">
              Drag &amp; drop or tap to browse · JPEG, PNG, WebP · up to{" "}
              {Math.round(maxBytes / 1024 / 1024)} MB
            </span>
          </button>
        )}

        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={disabled}
          onChange={(event) => accept(event.target.files)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
          {preview ? "Replace image" : "Choose image"}
        </Button>
        {preview ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={remove}
            disabled={disabled}
            className="text-muted-foreground hover:text-foreground"
          >
            Remove
          </Button>
        ) : null}
      </div>

      {error ? (
        <p className="text-[11px] font-medium text-muted-foreground" role="alert">
          {error}
        </p>
      ) : (
        <p className="text-[11px] text-muted-foreground">
          Uploaded straight from your device when you save. No URLs to paste.
        </p>
      )}
    </div>
  );
}
