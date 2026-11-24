"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Plus } from "lucide-react";

import { QuickViewDialog } from "./quick-view-dialog";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { SmartImage } from "@/components/ui/smart-image";
import { productColors, productDetailLine, productSizes } from "@/lib/product-options";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/types";
import {
  discountPercentOf,
  hasDiscount,
  productName,
  productPrimaryImage,
  productSecondaryImage,
} from "@/types";

export const ProductCard = React.memo(function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: Product;
  priority?: boolean;
  className?: string;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();
  const [adding, setAdding] = React.useState(false);
  const [quickOpen, setQuickOpen] = React.useState(false);

  const name = React.useMemo(() => productName(product), [product]);
  const detailLine = React.useMemo(() => productDetailLine(product), [product]);
  const outOfStock = React.useMemo(
    () => product.stock <= 0 || product.status === "OUT_OF_STOCK",
    [product.stock, product.status],
  );
  const discounted = React.useMemo(() => hasDiscount(product), [product]);
  const percent = React.useMemo(() => discountPercentOf(product), [product]);
  const primary = React.useMemo(() => productPrimaryImage(product), [product]);
  const secondary = React.useMemo(() => productSecondaryImage(product), [product]);
  const colors = React.useMemo(() => productColors(product), [product]);
  const sizes = React.useMemo(() => productSizes(product), [product]);

  const openQuickView = () => setQuickOpen(true);

  const handleQuickAdd = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (outOfStock) return;

    // Size and colour belong to the order, so a quick add must open the
    // selection UI whenever the product offers variants.
    if (colors.length > 0 || sizes.length > 0) {
      openQuickView();
      return;
    }

    setAdding(true);
    try {
      const added = await addItem(product, 1);
      if (added) router.push("/cart");
    } finally {
      setAdding(false);
    }
  };

  const actionProps = {
    name,
    outOfStock,
    adding,
    onQuickView: openQuickView,
    onAdd: handleQuickAdd,
  };

  return (
    <>
      <Card
        className={cn(
          "group/card relative flex h-full min-w-0 flex-col overflow-hidden border border-border bg-background transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-foreground hover:shadow-lift focus-within:border-foreground motion-reduce:hover:translate-y-0",
          className,
        )}
      >
        <article className="flex h-full flex-1 flex-col">
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
                  "object-cover transition-[opacity,transform] duration-300 ease-out group-hover/card:scale-105 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100",
                  secondary && "group-hover/card:opacity-0",
                )}
              />
              {secondary ? (
                <SmartImage
                  src={secondary}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover opacity-0 transition-[opacity,transform] duration-300 ease-out group-hover/card:scale-105 group-hover/card:opacity-100 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100"
                />
              ) : null}
              {discounted && percent > 0 ? (
                <Badge
                  tone="danger"
                  className="absolute left-0 top-0 z-10 bg-foreground px-1.5 py-1 text-background ring-0"
                >
                  −{percent}%
                </Badge>
              ) : null}
            </Link>

            {/* Pointer-only hover bar. The default actions below stay available
                to keyboard and touch users, so these controls are not tabbable. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex translate-y-full items-center gap-2 bg-foreground px-2 py-2 text-background opacity-0 transition-[transform,opacity] duration-200 ease-out group-hover/card:pointer-events-auto group-hover/card:translate-y-0 group-hover/card:opacity-100 motion-reduce:transition-none"
            >
              <p className="hidden min-w-0 flex-1 truncate text-[10px] leading-tight text-background/75 min-[420px]:block">
                {detailLine}
              </p>
              <CardActions {...actionProps} overlay />
            </div>
          </div>

          <div className="flex flex-1 flex-col p-2.5 sm:p-3">
            <h3 className="line-clamp-2 min-h-[2.2rem] font-display text-[0.9rem] font-semibold leading-tight tracking-tight text-foreground/80 transition-colors duration-200 group-hover/card:text-foreground">
              <Link
                href={`/products/${product.slug}`}
                className="underline-offset-4 hover:underline"
              >
                {name}
              </Link>
            </h3>

            <p className="mt-1 truncate text-[11px] leading-4 text-muted-foreground">
              {detailLine}
            </p>

            <div className="mt-auto pt-2">
              <Price
                amount={product.finalPrice}
                compareAt={discounted ? product.originalPrice : null}
                size="xs"
              />
              <CardActions {...actionProps} className="mt-2" />
            </div>
          </div>
        </article>
      </Card>

      {quickOpen ? (
        <QuickViewDialog
          product={product}
          open={quickOpen}
          onClose={() => setQuickOpen(false)}
        />
      ) : null}
    </>
  );
});

function CardActions({
  name,
  outOfStock,
  adding,
  onQuickView,
  onAdd,
  overlay = false,
  className,
}: {
  name: string;
  outOfStock: boolean;
  adding: boolean;
  onQuickView: () => void;
  onAdd: (event: React.MouseEvent<HTMLButtonElement>) => void;
  overlay?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-1.5",
        overlay ? "w-[7.5rem] shrink-0 sm:w-[8.5rem]" : "w-full",
        className,
      )}
    >
      <button
        type="button"
        onClick={onQuickView}
        tabIndex={overlay ? -1 : undefined}
        className={cn(
          "inline-flex h-8 min-w-0 flex-1 items-center justify-center gap-0.5 border px-1 text-[9px] font-bold uppercase tracking-[0.06em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current sm:h-9 sm:gap-1 sm:px-1.5 sm:text-[11px] sm:tracking-[0.08em]",
          overlay
            ? "border-background/60 bg-transparent text-background hover:border-background hover:bg-background hover:text-foreground"
            : "border-border bg-background text-foreground hover:border-foreground hover:bg-foreground hover:text-background",
        )}
      >
        <Eye className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
        <span className="truncate">Quick view</span>
      </button>
      <button
        type="button"
        onClick={onAdd}
        disabled={outOfStock || adding}
        tabIndex={overlay ? -1 : undefined}
        aria-label={`Add ${name} to bag`}
        className={cn(
          "inline-flex h-8 w-8 shrink-0 items-center justify-center border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:w-9",
          overlay
            ? "border-background bg-background text-foreground hover:border-background/70 hover:bg-transparent hover:text-background"
            : "border-foreground bg-foreground text-background hover:bg-background hover:text-foreground",
        )}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
