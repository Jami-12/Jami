"use client";

import * as React from "react";

import { ProductCard } from "@/components/storefront/product-card";
import type { Banner, Product } from "@/types";

export function HeroBanner({
  products,
}: {
  products: Product[];
  banners?: Banner[];
}) {
  if (!products || products.length === 0) {
    return null;
  }

  // A multiple of the desktop/mobile column counts keeps every row complete
  // and every card exactly the same size.
  const featured = products.slice(0, 4);

  return (
    <section
      aria-labelledby="all-products-showcase"
      className="relative isolate overflow-hidden border-b border-border bg-background text-foreground"
    >
      <div className="container-page py-10 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-muted-foreground">The considered collection</p>
          <h1
            id="all-products-showcase"
            className="mt-3 font-display text-3xl font-semibold leading-[1.05] not-italic tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Things worth living with
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed not-italic text-muted-foreground sm:text-base">
            Quiet tailoring, softened knits and objects that hold their shape —
            photographed exactly as they arrive and chosen for how they feel.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 sm:gap-3 lg:grid-cols-4">
          {featured.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      </div>
    </section>
  );
}
