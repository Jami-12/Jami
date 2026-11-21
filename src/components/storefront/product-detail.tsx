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
import { Card } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { RatingStars } from "@/components/ui/rating-stars";
import { Separator } from "@/components/ui/separator";
import { SmartImage } from "@/components/ui/smart-image";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { useHydrated } from "@/hooks/use-hydrated";
import { productColors, productSizes } from "@/lib/product-options";
import { cn, formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useRecentlyViewedStore } from "@/stores/recently-viewed-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { Product } from "@/types";
import { discountPercentOf, hasDiscount, productName } from "@/types";

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

  if (
    product.thumbnail &&
    !ordered.some((image) => image.url === product.thumbnail)
  ) {
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

  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const wishlistIds = useWishlistStore((state) => state.ids);
  const user = useAuthStore((state) => state.user);
  const hydrated = useHydrated();
  const addRecentlyViewed = useRecentlyViewedStore((state) => state.add);

  React.useEffect(() => {
    addRecentlyViewed(product.id);
  }, [addRecentlyViewed, product.id]);

  React.useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    setColor(null);
    setSize(null);
  }, [product.id]);

  const name = productName(product);
  const saved = hydrated && wishlistIds.includes(product.id);
  const outOfStock = product.stock <= 0 || product.status === "OUT_OF_STOCK";
  const discounted = hasDiscount(product);
  const percent = discountPercentOf(product);
  const needsColor = colors.length > 0 && !color;
  const needsSize = Boolean(sizes?.length) && !size;
  const selectionIncomplete = needsColor || needsSize;
  const image = gallery[activeImage] ?? gallery[0] ?? null;
  const maxQty = Math.max(1, Math.min(product.stock || 1, 10));

  const selectColor = (option: { name: string; hex: string }) => {
    setColor(option.name);
    const match = gallery.findIndex((entry) =>
      entry.alt.toLowerCase().includes(option.name.toLowerCase()),
    );
    if (match >= 0) setActiveImage(match);
  };

  const handleAdd = async (): Promise<boolean> => {
    if (outOfStock || selectionIncomplete) return false;
    setAdding(true);
    try {
      await addItem(product, quantity, { size, color });
      return true;
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (outOfStock || selectionIncomplete) return;
    setBuying(true);
    try {
      const ok = await handleAdd();
      if (ok) router.push("/checkout");
    } finally {
      setBuying(false);
    }
  };

  const selectionHint = selectionIncomplete
    ? [
        needsColor ? "Select a colour" : null,
        needsSize ? "Select a size" : null,
      ]
        .filter(Boolean)
        .join(" and ")
    : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 xl:gap-16">
      <div className="min-w-0">
        <div className="group relative aspect-[4/5] overflow-hidden border border-border bg-muted sm:aspect-[5/6]">
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
            {outOfStock ? <Badge tone="danger">Sold out</Badge> : null}
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
                className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-border bg-background text-foreground outline-none transition-colors hover:border-foreground hover:bg-foreground hover:text-background focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveImage((current) => (current + 1) % gallery.length)
                }
                aria-label="Next image"
                className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-border bg-background text-foreground outline-none transition-colors hover:border-foreground hover:bg-foreground hover:text-background focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          ) : null}

          <span className="absolute bottom-3 right-3 border border-border bg-foreground px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-background">
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
                  "relative h-20 w-20 shrink-0 overflow-hidden border-2 bg-muted transition",
                  activeImage === index
                    ? "border-foreground"
                    : "border-border opacity-60 hover:opacity-100",
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
                  <span className="absolute inset-x-0 bottom-0 bg-foreground py-0.5 text-center text-[8px] font-bold uppercase tracking-[0.12em] text-background">
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
            <Card key={item.label} className="flex items-start gap-2.5 border-border p-3.5 transition-colors hover:border-foreground">
              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-muted text-foreground">
                <item.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold">{item.label}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {item.copy}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/products?category=${product.category.slug}`}
            className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground underline-offset-4 hover:underline"
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

        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
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
            <span className="border border-border bg-background px-2.5 py-1 text-[11px] font-bold text-foreground">
              Save {percent}%
            </span>
          ) : null}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {product.shortDescription ?? product.description.slice(0, 260)}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
          {outOfStock ? (
            <span className="inline-flex items-center gap-1.5 text-danger">
              <Package className="h-3.5 w-3.5" aria-hidden="true" />
              Out of stock
            </span>
          ) : product.stock <= product.minimumStockLevel ? (
            <span className="inline-flex items-center gap-1.5 text-warning">
              <Package className="h-3.5 w-3.5" aria-hidden="true" />
              Only {product.stock} left in stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-success">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              In stock · ships in 48 hours
            </span>
          )}
          <span className="text-muted-foreground">· SKU {product.sku}</span>
        </div>

        <Card className="mt-6 space-y-6 border border-border bg-card p-4 sm:p-5">
          {colors.length > 0 ? (
            <fieldset>
              <legend className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                <span>Colour</span>
                <span className="font-medium normal-case tracking-normal text-foreground">
                  {color ?? "Select a colour"}
                </span>
              </legend>
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                {colors.map((option) => {
                  const active = color === option.name;
                  return (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => selectColor(option)}
                      aria-label={option.name}
                      aria-pressed={active}
                      title={option.name}
                      className={cn(
                        "inline-flex h-10 w-10 items-center justify-center border-2 transition-colors",
                        active
                          ? "border-foreground"
                          : "border-border hover:border-foreground",
                      )}
                    >
                      <span
                        className="h-6 w-6 border border-foreground/20"
                        style={{ backgroundColor: option.hex }}
                      />
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          {sizes && sizes.length > 0 ? (
            <fieldset>
              <legend className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                <span>Size</span>
                <span className="font-medium normal-case tracking-normal text-foreground">
                  {size ?? "Select a size"}
                </span>
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {sizes.map((option) => {
                  const active = size === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSize(option)}
                      aria-pressed={active}
                      className={cn(
                        "inline-flex h-11 w-11 items-center justify-center border p-0 text-xs font-semibold transition-colors",
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-card text-foreground hover:border-foreground",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          {(colors.length > 0 || (sizes && sizes.length > 0)) && (
            <div
              className={cn(
                "border border-border bg-muted px-3 py-2.5 text-xs text-foreground",
                selectionIncomplete && "text-muted-foreground",
              )}
              aria-live="polite"
            >
              {selectionIncomplete ? (
                <span className="font-medium">
                  {selectionHint} to enable add to bag and checkout.
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Selection complete — ready to add.
                </span>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={maxQty}
              disabled={outOfStock}
              label={`Quantity of ${name}`}
            />
            <Button
              size="lg"
              className="min-w-40 flex-1 border border-foreground bg-foreground text-background hover:bg-background hover:text-foreground"
              onClick={() => void handleAdd()}
              loading={adding}
              disabled={outOfStock || selectionIncomplete}
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
              className="h-11 w-11 shrink-0 border border-border bg-background text-foreground hover:border-foreground hover:bg-foreground hover:text-background"
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
            className="w-full border border-border bg-background text-foreground hover:border-foreground hover:bg-foreground hover:text-background"
            onClick={() => void handleBuyNow()}
            loading={buying}
            disabled={outOfStock || selectionIncomplete}
          >
            Buy it now
          </Button>

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Secure checkout with bKash, Nagad, card or cash on delivery. Taxes
            and delivery are calculated at checkout.
          </p>
        </Card>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Sold", value: product.soldCount },
            { label: "Rating", value: product.averageRating.toFixed(1) },
            { label: "Reviews", value: product.reviewCount },
          ].map((stat) => (
            <Card key={stat.label} className="border-border px-2 py-3 transition-colors hover:border-foreground">
              <p className="font-display text-lg font-semibold tabular-nums">
                {stat.value}
              </p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {stat.label}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-8 border border-border bg-card p-5">
          <h2 className="border-b border-border pb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            The details
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
            {product.description
              .split("\n")
              .filter(Boolean)
              .map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
          </div>

          <Separator className="my-5" />

          <dl className="grid gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
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
              <div key={label} className="border border-border bg-background px-4 py-3">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-foreground">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-10 border border-border bg-card p-5">
          <h2 className="border-b border-border pb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Reviews
          </h2>
          <div className="mt-5 space-y-5">
            <ReviewList
              productId={product.id}
              averageRating={product.averageRating}
              reviewCount={product.reviewCount}
            />
            {hydrated && user?.role === "CUSTOMER" ? (
              <ReviewForm productId={product.id} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="aspect-[4/5] animate-pulse rounded-none bg-muted" />
      <div className="space-y-4">
        <div className="h-4 w-24 animate-pulse rounded-none bg-muted" />
        <div className="h-10 w-3/4 animate-pulse rounded-none bg-muted" />
        <div className="h-6 w-40 animate-pulse rounded-none bg-muted" />
        <div className="h-24 w-full animate-pulse rounded-none bg-muted" />
        <div className="h-16 w-full animate-pulse rounded-none bg-muted" />
      </div>
    </div>
  );
}
