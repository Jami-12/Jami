"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/storefront/product-card";
import { useHydrated } from "@/hooks/use-hydrated";
import { queryKeys } from "@/lib/query-keys";
import { fetchProductsByIds } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { Product } from "@/types";

/**
 * Batched, order-preserving product lookup shared by the wishlist and the
 * recently-viewed rail. Each result also seeds the canonical `["products",
 * id]` detail key so product pages and cards reuse the same cached data.
 */
export function useProductsByIds(ids: string[]) {
  const queryClient = useQueryClient();
  const idsKey = ids.join("|");
  const uniqueIds = React.useMemo(
    () => (idsKey ? Array.from(new Set(idsKey.split("|"))) : []),
    [idsKey],
  );

  return useQuery({
    queryKey: ["products", "by-ids", uniqueIds] as const,
    queryFn: async () => {
      const products = await fetchProductsByIds(uniqueIds);
      const byId = new Map<string, Product>();

      for (const product of products) {
        byId.set(product.id, product);
        queryClient.setQueryData(queryKeys.products.detail(product.id), product);
      }

      return uniqueIds
        .map((id) => byId.get(id))
        .filter((product): product is Product => Boolean(product));
    },
    enabled: uniqueIds.length > 0,
    staleTime: 60_000,
    retry: 0,
  });
}

export function WishlistView() {
  const hydrated = useHydrated();
  const ids = useWishlistStore((state) => state.ids);
  const reset = useWishlistStore((state) => state.reset);
  const [confirmClear, setConfirmClear] = React.useState(false);

  const { isLoading, data } = useProductsByIds(ids);
  const loading = isLoading;
  const products = data ?? [];

  if (!hydrated) {
    return (
      <div className="grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
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
        description="Save pieces you are considering. They stay here across visits, and sync to your account when you sign in."
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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {products.length} saved piece{products.length === 1 ? "" : "s"}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="border border-border text-muted-foreground hover:border-foreground hover:bg-foreground hover:text-background"
          onClick={() => setConfirmClear(true)}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Clear wishlist
        </Button>
      </div>

      {loading && products.length === 0 ? (
        <div className="grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
          {ids.slice(0, 8).map((id) => (
            <ProductCardSkeleton key={id} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Saved pieces are no longer available"
          description="Some items in your wishlist have been removed from the catalogue. Clear them and save something new."
          action={
            <Button asChild>
              <Link href="/products">Explore the collection</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
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
        description="Every saved piece will be removed from this list. Your bag is not affected."
        confirmLabel="Clear wishlist"
        destructive
      />
    </div>
  );
}
