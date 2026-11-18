"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { ProductGrid } from "./product-grid";

import { SectionHeading } from "@/components/ui/section-heading";
import { productsApi } from "@/lib/api/services";
import { useRecentlyViewedStore } from "@/stores/recently-viewed-store";
import type { Product } from "@/types";

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const ids = useRecentlyViewedStore((state) => state.ids);
  const [products, setProducts] = React.useState<Product[]>([]);

  React.useEffect(() => {
    const target = ids.filter((id) => id !== excludeId).slice(0, 4);
    if (target.length === 0) {
      setProducts([]);
      return;
    }

    let cancelled = false;
    void Promise.all(
      target.map((id) => productsApi.get(id).catch(() => null)),
    ).then((results) => {
      if (cancelled) return;
      setProducts(results.filter((item): item is Product => item !== null));
    });

    return () => {
      cancelled = true;
    };
  }, [ids, excludeId]);

  if (products.length === 0) return null;

  return (
    <section
      aria-labelledby="recently-viewed-heading"
      className="mt-16 border-t border-border pt-10"
    >
      <SectionHeading
        eyebrow="Recently viewed"
        title="Pick up where you left off."
        action={
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline dark:text-accent-300"
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
