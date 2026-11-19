"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Trash2, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { SmartImage } from "@/components/ui/smart-image";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { cartSubtotal, useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";

export function CartDrawer() {
  const open = useUiStore((state) => state.cartOpen);
  const closeCart = useUiStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const syncing = useCartStore((state) => state.syncing);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const subtotal = cartSubtotal(items);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const count = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Drawer
      open={open}
      onClose={closeCart}
      title="Your bag"
      description={
        count > 0 ? `${count} item${count === 1 ? "" : "s"} selected` : "Nothing here yet"
      }
      footer={
        items.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <Price amount={subtotal} size="md" />
            </div>
            <p className="text-xs text-muted-foreground">
              Taxes and shipping are calculated at checkout.
            </p>
            <div onClick={closeCart}>
              <Button asChild size="lg" className="w-full" disabled={syncing}>
                <Link href="/checkout">
                  Continue to checkout
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <div onClick={closeCart}>
              <Button asChild variant="outline" className="w-full">
                <Link href="/cart">View bag</Link>
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
          <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted/60 text-muted-foreground">
            <ShoppingBag className="h-6 w-6" aria-hidden="true" />
          </span>
          <h3 className="font-display text-lg font-semibold">Your bag is empty</h3>
          <p className="mt-1.5 max-w-[17rem] text-sm leading-relaxed text-muted-foreground">
            Add something considered. Free shipping over{" "}
            {formatCurrency(FREE_SHIPPING_THRESHOLD)}.
          </p>
          <div onClick={closeCart} className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/products">Explore the collection</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/wishlist">View wishlist</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="px-5 py-5">
          <div className="mb-5 rounded-2xl border border-border bg-muted/40 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Truck
                className="h-4 w-4 text-primary-600 dark:text-accent-300"
                aria-hidden="true"
              />
              {remaining > 0 ? (
                <span>
                  {formatCurrency(remaining)} away from free standard shipping
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400">
                  Free standard shipping unlocked
                </span>
              )}
              {syncing ? (
                <span className="ml-auto text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Syncing
                </span>
              ) : null}
            </div>
            <div
              className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-border"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              aria-label="Progress toward free shipping"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-600 to-accent-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li
                key={item.productId}
                className="flex gap-3 py-4 first:pt-0 last:pb-0"
              >
                <Link
                  href={`/products/${item.slug}`}
                  onClick={closeCart}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted"
                >
                  <SmartImage
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="line-clamp-2 text-sm font-semibold leading-snug hover:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      aria-label={`Remove ${item.name} from bag`}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <QuantityStepper
                      value={item.quantity}
                      max={Math.max(1, item.stock)}
                      onChange={(quantity) =>
                        updateQuantity(item.productId, quantity)
                      }
                      className="h-8 [&>button]:w-8"
                      label={`Quantity of ${item.name}`}
                    />
                    <Price amount={item.price * item.quantity} size="sm" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Drawer>
  );
}
