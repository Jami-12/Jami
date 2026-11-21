"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, Heart, Package, ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { RatingStars } from "@/components/ui/rating-stars";
import { SmartImage } from "@/components/ui/smart-image";
import {
  productColors,
  productDetailLine,
  productSizes,
} from "@/lib/product-options";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { Product } from "@/types";
import { discountPercentOf, hasDiscount, productImages, productName } from "@/types";

export function QuickViewDialog({
  product,
  open,
  onClose,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const wishlistIds = useWishlistStore((state) => state.ids);

  const [activeImage, setActiveImage] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);
  const [color, setColor] = React.useState<string | null>(null);
  const [size, setSize] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [added, setAdded] = React.useState(false);

  const productId = product?.id;

  React.useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    setColor(null);
    setSize(null);
    setAdding(false);
    setAdded(false);
  }, [productId]);

  if (!product) return null;

  const images = productImages(product);
  const colors = productColors(product);
  const sizes = productSizes(product);
  const name = productName(product);
  const saved = wishlistIds.includes(product.id);
  const outOfStock = product.stock <= 0 || product.status === "OUT_OF_STOCK";
  const discounted = hasDiscount(product);
  const percent = discountPercentOf(product);
  const needsSize = Boolean(sizes?.length) && !size;
  const needsColor = colors.length > 0 && !color;
  const selectionIncomplete = needsSize || needsColor;

  const handleAdd = async () => {
    if (outOfStock || selectionIncomplete) return;
    setAdding(true);
    try {
      await addItem(product, quantity, { size, color });
      setAdded(true);
      window.setTimeout(() => setAdded(false), 2200);
    } finally {
      setAdding(false);
    }
  };

  const selectionHint = selectionIncomplete
    ? [
        needsColor ? "choose a colour" : null,
        needsSize ? "choose a size" : null,
      ]
        .filter(Boolean)
        .join(" and ")
    : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={name}
      description={product.category?.name}
      size="xl"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm" className="px-0">
            <Link href={`/products/${product.slug}`} onClick={onClose}>
              View full details
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => void toggleWishlist(product.id, name)}
              aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
              aria-pressed={saved}
              className="border-border hover:border-foreground hover:bg-foreground hover:text-background"
            >
              <Heart
                className="h-4 w-4"
                fill={saved ? "currentColor" : "none"}
                aria-hidden="true"
              />
            </Button>
            <Button
              onClick={() => void handleAdd()}
              loading={adding}
              disabled={outOfStock || selectionIncomplete}
              className="min-w-40"
            >
              {added ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              )}
              {outOfStock ? "Sold out" : added ? "Added to bag" : "Add to bag"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid gap-6 rounded-none border border-border bg-card p-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] sm:p-5">
        <div className="min-w-0">
          <div className="relative aspect-[4/5] overflow-hidden rounded-none border border-border bg-muted">
            <SmartImage
              src={images[activeImage] ?? null}
              alt={name}
              fill
              sizes="(max-width: 640px) 90vw, 360px"
              className="object-cover"
            />
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {discounted && percent > 0 ? (
                <Badge tone="success">−{percent}%</Badge>
              ) : null}
              {outOfStock ? <Badge tone="danger">Sold out</Badge> : null}
            </div>
          </div>

          {images.length > 1 ? (
            <div className="hide-scrollbar mt-2.5 flex gap-2 overflow-x-auto pb-1">
              {images.slice(0, 6).map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Show image ${index + 1}`}
                  aria-current={activeImage === index}
                  className={cn(
 "relative h-16 w-16 shrink-0 overflow-hidden rounded-none border-2 bg-muted transition",
                    activeImage === index
                      ? "border-foreground"
                      : "border-border opacity-65 hover:border-foreground hover:opacity-100",
                  )}
                >
                  <SmartImage
                    src={image}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="min-w-0">
          {product.reviewCount > 0 ? (
            <RatingStars
              rating={product.averageRating}
              showValue
              size={13}
              className="mb-2"
            />
          ) : null}

          <Price
            amount={product.finalPrice}
            compareAt={discounted ? product.originalPrice : null}
            size="lg"
          />

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {productDetailLine(product)}
          </p>

          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
            <Package className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            {outOfStock ? (
              <span className="text-danger">Out of stock</span>
            ) : product.stock <= product.minimumStockLevel ? (
              <span className="text-warning">
                Only {product.stock} left
              </span>
            ) : (
              <span className="text-success">
                In stock · ships in 48 hours
              </span>
            )}
          </p>

          {colors.length > 0 ? (
            <fieldset className="mt-5">
              <legend className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                <span>Colour</span>
                <span className="font-medium normal-case tracking-normal text-foreground">
                  {color ?? "Select a colour"}
                </span>
              </legend>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {colors.map((option) => {
                  const active = color === option.name;
                  return (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => setColor(option.name)}
                      aria-label={option.name}
                      aria-pressed={active}
                      title={option.name}
                      className={cn(
 "inline-flex h-8 w-8 items-center justify-center rounded-none border-2 transition",
                        active
                          ? "border-foreground bg-secondary"
                          : "border-border hover:border-foreground",
                      )}
                    >
                      <span
                        className="h-5 w-5 rounded-none border border-border"
                        style={{ backgroundColor: option.hex }}
                      />
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          {sizes && sizes.length > 0 ? (
            <fieldset className="mt-4">
              <legend className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                <span>Size</span>
                <span className="font-medium normal-case tracking-normal text-foreground">
                  {size ?? "Select a size"}
                </span>
              </legend>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {sizes.map((option) => {
                  const active = size === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSize(option)}
                      aria-pressed={active}
                      className={cn(
 "inline-flex h-9 min-w-10 items-center justify-center rounded-none border px-2.5 text-xs font-semibold transition",
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={Math.max(1, Math.min(product.stock, 10))}
              disabled={outOfStock}
              label={`Quantity of ${name}`}
            />
            <span className="text-[11px] text-muted-foreground">
              {product.stock > 0 ? `${product.stock} available` : "Restocking soon"}
            </span>
          </div>

          {(colors.length > 0 || (sizes && sizes.length > 0)) ? (
            <p
              className={cn(
 "mt-3 rounded-none px-3 py-2 text-xs font-medium",
                selectionIncomplete
                  ? "border border-foreground bg-secondary text-foreground"
                  : "border border-border bg-secondary text-foreground",
              )}
              aria-live="polite"
            >
              {selectionIncomplete
                ? `Please ${selectionHint} before adding to bag.`
                : "Selection complete."}
            </p>
          ) : null}
        </div>
      </div>
    </Dialog>
  );
}
