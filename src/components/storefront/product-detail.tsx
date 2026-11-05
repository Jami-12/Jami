"use client";

import * as React from "react";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Package,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { RatingStars } from "@/components/ui/rating-stars";
import { SmartImage } from "@/components/ui/smart-image";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { Product } from "@/types";
import {
  discountPercentOf,
  hasDiscount,
  productImages,
  productName,
} from "@/types";
import { ReviewList } from "./review-list";
import { ReviewForm } from "./review-form";

export function ProductDetail({ product }: { product: Product }) {
  const images = productImages(product);
  const [activeImage, setActiveImage] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);
  const [adding, setAdding] = React.useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const wishlistIds = useWishlistStore((state) => state.ids);
  const user = useAuthStore((state) => state.user);

  const saved = wishlistIds.includes(product.id);
  const outOfStock = product.stock <= 0 || product.status === "OUT_OF_STOCK";
  const discounted = hasDiscount(product);
  const percent = discountPercentOf(product);

  const handleAdd = async () => {
    if (outOfStock) return;
    setAdding(true);
    await addItem(product, quantity);
    setAdding(false);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.08fr_1fr] lg:gap-12">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-muted shadow-soft">
          <SmartImage
            src={images[activeImage] ?? null}
            alt={productName(product)}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-cover"
          />
          {discounted && percent > 0 ? (
            <Badge tone="danger" className="absolute left-4 top-4">
              −{percent}% studio price
            </Badge>
          ) : null}
          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveImage((current) =>
                    current === 0 ? images.length - 1 : current - 1,
                  )
                }
                aria-label="Previous image"
                className="absolute left-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-primary-800 shadow-soft backdrop-blur transition hover:bg-white"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveImage((current) => (current + 1) % images.length)
                }
                aria-label="Next image"
                className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-primary-800 shadow-soft backdrop-blur transition hover:bg-white"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          ) : null}
        </div>

        {images.length > 1 ? (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveImage(index)}
                aria-label={`Show image ${index + 1}`}
                aria-current={activeImage === index}
                className={cn(
                  "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-muted transition",
                  activeImage === index
                    ? "border-primary-500 dark:border-accent-300"
                    : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <SmartImage src={image} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Truck, label: "Free delivery", copy: `Over ${formatCurrency(FREE_SHIPPING_THRESHOLD)}` },
            { icon: RotateCcw, label: "30-day returns", copy: "Unused, in original packaging" },
            { icon: ShieldCheck, label: "2-year warranty", copy: "Materials and workmanship" },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-3">
              <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary-500 dark:text-accent-300" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold">{item.label}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/products?category=${product.category.slug}`}
            className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-600 hover:underline dark:text-accent-300"
          >
            {product.category.name}
          </Link>
          {product.brand ? (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {product.brand.name}
              </span>
            </>
          ) : null}
        </div>

        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {productName(product)}
        </h1>

        {product.reviewCount > 0 ? (
          <div className="mt-3 flex items-center gap-2">
            <RatingStars rating={product.averageRating} showValue />
            <span className="text-xs text-muted-foreground">
              {product.reviewCount} verified review{product.reviewCount === 1 ? "" : "s"}
            </span>
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">Be the first to review this object.</p>
        )}

        <div className="mt-5 flex flex-wrap items-baseline gap-3">
          <Price
            amount={product.finalPrice}
            compareAt={discounted ? product.originalPrice : null}
            size="xl"
          />
          {discounted && percent > 0 ? (
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 dark:bg-red-500/10 dark:text-red-300">
              Save {percent}%
            </span>
          ) : null}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {product.shortDescription ?? product.description.slice(0, 260)}
        </p>

        <div className="mt-5 flex items-center gap-2 text-xs font-semibold">
          {outOfStock ? (
            <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <Package className="h-3.5 w-3.5" aria-hidden="true" />
              Out of stock — join the restock list
            </span>
          ) : product.stock <= product.minimumStockLevel ? (
            <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Package className="h-3.5 w-3.5" aria-hidden="true" />
              Only {product.stock} left in stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              In stock · ships in 48 hours
            </span>
          )}
          <span className="text-muted-foreground">· SKU {product.sku}</span>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex flex-wrap items-center gap-3">
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={Math.max(1, Math.min(product.stock, 10))}
              disabled={outOfStock}
              label={`Quantity of ${productName(product)}`}
            />
            <Button
              size="lg"
              className="min-w-44 flex-1"
              onClick={handleAdd}
              loading={adding}
              disabled={outOfStock}
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              {outOfStock ? "Sold out" : "Add to bag"}
            </Button>
            <Button
              size="icon"
              variant={saved ? "danger" : "outline"}
              onClick={() => void toggleWishlist(product.id, productName(product))}
              aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
              aria-pressed={saved}
              className="h-11 w-11 shrink-0"
            >
              <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} aria-hidden="true" />
            </Button>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            Secure checkout with bKash, Nagad, card or cash on delivery. Taxes
            and delivery are calculated at checkout.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Sold", value: product.soldCount },
            { label: "Rating", value: product.averageRating.toFixed(1) },
            { label: "Reviews", value: product.reviewCount },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card px-2 py-3">
              <p className="text-base font-extrabold tabular-nums">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">
            The details
          </h2>
          <div className="mt-3 space-y-4 text-sm leading-relaxed text-muted-foreground">
            {product.description.split("\n").filter(Boolean).map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
          <dl className="mt-5 divide-y divide-border rounded-xl border border-border bg-card text-sm">
            {[
              ["Material", product.brand?.name ? `${product.brand.name} signature finish` : "Considered mixed materials"],
              ["Category", product.category.name],
              ["SKU", product.sku],
              ["Availability", outOfStock ? "Out of stock" : `${product.stock} in stock`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 px-4 py-2.5">
                <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
                <dd className="text-right text-xs font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Reviews
          </h2>
          <div className="mt-3 space-y-5">
            <ReviewList
              productId={product.id}
              averageRating={product.averageRating}
              reviewCount={product.reviewCount}
            />
            {user?.role === "CUSTOMER" ? <ReviewForm productId={product.id} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="aspect-square animate-pulse rounded-3xl bg-muted" />
      <div className="space-y-4">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="h-24 w-full animate-pulse rounded bg-muted" />
        <div className="h-16 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
