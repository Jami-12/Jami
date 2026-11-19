"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, Heart, Plus, Sparkles } from "lucide-react";

import { QuickViewDialog } from "./quick-view-dialog";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { RatingStars } from "@/components/ui/rating-stars";
import { SmartImage } from "@/components/ui/smart-image";
import { useHydrated } from "@/hooks/use-hydrated";
import {
  isNewProduct,
  productColors,
  productDetailLine,
} from "@/lib/product-options";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { Product } from "@/types";
import {
  discountPercentOf,
  hasDiscount,
  productName,
  productPrimaryImage,
  productSecondaryImage,
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
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const wishlistIds = useWishlistStore((state) => state.ids);
  const hydrated = useHydrated();
  const [adding, setAdding] = React.useState(false);
  const [quickOpen, setQuickOpen] = React.useState(false);

  const name = productName(product);
  const saved = hydrated && wishlistIds.includes(product.id);
  const outOfStock = product.stock <= 0 || product.status === "OUT_OF_STOCK";
  const discounted = hasDiscount(product);
  const percent = discountPercentOf(product);
  const primary = productPrimaryImage(product);
  const secondary = productSecondaryImage(product);
  const colors = productColors(product);
  const isNew = isNewProduct(product);

  const handleAdd = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (outOfStock) return;
    setAdding(true);
    try {
      await addItem(product, 1);
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    void toggleWishlist(product.id, name);
  };

  return (
    <>
      <Card
        className={cn(
          "group/card relative flex h-full min-w-0 flex-col overflow-hidden border-border/80 bg-card/95",
          className,
        )}
      >
        <article className="flex h-full flex-col">
          <div className="relative overflow-hidden bg-muted">
            <Link
              href={`/products/${product.slug}`}
              className="relative block aspect-[4/5] overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              aria-label={name}
            >
              <SmartImage
                src={primary}
                alt={name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={priority}
                className={cn(
                  "object-cover transition-all duration-[900ms] ease-out",
                  secondary &&
                    "group-hover/card:scale-[1.03] group-hover/card:opacity-0",
                )}
              />
              {secondary ? (
                <SmartImage
                  src={secondary}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="scale-[1.03] object-cover opacity-0 transition-all duration-[900ms] ease-out group-hover/card:scale-100 group-hover/card:opacity-100"
                />
              ) : null}

              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-950/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
              />

              <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                {discounted && percent > 0 ? (
                  <Badge tone="danger">−{percent}%</Badge>
                ) : null}
                {isNew && !discounted ? <Badge tone="accent">New</Badge> : null}
                {product.isFeatured ? (
                  <Badge tone="accent">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    Edit
                  </Badge>
                ) : null}
                {outOfStock ? <Badge tone="neutral">Sold out</Badge> : null}
              </div>
            </Link>

            <button
              type="button"
              onClick={handleWishlist}
              aria-label={
                saved ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`
              }
              aria-pressed={saved}
              className={cn(
                "absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition",
                saved
                  ? "border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300"
                  : "border-white/60 bg-white/80 text-primary-800 hover:bg-white dark:border-white/10 dark:bg-primary-950/55 dark:text-accent-200",
              )}
            >
              <Heart
                className="h-4 w-4"
                fill={saved ? "currentColor" : "none"}
                aria-hidden="true"
              />
            </button>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-3 p-3 opacity-0 transition-all duration-500 ease-out group-hover/card:translate-y-0 group-hover/card:opacity-100 lg:block">
              <div className="pointer-events-auto rounded-xl border border-white/50 bg-white/92 p-3 shadow-lift backdrop-blur-md dark:border-white/10 dark:bg-card/95">
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {productDetailLine(product)}
                </p>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {colors.slice(0, 4).map((colour) => (
                      <span
                        key={colour.name}
                        title={colour.name}
                        className="h-4 w-4 rounded-full border border-black/10 shadow-sm dark:border-white/20"
                        style={{ backgroundColor: colour.hex }}
                      />
                    ))}
                    {colors.length > 4 ? (
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        +{colors.length - 4}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQuickOpen(true)}
                      aria-label={`Quick view ${name}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[11px] font-semibold text-foreground transition hover:border-accent-400/50"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      Quick view
                    </button>
                    <button
                      type="button"
                      onClick={handleAdd}
                      disabled={outOfStock || adding}
                      aria-label={`Add ${name} to bag`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-800 text-primary-50 transition hover:bg-primary-900 disabled:opacity-40 dark:bg-accent-300 dark:text-primary-950 dark:hover:bg-accent-200"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {product.category?.name ?? "Collection"}
              </p>
              {product.reviewCount > 0 ? (
                <RatingStars
                  rating={product.averageRating}
                  size={11}
                  showValue
                  className="shrink-0"
                />
              ) : null}
            </div>

            <h3 className="mt-1 line-clamp-2 font-display text-[0.98rem] font-semibold leading-snug tracking-tight">
              <Link
                href={`/products/${product.slug}`}
                className="transition hover:text-primary-700 dark:hover:text-accent-300"
              >
                {name}
              </Link>
            </h3>

            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground lg:hidden">
              {productDetailLine(product)}
            </p>

            <div className="mt-3 flex items-end justify-between gap-2">
              <Price
                amount={product.finalPrice}
                compareAt={discounted ? product.originalPrice : null}
                size="sm"
              />
              <div className="flex items-center gap-1.5">
                {colors.slice(0, 4).map((colour) => (
                  <span
                    key={colour.name}
                    title={colour.name}
                    className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-sm dark:border-white/20"
                    style={{ backgroundColor: colour.hex }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setQuickOpen(true)}
                aria-label={`Quick view ${name}`}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-card text-[11px] font-semibold transition hover:border-accent-400/50"
              >
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                Quick view
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={outOfStock || adding}
                aria-label={`Add ${name} to bag`}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-800 text-primary-50 transition hover:bg-primary-900 disabled:opacity-40 dark:bg-accent-300 dark:text-primary-950 dark:hover:bg-accent-200"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </article>
      </Card>

      <QuickViewDialog
        product={product}
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
      />
    </>
  );
}
