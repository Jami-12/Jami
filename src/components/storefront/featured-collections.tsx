import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

const EDITORIAL = [
  {
    image: "/showcase/editorial-tee.webp",
    eyebrow: "The essentials",
    title: "Softened cotton, cut clean",
    copy: "Tees and shirting with a little more room to breathe — the pieces that anchor everything else.",
    href: "/products?sort=newest",
  },
  {
    image: "/showcase/editorial-rust.webp",
    eyebrow: "Outerwear",
    title: "A study in warm rust",
    copy: "Overshirts and light layers in clay, rust and camel. Made to be thrown on and lived in.",
    href: "/products?sort=popular",
  },
  {
    image: "/showcase/editorial-wine.webp",
    eyebrow: "Knitwear",
    title: "The wine-toned knit",
    copy: "Dense, soft and quiet. A single deep colour worn against neutral tailoring.",
    href: "/products?sort=popular",
  },
] as const;

export function FeaturedCollections({ categories }: { categories: Category[] }) {
  const items = EDITORIAL.map((item, index) => {
    const category = categories[index];
    return {
      ...item,
      href: category
        ? `/products?category=${encodeURIComponent(category.slug)}`
        : item.href,
      label: category?.name ?? item.eyebrow,
    };
  });

  return (
    <section
      id="collections"
      aria-labelledby="collections-heading"
      className="container-page scroll-mt-24 py-14 sm:py-20"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow text-primary-500 dark:text-primary">
            Featured collections
          </p>
          <h2
            id="collections-heading"
            className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl"
          >
            Three ways to wear the season.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Small, deliberate edits — each one built around a single mood rather
            than a trend cycle.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:underline dark:text-primary"
        >
          All collections
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {items.map((item, index) => (
          <Link
            key={item.title}
            href={item.href}
            className={cn(
              "group relative flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-2xl border border-border bg-muted shadow-soft transition-shadow hover:shadow-lift sm:min-h-[26rem]",
              index === 1 && "md:mt-8",
              index === 2 && "md:mt-4",
            )}
          >
            <SmartImage
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-105"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent"
            />
            <div className="relative p-5 text-white sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary-200">
                {item.label}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">
                {item.title}
              </h3>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-white/75">
                {item.copy}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                Explore the edit
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
