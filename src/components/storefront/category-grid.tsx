import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { SmartImage } from "@/components/ui/smart-image";
import { CATEGORY_VISUALS, VISUALS } from "@/data/visuals";
import type { Category } from "@/types";

const FALLBACKS = [
  VISUALS.audio,
  VISUALS.lighting,
  VISUALS.workspace,
  VISUALS.home,
  VISUALS.watch,
  VISUALS.bag,
];

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const items = categories.slice(0, 6);

  if (items.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="categories-heading" className="container-page py-14 sm:py-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-500 dark:text-accent-300">
            Shop by room
          </p>
          <h2 id="categories-heading" className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Six ways into the collection
          </h2>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline dark:text-accent-300"
        >
          All objects
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((category, index) => {
          const visual = CATEGORY_VISUALS[category.slug];
          const image = category.image ?? visual?.image ?? FALLBACKS[index % FALLBACKS.length];
          const blurb =
            category.description ??
            visual?.blurb ??
            "Considered objects for the way you actually live.";

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
              <span className="absolute inset-0 bg-gradient-to-t from-primary-950/90 via-primary-950/35 to-primary-950/5" />
              <span className="relative mt-auto flex w-full items-end justify-between gap-3 p-5">
                <span>
                  <span className="block text-lg font-extrabold tracking-tight text-white">
                    {category.name}
                  </span>
                  <span className="mt-1 block max-w-[18rem] text-xs leading-relaxed text-white/75">
                    {blurb}
                  </span>
                  <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-accent-200">
                    {category.productCount} object{category.productCount === 1 ? "" : "s"}
                  </span>
                </span>
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition group-hover:bg-accent-300 group-hover:text-[#082f49]">
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
