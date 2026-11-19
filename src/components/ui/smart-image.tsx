"use client";

import Image from "next/image";
import { useState } from "react";

import { canOptimizeImage, cn } from "@/lib/utils";

const FALLBACK = "/product-fallback.svg";

export interface SmartImageProps {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  wrapperClassName?: string;
}

export function SmartImage({
  src,
  alt,
  fill = false,
  width = 800,
  height = 800,
  sizes,
  priority = false,
  className,
  wrapperClassName,
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = !src || failed ? FALLBACK : src;
  const optimizable = canOptimizeImage(resolved);

  if (!optimizable) {
    if (fill) {
      return (
        <span
          className={cn(
            "absolute inset-0 block overflow-hidden bg-[var(--muted)]",
            wrapperClassName,
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolved}
            alt={alt}
            sizes={sizes}
            className={cn("h-full w-full object-cover", className)}
            onError={() => setFailed(true)}
            loading={priority ? "eager" : "lazy"}
          />
        </span>
      );
    }

    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={resolved}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={cn("bg-[var(--muted)]", className)}
        onError={() => setFailed(true)}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={resolved}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={cn("bg-[var(--muted)]", className)}
      onError={() => setFailed(true)}
    />
  );
}
