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

import { Badge } from "@/components/ui/badge";
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

export function AllCategoriesSection({
  categories,
}: {
  categories: Category[];
}) {
  if (categories.length === 0) return null;

  return (
    <section
      id="all-categories"
      aria-label="All categories"
      className="container-page scroll-mt-24 py-14 sm:py-20"
    >
      <div className="flex justify-center">
        <Badge tone="accent">
          <LayoutGrid className="h-3 w-3" aria-hidden="true" />
          All categories
        </Badge>
      </div>

      <div className="mt-5 text-center">
        <SectionHeading
          align="center"
          title="Explore every corner."
          description="From the first piece in the room to the finishing touch, start wherever catches your eye."
        />
      </div>

      <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 xl:grid-cols-6">
        {categories.map((category, index) => {
          const Icon = CATEGORY_ICONS[index % CATEGORY_ICONS.length] ?? Package;

          return (
            <Card key={category.id} className="transition hover:shadow-lift">
              <Link
                href={`/products?category=${encodeURIComponent(category.slug)}`}
                className="group flex h-full flex-col items-center gap-3 p-4 text-center sm:p-5"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-primary-600 transition-transform duration-500 group-hover:rotate-6 dark:text-accent-300">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="flex flex-1 items-center text-sm font-semibold leading-snug transition-colors group-hover:text-primary-600 dark:group-hover:text-accent-300">
                  {category.name}
                </span>
                <span className="flex items-center gap-2">
                  <Badge tone="neutral">
                    {category.productCount}{" "}
                    {category.productCount === 1 ? "piece" : "pieces"}
                  </Badge>
                  <ArrowUpRight
                    className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
