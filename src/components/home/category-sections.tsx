import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductGrid } from "@/components/storefront/product-grid";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Product } from "@/types";

/**
 * Settings-driven product row for a single category.
 * This is the canonical implementation consumed by the home page.
 */
export function CategorySections({
  title,
  slug,
  description,
  products,
}: {
  title: string;
  slug: string;
  description?: string | null;
  products: Product[];
}) {
  return (
    <section
      id={`category-${slug}`}
      aria-label={title}
      className="container-page scroll-mt-24 py-14 sm:py-20"
    >
      <SectionHeading
        eyebrow="Collection"
        title={title}
        description={description ?? undefined}
        className="border-b border-border pb-6"
        action={
          <Button
            asChild
            variant="outline"
            className="border-border bg-background text-foreground hover:border-foreground hover:bg-foreground hover:text-background"
          >
            <Link href={`/products?category=${encodeURIComponent(slug)}`}>
              View all in category
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <ProductGrid
        products={products}
        className="mt-8"
        emptyTitle="This collection is being refreshed"
        emptyDescription="New pieces are on their way. Browse the full catalogue in the meantime."
      />
    </section>
  );
}
