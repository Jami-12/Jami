import type { Metadata } from "next";

import { CartView } from "@/components/storefront/cart-view";

export const metadata: Metadata = {
  title: "Your bag",
  description: "Review the pieces in your bag before checkout.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div className="container-page py-10 sm:py-14 lg:py-16">
      <header className="mb-8 max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-600 dark:text-accent-300">
          Checkout · Step 1
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Your bag
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Review quantities and delivery estimates. Coupons and payment are
          handled in the next step.
        </p>
      </header>
      <CartView />
    </div>
  );
}
