import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductGrid } from "@/components/storefront/product-grid";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Product } from "@/types";

export function NewArrivals({ products }: { products: Product[] }) {
  return (
    <section
      id="new-arrivals"
      className="container-page scroll-mt-24 py-14 sm:py-20"
    >
      <SectionHeading
        eyebrow="New arrivals"
        title="Just off the rail."
        description="The most recent pieces to reach the studio, photographed on the hanger and close up."
        action={
          <Button asChild variant="outline">
            <Link href="/products?sort=newest">
              View all new
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        }
      />
      <ProductGrid
        products={products}
        className="mt-8"
        priorityCount={2}
        emptyTitle="The next drop is being prepared"
        emptyDescription="New pieces are on their way. Browse the full collection meanwhile."
      />
    </section>
  );
}
