"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { SmartImage } from "@/components/ui/smart-image";
import type { Banner, Product } from "@/types";
import { productName, productPrimaryImage } from "@/types";

export function HeroBanner({
  products,
}: {
  products: Product[];
  banners?: Banner[];
}) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="all-products-showcase" className="container-page py-8 sm:py-12">
      {/* Centered Straight Heading & Description Header */}
      <div className="mx-auto mb-8 max-w-2xl space-y-2.5 text-center not-italic">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-medium not-italic text-primary shadow-2xs">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Curated Collection</span>
        </div>

        <h1
          id="all-products-showcase"
          className="font-sans text-2xl font-bold not-italic tracking-tight text-foreground sm:text-3xl lg:text-4xl"
        >
          Crafted Essentials for Everyday Living
        </h1>

        <p className="text-xs leading-relaxed not-italic text-muted-foreground sm:text-sm">
          Explore our handpicked selection of quality products designed for modern comfort, durability, and everyday style.
        </p>
      </div>

      {/* Larger Picture + Title Product Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6 not-italic">
        {products.map((product, index) => {
          const image = productPrimaryImage(product);
          const name = productName(product);

          return (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group block outline-none"
            >
              <Card className="overflow-hidden rounded-2xl border border-border bg-card not-italic transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                  <SmartImage
                    src={image}
                    alt={name}
                    fill
                    priority={index < 4}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-4 text-center not-italic">
                  <h2 className="line-clamp-1 text-base font-semibold not-italic text-foreground transition-colors group-hover:text-primary">
                    {name}
                  </h2>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}