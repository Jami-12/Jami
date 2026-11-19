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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-primary-500 dark:text-primary">
            Shop by category
          </p>
          <h2
            id="categories-heading"
            className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl"
          >
            Find your next everyday piece.
          </h2>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline dark:text-primary"
        >
          All pieces
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((category, index) => {
          const image = category.image ?? FALLBACKS[index % FALLBACKS.length];
          const blurb =
            category.description ??
            "Considered pieces for the way you actually dress.";

          return (
            <Link
              key={category.id}
              href={`/products?category=${encodeURIComponent(category.slug)}`}
              className="group relative flex min-h-56 overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift sm:min-h-64"
            >
              <SmartImage
                src={image}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
              <span className="relative mt-auto flex w-full items-end justify-between gap-3 p-5">
                <span>
                  <span className="block font-display text-xl font-semibold tracking-tight text-white">
                    {category.name}
                  </span>
                  <span className="mt-1 block max-w-[18rem] text-xs leading-relaxed text-white/75">
                    {blurb}
                  </span>
                  <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-primary-200">
                    {category.productCount} piece{category.productCount === 1 ? "" : "s"}
                  </span>
                </span>
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition group-hover:bg-primary group-hover:text-primary-foreground">
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
