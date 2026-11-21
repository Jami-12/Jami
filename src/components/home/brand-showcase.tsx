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
        className="border-b border-border pb-6"
        action={
          <Link
            href="/products"
            className="inline-flex items-center gap-2 border border-border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
          >
            View the full roster
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />

      <h2 id="brands-heading" className="sr-only">
        Shop by brand
      </h2>

      <ul className="mt-8 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-3 xl:grid-cols-4">
        {items.map((brand) => (
          <li key={brand.id} className="min-w-0">
            <Card className="group h-full border-0 bg-background">
              <Link
                href={`/products?brand=${encodeURIComponent(brand.slug)}`}
                className="flex h-full flex-col gap-4 p-5 outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-inset"
              >
                <span className="relative flex h-16 items-center justify-center overflow-hidden border border-border bg-muted">
                  {brand.logo ? (
                    <SmartImage
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      sizes="(max-width: 768px) 45vw, 20vw"
                      className="object-contain p-3"
                    />
                  ) : (
                    <span className="font-display text-lg font-semibold tracking-[0.18em] text-foreground">
                      {brand.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="flex flex-1 items-end justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold tracking-tight text-foreground">
                      {brand.name}
                    </span>
                    <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {brand.productCount} piece{brand.productCount === 1 ? "" : "s"}
                    </span>
                  </span>
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-border text-muted-foreground transition-colors group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
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
