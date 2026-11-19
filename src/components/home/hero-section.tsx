"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { SmartImage } from "@/components/ui/smart-image";
import type { Product } from "@/types";
import { productName, productPrimaryImage } from "@/types";

const ALL = "All";

// Heading font. Change this to any Google font you like.
const headingFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

// Same export name as before, so existing imports keep working.
// Shows ALL products passed in (no slicing).
export function HeroSection({ products }: { products: Product[] }) {
  const [active, setActive] = useState<string>(ALL);

  const categories = useMemo(() => {
    const names = new Set<string>();
    products.forEach((p) => {
      if (p.category?.name) names.add(p.category.name);
    });
    return [ALL, ...Array.from(names)];
  }, [products]);

  const visible = useMemo(
    () =>
      active === ALL
        ? products
        : products.filter((p) => p.category?.name === active),
    [products, active],
  );

  if (products.length === 0) {
    return (
      <section className="container-page py-16 text-center sm:py-24">
        <h1
          className={`${headingFont.className} text-5xl font-semibold tracking-tight sm:text-6xl`}
        >
          No products yet
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-muted-foreground">
          Products you add will appear here.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/products">Go to products</Link>
        </Button>
      </section>
    );
  }

  return (
    <section aria-labelledby="catalog-heading" className="container-page py-8 sm:py-12">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <h1
          id="catalog-heading"
          className={`${headingFont.className} text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl`}
        >
          Objects worth living with
        </h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">
          {visible.length} {visible.length === 1 ? "product" : "products"}
          {active !== ALL ? ` in ${active}` : ""}
        </p>

        {categories.length > 2 ? (
          <div
            role="group"
            aria-label="Filter by category"
            className="mt-6 flex flex-wrap justify-center gap-2"
          >
            {categories.map((name) => {
              const selected = name === active;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setActive(name)}
                  aria-pressed={selected}
                  className={
                    "rounded-full border px-4 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring " +
                    (selected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-foreground hover:bg-muted")
                  }
                >
                  {name}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:mt-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-y-10">
        {visible.map((product, index) => {
          const name = productName(product);
          const image = productPrimaryImage(product);
          const onSale = product.finalPrice < product.originalPrice;

          return (
            <li key={product.id}>
              <Link
                href={`/products/${product.slug}`}
                aria-label={`View ${name}`}
                className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
                  <SmartImage
                    src={image}
                    alt={name}
                    fill
                    priority={index < 4}
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  />
                  {product.isFeatured || onSale ? (
                    <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
                      {product.isFeatured ? (
                        <Badge tone="accent" className="px-2 py-0.5 text-[10px]">
                          Featured
                        </Badge>
                      ) : null}
                      {onSale ? (
                        <Badge tone="danger" className="px-2 py-0.5 text-[10px]">
                          Sale
                        </Badge>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="mt-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-semibold sm:text-base">
                      {name}
                    </p>
                    {product.brand ? (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {product.brand.name}
                      </p>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right">
                    <Price
                      amount={product.finalPrice}
                      compareAt={onSale ? product.originalPrice : null}
                      size="xs"
                    />
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}