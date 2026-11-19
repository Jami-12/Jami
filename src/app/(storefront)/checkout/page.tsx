import type { Metadata } from "next";

import { CheckoutView } from "@/components/storefront/checkout-view";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout with bKash, Nagad, card or cash on delivery.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="container-page py-10 sm:py-14 lg:py-16">
      <header className="mb-8 max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-600 dark:text-accent-300">
          Checkout · Secure
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Delivery &amp; payment
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Confirm where this order should go and how you would like to pay. The
          order is created only after the server re-validates stock and pricing.
        </p>
      </header>
      <CheckoutView />
    </div>
  );
}
