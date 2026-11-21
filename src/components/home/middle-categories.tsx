import Link from "next/link";
import {
  ArrowUpRight,
  Armchair,
  Camera,
  Gift,
  Headphones,
  Home,
  LayoutGrid,
  Package,
  Palette,
  Shirt,
  Sparkles,
  Watch,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Category } from "@/types";

const CATEGORY_ICONS: LucideIcon[] = [
  Shirt,
  Armchair,
  Sparkles,
  Gift,
  Watch,
  Palette,
  Package,
  Headphones,
  Camera,
  Home,
];

/**
 * Centred all-categories showcase. This is the canonical implementation for
 * the `showMiddleCategories` home section.
 */
export function MiddleCategories({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section
      id="all-categories"
      aria-label="All categories"
      className="container-page scroll-mt-24 py-14 sm:py-20"
    >
      <div className="flex items-center justify-center gap-3">
        <span className="h-px w-8 bg-foreground" aria-hidden="true" />
        <p className="eyebrow text-muted-foreground">
          <LayoutGrid className="mr-1.5 inline h-3 w-3" aria-hidden="true" />
          All categories
        </p>
        <span className="h-px w-8 bg-foreground" aria-hidden="true" />
      </div>

      <div className="mt-6 border-b border-border pb-8 text-center">
        <SectionHeading
          align="center"
          title="Explore every corner."
          description="From the first piece in the room to the finishing touch, start wherever catches your eye."
        />
      </div>

      <div className="mt-9 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {categories.map((category, index) => {
          const Icon = CATEGORY_ICONS[index % CATEGORY_ICONS.length] ?? Package;

          return (
            <Card
              key={category.id}
              className="border-0 bg-background transition-colors hover:bg-foreground"
            >
              <Link
                href={`/products?category=${encodeURIComponent(category.slug)}`}
                className="group flex h-full flex-col items-center gap-4 p-4 text-center outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-inset sm:p-5"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center border border-border bg-muted text-foreground transition-colors group-hover:border-background/40 group-hover:bg-background group-hover:text-foreground">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="flex flex-1 items-center text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-background">
                  {category.name}
                </span>
                <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors group-hover:text-background/70">
                  <span>
                    {category.productCount}{" "}
                    {category.productCount === 1 ? "piece" : "pieces"}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
