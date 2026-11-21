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
  productSizes,
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
  const sizes = productSizes(product);
  const isNew = isNewProduct(product);

  const handleAdd = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (outOfStock) return;
    // Size and colour are order-level data, so a quick add must not silently
    // skip the selection step when the product offers variants.
    if (colors.length > 0 || (sizes?.length ?? 0) > 0) {
      setQuickOpen(true);
      return;
    }
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
          "group/card relative flex h-full min-w-0 flex-col overflow-hidden border border-border bg-background transition-all duration-300 ease-out hover:-translate-y-1 hover:border-foreground hover:shadow-lift motion-reduce:hover:translate-y-0",
          className,
        )}
      >
        <article className="flex h-full flex-col">
          <div className="relative overflow-hidden bg-muted">
            <Link
              href={`/products/${product.slug}`}
              className="relative block aspect-square overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-inset"
              aria-label={name}
            >
              <SmartImage
                src={primary}
                alt={name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={priority}
                className={cn(
                  "object-cover transition-[opacity,transform] duration-500 ease-out group-hover/card:scale-105 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100",
                  secondary && "group-hover/card:opacity-0",
                )}
              />
              {secondary ? (
                <SmartImage
                  src={secondary}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover opacity-0 transition-[opacity,transform] duration-500 ease-out group-hover/card:scale-105 group-hover/card:opacity-100 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100"
                />
              ) : null}

              <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                {discounted && percent > 0 ? (
                  <Badge tone="danger" className="bg-foreground text-background ring-0">
                    −{percent}%
                  </Badge>
                ) : null}
                {isNew && !discounted ? (
                  <Badge tone="accent" className="bg-foreground text-background ring-0">
                    New
                  </Badge>
                ) : null}
                {product.isFeatured ? (
                  <Badge tone="accent" className="bg-foreground text-background ring-0">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    Edit
                  </Badge>
                ) : null}
                {outOfStock ? (
                  <Badge tone="danger" className="ring-0">
                    Sold out
                  </Badge>
                ) : null}
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
                "absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center border transition-colors",
                saved
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:border-foreground hover:bg-foreground hover:text-background",
              )}
            >
              <Heart
                className="h-4 w-4"
                fill={saved ? "currentColor" : "none"}
                aria-hidden="true"
              />
            </button>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden border-t border-border bg-foreground p-3 text-background opacity-0 transition-opacity duration-200 group-hover/card:opacity-100 lg:block">
              <div className="pointer-events-auto flex items-center justify-between gap-3">
                <p className="line-clamp-2 text-xs leading-relaxed text-background/70">
                  {productDetailLine(product)}
                </p>
                <div className="flex shrink-0 items-center gap-1.5">
                  <div className="flex items-center gap-1.5">
                    {colors.slice(0, 4).map((colour) => (
                      <span
                        key={colour.name}
                        title={colour.name}
                        className="h-4 w-4 border border-background/30"
                        style={{ backgroundColor: colour.hex }}
                      />
                    ))}
                    {colors.length > 4 ? (
                      <span className="text-[10px] font-semibold text-background/70">
                        +{colors.length - 4}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQuickOpen(true)}
                      aria-label={`Quick view ${name}`}
                      className="inline-flex h-8 items-center gap-1.5 border border-background/40 px-2.5 text-[11px] font-semibold text-background transition-colors hover:bg-background hover:text-foreground"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      Quick view
                    </button>
                    <button
                      type="button"
                      onClick={handleAdd}
                      disabled={outOfStock || adding}
                      aria-label={`Add ${name} to bag`}
                      className="inline-flex h-8 w-8 items-center justify-center border border-background/40 text-background transition-colors hover:bg-background hover:text-foreground disabled:opacity-40"
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

            <h3 className="mt-1 line-clamp-2 font-display text-[0.98rem] font-semibold leading-snug not-italic tracking-tight text-foreground/80 transition-colors duration-300 ease-out group-hover/card:text-foreground">
              <Link
                href={`/products/${product.slug}`}
                className="underline-offset-4 hover:underline"
              >
                {name}
              </Link>
            </h3>

            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground lg:hidden">
              {productDetailLine(product)}
            </p>

            {sizes?.length ? (
              <div
                className="mt-2 flex flex-wrap items-center gap-1"
                aria-label={`Available sizes: ${sizes.join(", ")}`}
              >
                {sizes.slice(0, 5).map((size) => (
                  <span
                    key={size}
                    className="border border-border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {size}
                  </span>
                ))}
                {sizes.length > 5 ? (
                  <span className="text-[9px] text-muted-foreground">
                    +{sizes.length - 5}
                  </span>
                ) : null}
              </div>
            ) : null}

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
                    className="h-3.5 w-3.5 border border-border"
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
                className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 border border-border bg-background text-[11px] font-semibold text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
              >
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                Quick view
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={outOfStock || adding}
                aria-label={`Add ${name} to bag`}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-foreground bg-foreground text-background transition-colors hover:bg-background hover:text-foreground disabled:opacity-40"
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
