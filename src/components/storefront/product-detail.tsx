"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { productColors, productSizes } from "@/lib/product-options";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn, formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useRecentlyViewedStore } from "@/stores/recently-viewed-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { Product } from "@/types";
import {
  discountPercentOf,
  hasDiscount,
  productName,
} from "@/types";
import { ReviewForm } from "./review-form";
import { ReviewList } from "./review-list";

interface GalleryImage {
  url: string;
  alt: string;
}

function buildGallery(product: Product): GalleryImage[] {
  const ordered = product.images
    .slice()
    .sort(
      (a, b) =>
        Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder,
    )
    .map((image) => ({
      url: image.url || image.imageUrl,
      alt: image.altText ?? "",
    }))
    .filter((image): image is GalleryImage => Boolean(image.url));

  if (product.thumbnail && !ordered.some((image) => image.url === product.thumbnail)) {
    ordered.push({ url: product.thumbnail, alt: "" });
  }

  return ordered;
}

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const gallery = React.useMemo(() => buildGallery(product), [product]);
  const colors = React.useMemo(() => productColors(product), [product]);
  const sizes = React.useMemo(() => productSizes(product), [product]);

  const [activeImage, setActiveImage] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);
  const [adding, setAdding] = React.useState(false);
  const [buying, setBuying] = React.useState(false);
  const [color, setColor] = React.useState<string | null>(null);
  const [size, setSize] = React.useState<string | null>(null);
  const [selectionError, setSelectionError] = React.useState<string | null>(null);

  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const wishlistIds = useWishlistStore((state) => state.ids);
  const user = useAuthStore((state) => state.user);
  const hydrated = useHydrated();
  const addRecentlyViewed = useRecentlyViewedStore((state) => state.add);

  React.useEffect(() => {
    addRecentlyViewed(product.id);
  }, [addRecentlyViewed, product.id]);

  const name = productName(product);
  const saved = hydrated && wishlistIds.includes(product.id);
  const outOfStock = product.stock <= 0 || product.status === "OUT_OF_STOCK";
  const discounted = hasDiscount(product);
  const percent = discountPercentOf(product);
  const needsColor = colors.length > 0 && !color;
  const needsSize = Boolean(sizes) && !size;
  const image = gallery[activeImage] ?? gallery[0] ?? null;

  const selectColor = (option: { name: string; hex: string }) => {
    setColor(option.name);
    setSelectionError(null);
    const match = gallery.findIndex((entry) =>
      entry.alt.toLowerCase().includes(option.name.toLowerCase()),
    );
    if (match >= 0) setActiveImage(match);
  };

  const validate = (): boolean => {
    if (needsColor || needsSize) {
      setSelectionError(
        needsColor && needsSize
          ? "Choose a colour and size to continue."
          : needsColor
            ? "Choose a colour to continue."
            : "Choose a size to continue.",
      );
      return false;
    }
    return true;
  };

  const handleAdd = async (): Promise<boolean> => {
    if (outOfStock || !validate()) return false;
    setAdding(true);
    await addItem(product, quantity);
    setAdding(false);
    return true;
  };

  const handleBuyNow = async () => {
    if (outOfStock) return;
    setBuying(true);
    const ok = await handleAdd();
    setBuying(false);
    if (ok) router.push("/checkout");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.08fr_1fr] lg:gap-14">
      <div className="min-w-0">
        <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-muted shadow-soft sm:aspect-[5/6]">
          <SmartImage
            src={image?.url ?? null}
            alt={image?.alt || name}
            fill
            sizes="(max-width: 1024px) 100vw, 52vw"
            priority
            className="object-cover"
          />

          <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
            {discounted && percent > 0 ? (
              <Badge tone="danger">−{percent}%</Badge>
            ) : null}
            {product.isFeatured ? <Badge tone="accent">Studio edit</Badge> : null}
            {outOfStock ? <Badge tone="neutral">Sold out</Badge> : null}
          </div>

          {gallery.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveImage((current) =>
                    current === 0 ? gallery.length - 1 : current - 1,
                  )
                }
                aria-label="Previous image"
                className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/85 text-[#172B3A] shadow-soft backdrop-blur transition hover:bg-white"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveImage((current) => (current + 1) % gallery.length)
                }
                aria-label="Next image"
                className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/85 text-[#172B3A] shadow-soft backdrop-blur transition hover:bg-white"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          ) : null}

          <span className="absolute bottom-3 right-3 rounded-full bg-[#252B2B]/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
            {activeImage === 0 ? "On the hanger" : `View ${activeImage + 1}`}
          </span>
        </div>

        {gallery.length > 1 ? (
          <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
            {gallery.map((entry, index) => (
              <button
                key={`${entry.url}-${index}`}
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
                <SmartImage
                  src={entry.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
                {index === 0 ? (
                  <span className="absolute inset-x-0 bottom-0 bg-[#252B2B]/65 py-0.5 text-center text-[8px] font-bold uppercase tracking-[0.12em] text-white">
                    Hanger
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: Truck,
              label: "Free delivery",
              copy: `Over ${formatCurrency(FREE_SHIPPING_THRESHOLD)}`,
            },
            {
              icon: RotateCcw,
              label: "30-day returns",
              copy: "Unworn, with tags",
            },
            {
              icon: ShieldCheck,
              label: "Secure checkout",
              copy: "bKash, Nagad, card, COD",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-3"
            >
              <item.icon
                className="mt-0.5 h-4 w-4 shrink-0 text-primary-500 dark:text-accent-300"
                aria-hidden="true"
              />
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

        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
          {name}
        </h1>

        {product.reviewCount > 0 ? (
          <div className="mt-3 flex items-center gap-2">
            <RatingStars rating={product.averageRating} showValue />
            <span className="text-xs text-muted-foreground">
              {product.reviewCount} verified review
              {product.reviewCount === 1 ? "" : "s"}
            </span>
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            Be the first to review this piece.
          </p>
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

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
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

        {colors.length > 0 ? (
          <fieldset className="mt-6">
            <legend className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              <span>Colour</span>
              <span className="font-medium normal-case tracking-normal text-foreground">
                {color ?? "Choose one"}
              </span>
            </legend>
            <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
              {colors.map((option) => (
                <button
                  key={option.name}
                  type="button"
                  onClick={() => selectColor(option)}
                  aria-label={option.name}
                  aria-pressed={color === option.name}
                  title={option.name}
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-full border-2 transition",
                    color === option.name
                      ? "border-primary-700 dark:border-accent-300"
                      : "border-border hover:border-primary-300",
                  )}
                >
                  <span
                    className="h-6 w-6 rounded-full border border-black/10"
                    style={{ backgroundColor: option.hex }}
                  />
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {sizes ? (
          <fieldset className="mt-5">
            <legend className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              <span>Size</span>
              <span className="font-medium normal-case tracking-normal text-foreground">
                {size ?? "Choose one"}
              </span>
            </legend>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {sizes.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSize(option);
                    setSelectionError(null);
                  }}
                  aria-pressed={size === option}
                  className={cn(
                    "inline-flex h-10 min-w-11 items-center justify-center rounded-lg border px-3 text-xs font-semibold transition",
                    size === option
                      ? "border-primary-700 bg-primary-700 text-white dark:border-accent-300 dark:bg-accent-300 dark:text-[#172B3A]"
                      : "border-border text-muted-foreground hover:border-primary-300 hover:text-foreground",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {selectionError ? (
          <p role="alert" className="mt-3 text-xs font-medium text-red-600 dark:text-red-400">
            {selectionError}
          </p>
        ) : null}

        <div className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex flex-wrap items-center gap-3">
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={Math.max(1, Math.min(product.stock, 10))}
              disabled={outOfStock}
              label={`Quantity of ${name}`}
            />
            <Button
              size="lg"
              className="min-w-40 flex-1"
              onClick={() => void handleAdd()}
              loading={adding}
              disabled={outOfStock}
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              {outOfStock ? "Sold out" : "Add to bag"}
            </Button>
            <Button
              size="icon"
              variant={saved ? "danger" : "outline"}
              onClick={() => void toggleWishlist(product.id, name)}
              aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
              aria-pressed={saved}
              className="h-11 w-11 shrink-0"
            >
              <Heart
                className="h-4 w-4"
                fill={saved ? "currentColor" : "none"}
                aria-hidden="true"
              />
            </Button>
          </div>
          <Button
            size="lg"
            variant="secondary"
            className="mt-2.5 w-full"
            onClick={() => void handleBuyNow()}
            loading={buying}
            disabled={outOfStock}
          >
            Buy it now
          </Button>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            Secure checkout with bKash, Nagad, card or cash on delivery. Taxes and
            delivery are calculated at checkout.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Sold", value: product.soldCount },
            { label: "Rating", value: product.averageRating.toFixed(1) },
            { label: "Reviews", value: product.reviewCount },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card px-2 py-3"
            >
              <p className="font-display text-lg font-semibold tabular-nums">
                {stat.value}
              </p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            The details
          </h2>
          <div className="mt-3 space-y-4 text-sm leading-relaxed text-muted-foreground">
            {product.description
              .split("\n")
              .filter(Boolean)
              .map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
          </div>
          <dl className="mt-5 divide-y divide-border rounded-xl border border-border bg-card text-sm">
            {[
              [
                "Material",
                product.brand?.name
                  ? `${product.brand.name} signature finish`
                  : "Considered natural fibres",
              ],
              ["Category", product.category.name],
              ["SKU", product.sku],
              [
                "Availability",
                outOfStock ? "Out of stock" : `${product.stock} in stock`,
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 px-4 py-2.5"
              >
                <dt className="text-xs font-semibold text-muted-foreground">
                  {label}
                </dt>
                <dd className="text-right text-xs font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-8">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Reviews
          </h2>
          <div className="mt-3 space-y-5">
            <ReviewList
              productId={product.id}
              averageRating={product.averageRating}
              reviewCount={product.reviewCount}
            />
            {hydrated && user?.role === "CUSTOMER" ? <ReviewForm productId={product.id} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />
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
