import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { SmartImage } from "@/components/ui/smart-image";
import type { Brand } from "@/types";

export function BrandShowcase({ brands }: { brands: Brand[] }) {
  const items = brands.slice(0, 8);

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      id="brands"
      aria-labelledby="brands-heading"
      className="container-page scroll-mt-24 py-14 sm:py-20"
    >
      <SectionHeading
        eyebrow="Shop by brand"
        title="The makers we keep."
        description="A small roster of studios and labels selected for materials, fit and how their pieces age."
        action={
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline dark:text-accent-300"
          >
            View the full roster
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />

      <h2 id="brands-heading" className="sr-only">
        Shop by brand
      </h2>

      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {items.map((brand) => (
          <li key={brand.id}>
            <Card className="group h-full">
              <Link
                href={`/products?brand=${encodeURIComponent(brand.slug)}`}
                className="flex h-full flex-col gap-4 p-5"
              >
                <span className="relative flex h-16 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/60">
                  {brand.logo ? (
                    <SmartImage
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      sizes="(max-width: 768px) 45vw, 20vw"
                      className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="font-display text-lg font-semibold tracking-[0.18em] text-primary dark:text-accent-300">
                      {brand.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="flex flex-1 items-end justify-between gap-2">
                  <span>
                    <span className="block text-sm font-semibold tracking-tight transition-colors group-hover:text-primary dark:group-hover:text-accent-300">
                      {brand.name}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {brand.productCount} piece{brand.productCount === 1 ? "" : "s"}
                    </span>
                  </span>
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </span>
              </Link>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
