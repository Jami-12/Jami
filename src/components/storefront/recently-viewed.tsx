"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { ProductGrid } from "./product-grid";
import { useProductsByIds } from "./wishlist-view";

import { SectionHeading } from "@/components/ui/section-heading";
import { useRecentlyViewedStore } from "@/stores/recently-viewed-store";

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const ids = useRecentlyViewedStore((state) => state.ids);
  const idsKey = ids.join("|");
  const targetIds = React.useMemo(
    () =>
      idsKey
        ? Array.from(new Set(idsKey.split("|")))
            .filter((id) => id !== excludeId)
            .slice(0, 4)
        : [],
    [idsKey, excludeId],
  );

  const { data } = useProductsByIds(targetIds);
  const products = data ?? [];

  if (products.length === 0) return null;

  return (
    <section
      aria-labelledby="recently-viewed-heading"
      className="mt-16 border-t border-border bg-background pt-10"
    >
      <SectionHeading
        eyebrow="Recently viewed"
        title="Pick up where you left off."
        action={
          <Link
            href="/products"
            className="-mx-1 inline-flex items-center gap-1 px-1 py-0.5 text-sm font-bold text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Keep browsing
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />
      <h2 id="recently-viewed-heading" className="sr-only">
        Recently viewed pieces
      </h2>
      <ProductGrid products={products} className="mt-6" />
    </section>
  );
}
