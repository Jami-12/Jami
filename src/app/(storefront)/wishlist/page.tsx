import type { Metadata } from "next";

import { WishlistView } from "@/components/storefront/wishlist-view";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Objects you have saved for later at Aether.",
  alternates: { canonical: "/wishlist" },
};

export default function WishlistPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <header className="mb-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-500 dark:text-accent-300">
          Saved for later
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Wishlist</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          A considered shortlist. Saved objects sync to your account when you
          sign in as a customer.
        </p>
      </header>
      <WishlistView />
    </div>
  );
}
