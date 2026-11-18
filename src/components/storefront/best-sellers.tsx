import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Price } from "@/components/ui/price";
import { SmartImage } from "@/components/ui/smart-image";
import type { Product } from "@/types";
import { productName, productPrimaryImage } from "@/types";

export function BestSellers({ products }: { products: Product[] }) {
  const items = products.slice(0, 5);
  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="bestsellers-heading"
      className="border-y border-border bg-card/45"
    >
      <div className="container-page grid gap-8 py-14 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow text-primary-500 dark:text-accent-300">
            Best sellers
          </p>
          <h2
            id="bestsellers-heading"
            className="mt-2 font-display text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl"
          >
            The pieces
            <span className="block italic text-primary-600 dark:text-accent-300">
              that keep selling out.
            </span>
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Ranked by what customers actually bought this season — not by what
            we hoped they would.
          </p>
          <Link
            href="/products?sort=popular"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:underline dark:text-accent-300"
          >
            Shop all bestsellers
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <ol className="divide-y divide-border rounded-2xl border border-border bg-card shadow-soft">
          {items.map((product, index) => {
            const name = productName(product);
            return (
              <li key={product.id}>
                <Link
                  href={`/products/${product.slug}`}
                  className="group flex items-center gap-3 p-3 transition hover:bg-muted/60 sm:gap-4 sm:p-4"
                >
                  <span className="w-6 shrink-0 text-center font-display text-lg font-semibold tabular-nums text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-20 sm:w-16">
                    <SmartImage
                      src={productPrimaryImage(product)}
                      alt={name}
                      fill
                      sizes="64px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {product.category?.name ?? "Aether"}
                    </span>
                    <span className="mt-0.5 block truncate font-display text-sm font-semibold sm:text-base">
                      {name}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground">
                      {product.soldCount > 0
                        ? `${product.soldCount} sold`
                        : `${product.stock} in stock`}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <Price amount={product.finalPrice} size="sm" />
                    <ArrowUpRight
                      className="ml-auto mt-1 h-3.5 w-3.5 text-muted-foreground transition group-hover:text-foreground"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
