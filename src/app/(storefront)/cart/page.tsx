import type { Metadata } from "next";

import { CartView } from "@/components/storefront/cart-view";

export const metadata: Metadata = {
  title: "Your bag",
  description: "Review the objects in your bag before checkout.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <header className="mb-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-500 dark:text-accent-300">
          Checkout · Step 1
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Your bag</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Review quantities and delivery estimates. Coupons and payment are
          handled on the next step.
        </p>
      </header>
      <CartView />
    </div>
  );
}
