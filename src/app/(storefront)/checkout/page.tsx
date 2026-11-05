import type { Metadata } from "next";

import { CheckoutView } from "@/components/storefront/checkout-view";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout with bKash, Nagad, card or cash on delivery.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <header className="mb-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-500 dark:text-accent-300">
          Checkout · Secure
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Delivery &amp; payment
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Confirm where this order should go and how you would like to pay. The
          order is only created after the server re-validates stock and pricing.
        </p>
      </header>
      <CheckoutView />
    </div>
  );
}
