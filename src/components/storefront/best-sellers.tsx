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
      className="border-y border-border bg-background"
    >
      <div className="container-page grid gap-8 py-14 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow text-muted-foreground">
            Best sellers
          </p>
          <h2
            id="bestsellers-heading"
            className="mt-2 font-display text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl"
          >
            The pieces
            <span className="block not-italic text-foreground">
              that keep selling out.
            </span>
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Ranked by what customers actually bought this season — not by what
            we hoped they would.
          </p>
          <Link
            href="/products?sort=popular"
            className="-mx-1 mt-5 inline-flex items-center gap-1.5 px-1 py-0.5 text-sm font-bold text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Shop all bestsellers
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <ol className="divide-y divide-border rounded-none border border-border bg-card">
          {items.map((product, index) => {
            const name = productName(product);
            return (
              <li key={product.id}>
                <Link
                  href={`/products/${product.slug}`}
                  className="group flex items-center gap-3 p-3 transition-colors hover:bg-foreground hover:text-background sm:gap-4 sm:p-4"
                >
                  <span className="w-6 shrink-0 text-center font-display text-lg font-semibold tabular-nums text-muted-foreground group-hover:text-background/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-none bg-muted sm:h-20 sm:w-16">
                    <SmartImage
                      src={productPrimaryImage(product)}
                      alt={name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground group-hover:text-background/70">
                      {product.category?.name ?? "Collection"}
                    </span>
                    <span className="mt-0.5 block truncate font-display text-sm font-semibold sm:text-base">
                      {name}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground group-hover:text-background/70">
                      {product.soldCount > 0
                        ? `${product.soldCount} sold`
                        : `${product.stock} in stock`}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <Price amount={product.finalPrice} size="sm" className="group-hover:text-background" />
                    <ArrowUpRight
                      className="ml-auto mt-1 h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-background"
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
