"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Loader2,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SmartImage } from "@/components/ui/smart-image";
import { useHydrated } from "@/hooks/use-hydrated";
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FLAT_RATE,
} from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { cartLineKey, cartSubtotal, useCartStore } from "@/stores/cart-store";

export function CartView() {
  const hydrated = useHydrated();
  const items = useCartStore((state) => state.items);
  const syncing = useCartStore((state) => state.syncing);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);
  const user = useAuthStore((state) => state.user);

  const [confirmClear, setConfirmClear] = React.useState(false);
  const [clearing, setClearing] = React.useState(false);

  const subtotal = cartSubtotal(items);
  const count = items.reduce((total, item) => total + item.quantity, 0);
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  if (!hydrated) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-32 w-full rounded-none" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-none" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your bag is empty"
        description="Pieces you add will appear here. Start with the studio edit or the full collection."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href="/products">Explore the collection</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/wishlist">View your wishlist</Link>
            </Button>
          </div>
        }
      />
    );
  }

  const confirmClearCart = async () => {
    setClearing(true);
    try {
      await clear();
    } finally {
      setClearing(false);
      setConfirmClear(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
      <div>
        <Card className="mb-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-border bg-secondary text-foreground">
              <Truck className="h-4 w-4" aria-hidden="true" />
            </span>
            {remaining > 0 ? (
              <span>
                You are {formatCurrency(remaining)} away from free standard
                shipping.
              </span>
            ) : (
              <span className="text-muted-foreground">
                Free standard shipping unlocked.
              </span>
            )}
            {syncing ? (
              <span className="ml-auto inline-flex items-center gap-1 text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                Syncing
              </span>
            ) : null}
          </div>
          <div
            className="mt-3 h-1.5 overflow-hidden rounded-none bg-border"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label="Progress toward free shipping"
          >
            <div
              className="h-full rounded-none bg-foreground transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </Card>

        <Card className="overflow-hidden">
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li
                key={item.cartItemId ?? cartLineKey(item)}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5"
              >
                <Link
                  href={`/products/${item.slug}`}
                  className="relative h-28 w-28 shrink-0 overflow-hidden rounded-none border border-border bg-muted"
                >
                  <SmartImage
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/products/${item.slug}`}
                        className="line-clamp-2 text-sm font-bold leading-snug underline-offset-4 hover:underline sm:text-base"
                      >
                        {item.name}
                      </Link>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>Selected piece</span>
                        {item.selectedSize ? (
                          <Badge tone="neutral">Size: {item.selectedSize}</Badge>
                        ) : null}
                        {item.selectedColor ? (
                          <Badge tone="neutral">Color: {item.selectedColor}</Badge>
                        ) : null}
                        {item.stock <= 5 ? (
                          <Badge tone="warning">Only {item.stock} left</Badge>
                        ) : (
                          <Badge dot tone="neutral">
                            In stock
                          </Badge>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void removeItem(item.cartItemId ?? cartLineKey(item))}
                      aria-label={`Remove ${item.name} from bag`}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-none border border-border text-muted-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <QuantityStepper
                      value={item.quantity}
                      max={Math.max(1, Math.min(item.stock, 99))}
                      onChange={(quantity) =>
                        void updateQuantity(item.cartItemId ?? cartLineKey(item), quantity)
                      }
                      label={`Quantity of ${item.name}`}
                    />
                    <div className="text-right">
                      <Price amount={item.price * item.quantity} size="md" />
                      {item.quantity > 1 ? (
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {formatCurrency(item.price)} each
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm" className="border border-border hover:border-foreground hover:bg-foreground hover:text-background">
            <Link href="/products">
              Continue shopping
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="border border-border text-muted-foreground hover:border-foreground hover:bg-foreground hover:text-background"
            onClick={() => setConfirmClear(true)}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Clear bag
          </Button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24">
        <Card className="p-5 sm:p-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Order summary
          </h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">
                Product Subtotal · {count} item{count === 1 ? "" : "s"}
              </dt>
              <dd>
                <Price amount={subtotal} size="sm" />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Estimated shipping</dt>
              <dd className="font-semibold tabular-nums">
                {shipping === 0 ? "Free" : formatCurrency(shipping)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Tax</dt>
              <dd className="text-xs text-muted-foreground">
                Calculated at checkout
              </dd>
            </div>
          </dl>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Estimated total</span>
            <Price amount={subtotal + shipping} size="lg" />
          </div>

          <Button asChild size="lg" className="mt-5 w-full">
            <Link href="/checkout">
              Continue to checkout
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>

          {!user ? (
            <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
              You will be asked to sign in before placing the order. Your bag is
              saved on this device.
            </p>
          ) : null}

          <ul className="mt-5 space-y-2 border-t border-border pt-4 text-[11px] text-muted-foreground">
            <li>Secure checkout · bKash, Nagad, card or cash on delivery</li>
            <li>30-day returns on unworn pieces</li>
            <li>Carbon-neutral delivery on every order</li>
          </ul>
        </Card>
      </aside>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={confirmClearCart}
        title="Clear your bag?"
        description="This removes every item from your bag. Your wishlist is not affected."
        confirmLabel="Clear bag"
        loading={clearing}
        destructive
      />
    </div>
  );
}
