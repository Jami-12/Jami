"use client";

import Link from "next/link";
import * as React from "react";
import { Heart, Plus, Sparkles } from "lucide-react";

import { TiltCard } from "@/components/storefront/tilt-card";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { RatingStars } from "@/components/ui/rating-stars";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { Product } from "@/types";
import {
  discountPercentOf,
  hasDiscount,
  productImage,
  productName,
} from "@/types";

export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: Product;
  priority?: boolean;
  className?: string;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const addToWishlist = useWishlistStore((state) => state.toggle);
  const wishlistIds = useWishlistStore((state) => state.ids);
  const [adding, setAdding] = React.useState(false);

  const saved = wishlistIds.includes(product.id);
  const outOfStock = product.stock <= 0 || product.status === "OUT_OF_STOCK";
  const discounted = hasDiscount(product);
  const percent = discountPercentOf(product);
  const image = productImage(product);

  const handleAdd = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (outOfStock) return;
    setAdding(true);
    await addItem(product, 1);
    setAdding(false);
  };

  return (
    <TiltCard className={className}>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow duration-300 hover:shadow-lift">
        <Link
          href={`/products/${product.slug}`}
          className="relative block aspect-[4/5] overflow-hidden bg-muted"
          aria-label={productName(product)}
        >
          <SmartImage
            src={image}
            alt={productName(product)}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {discounted && percent > 0 ? (
              <Badge tone="danger">−{percent}%</Badge>
            ) : null}
            {product.isFeatured ? (
              <Badge tone="accent">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                Edit
              </Badge>
            ) : null}
            {outOfStock ? <Badge tone="neutral">Sold out</Badge> : null}
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void addToWishlist(product.id, productName(product));
            }}
            aria-label={saved ? `Remove ${productName(product)} from wishlist` : `Save ${productName(product)} to wishlist`}
            aria-pressed={saved}
            className={cn(
              "absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition",
              saved
                ? "border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300"
                : "border-white/60 bg-white/70 text-primary-700 hover:bg-white dark:border-white/10 dark:bg-primary-950/60 dark:text-accent-200",
            )}
          >
            <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} aria-hidden="true" />
          </button>
        </Link>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {product.category?.name ?? "Aether"}
            </p>
            {product.reviewCount > 0 ? (
              <RatingStars
                rating={product.averageRating}
                size={12}
                showValue
                className="shrink-0"
              />
            ) : null}
          </div>

          <h3 className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug tracking-tight">
            <Link href={`/products/${product.slug}`} className="hover:underline">
              {productName(product)}
            </Link>
          </h3>

          {product.shortDescription ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {product.shortDescription}
            </p>
          ) : (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {product.brand?.name ?? "Made to last"} · {product.stock > 0 ? `${product.stock} in stock` : "Restocking soon"}
            </p>
          )}

          <div className="mt-auto flex items-end justify-between gap-2 pt-3">
            <Price
              amount={product.finalPrice}
              compareAt={discounted ? product.originalPrice : null}
              size="md"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={outOfStock || adding}
              aria-label={`Add ${productName(product)} to bag`}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary-800 disabled:opacity-40 dark:bg-accent-300 dark:text-[#082f49] dark:hover:bg-accent-200"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </article>
    </TiltCard>
  );
}
