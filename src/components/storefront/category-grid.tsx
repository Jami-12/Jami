import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { SmartImage } from "@/components/ui/smart-image";
import type { Category } from "@/types";

const FALLBACKS = [
  "/showcase/rail-tee-1.webp",
  "/showcase/rail-rust-1.webp",
  "/showcase/rail-wine-1.webp",
  "/showcase/editorial-tee.webp",
  "/showcase/editorial-rust.webp",
  "/showcase/editorial-wine.webp",
];

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const items = categories.slice(0, 6);

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      id="categories"
      aria-labelledby="categories-heading"
      className="container-page scroll-mt-24 py-14 sm:py-20"
    >
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-muted-foreground">
            Shop by category
          </p>
          <h2
            id="categories-heading"
            className="mt-2 font-display text-3xl font-semibold not-italic tracking-tight sm:text-4xl"
          >
            Find your next everyday piece.
          </h2>
        </div>
        <Link
          href="/products"
          className="inline-flex w-fit items-center gap-2 border border-border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
        >
          All pieces
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((category, index) => {
          const image = category.image ?? FALLBACKS[index % FALLBACKS.length];
          const blurb =
            category.description ??
 "Considered pieces for the way you actually dress.";

          return (
            <Link
              key={category.id}
              href={`/products?category=${encodeURIComponent(category.slug)}`}
              className="group relative block min-h-56 overflow-hidden border border-border bg-card outline-none transition-colors hover:border-foreground focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-64"
            >
              <SmartImage
                src={image}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 border-t border-border bg-foreground p-4 text-background sm:p-5">
                <span className="min-w-0">
                  <span className="block font-display text-xl font-semibold not-italic leading-tight tracking-tight">
                    {category.name}
                  </span>
                  <span className="mt-1 block max-w-[18rem] text-xs leading-relaxed text-background/70">
                    {blurb}
                  </span>
                  <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-background/60">
                    {category.productCount} piece{category.productCount === 1 ? "" : "s"}
                  </span>
                </span>
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-background/40 text-background transition-colors group-hover:bg-background group-hover:text-foreground">
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
