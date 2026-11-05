"use client";

import * as React from "react";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/storefront/product-card";
import { useHydrated } from "@/hooks/use-hydrated";
import { productsApi } from "@/lib/api/services";
import { useWishlistStore } from "@/stores/wishlist-store";

export function WishlistView() {
  const hydrated = useHydrated();
  const ids = useWishlistStore((state) => state.ids);
  const reset = useWishlistStore((state) => state.reset);
  const [confirmClear, setConfirmClear] = React.useState(false);

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["wishlist-product", id],
      queryFn: () => productsApi.get(id),
      staleTime: 60_000,
      retry: 0,
    })),
  });

  const loading = queries.some((query) => query.isLoading);
  const products = queries
    .map((query) => query.data)
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  if (!hydrated) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (ids.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Save objects you are considering. They stay here across visits, and sync to your account when you sign in."
        action={
          <Button asChild>
            <Link href="/products">Browse the collection</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {products.length} saved object{products.length === 1 ? "" : "s"}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-red-600"
          onClick={() => setConfirmClear(true)}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Clear wishlist
        </Button>
      </div>

      {loading && products.length === 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {ids.slice(0, 8).map((id) => (
            <ProductCardSkeleton key={id} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Saved objects are no longer available"
          description="Some items in your wishlist have been removed from the catalogue. Clear them and save something new."
          action={
            <Button asChild>
              <Link href="/products">Explore the collection</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          reset();
          setConfirmClear(false);
        }}
        title="Clear your wishlist?"
        description="Every saved object will be removed from this list. Your bag is not affected."
        confirmLabel="Clear wishlist"
        destructive
      />
    </div>
  );
}
