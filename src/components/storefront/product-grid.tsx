import Link from "next/link";
import { PackageSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

import { ProductCard } from "./product-card";

export function ProductGrid({
  products,
  className,
  priorityCount = 0,
  emptyTitle = "Nothing here yet",
  emptyDescription = "Try a different filter or browse the full collection.",
}: {
  products: Product[];
  className?: string;
  priorityCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title={emptyTitle}
        description={emptyDescription}
        action={
          <Button asChild>
            <Link href="/products">Browse the collection</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
