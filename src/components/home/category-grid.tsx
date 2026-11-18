
"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  Layers,
  PackageSearch,
  Sparkles,
} from "lucide-react";

import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { productsApi } from "@/lib/api/services";
import type { Category } from "@/types";

const PREVIEW_LIMIT = 4;

export function CategoryGrid({
  categories,
}: {
  categories: Category[];
}) {
  const items = React.useMemo(
    () =>
      categories
        .filter((category) => category.productCount > 0)
        .slice(0, 6),
    [categories],
  );

  const [active, setActive] = React.useState(items[0]?.slug ?? "");

  React.useEffect(() => {
    if (!items.length) return;

    setActive((current) =>
      items.some((category) => category.slug === current)
        ? current
        : (items[0]?.slug ?? ""),
    );
  }, [items]);

  const activeCategory = items.find(
    (category) => category.slug === active,
  );

  const products = useQuery({
    queryKey: ["storefront", "category-preview", active],
    queryFn: () =>
      productsApi.list({
        category: active,
        inStock: true,
        limit: PREVIEW_LIMIT,
        sortBy: "soldCount",
        sortOrder: "desc",
      }),
    enabled: Boolean(active),
    staleTime: 60_000,
  });

  if (!items.length) return null;

  const tabs = items.map((category) => ({
    value: category.slug,
    label: category.name,
    count: category.productCount,
  }));

  const preview = products.data?.items.slice(0, PREVIEW_LIMIT) ?? [];

  return (
    <section
      id="shop-by-category"
      aria-labelledby="shop-by-category-heading"
      className="scroll-mt-24 py-14 sm:py-20"
    >
      <div className="container-page">
        {/* Header */}
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#B18A48]">
              <Sparkles className="h-4 w-4" />
              Curated Collections
            </div>

            <h2
              id="shop-by-category-heading"
              className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              Explore Our{" "}
              <span className="text-[#B18A48]">Collections</span>
            </h2>

            <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              Discover thoughtfully selected pieces made to
              complement your everyday style.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="group h-10 w-fit rounded-full border-border px-5"
          >
            <Link href="/products">
              View All Products
              <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>

        {/* Category navigation */}
        <div className="mb-8 border-y border-border/70 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Layers className="h-4 w-4 text-[#B18A48]" />
              Shop by category
            </div>

            <div className="min-w-0 overflow-x-auto scrollbar-none">
              <Tabs
                items={tabs}
                value={active}
                onChange={setActive}
              />
            </div>
          </div>

          {activeCategory && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {activeCategory.name}
                </span>{" "}
                collection
              </p>

              <Link
                href={`/products?category=${encodeURIComponent(activeCategory.slug)}`}
                className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#B18A48] transition-colors hover:text-foreground"
              >
                Explore
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>

        {/* Products */}
        <div>
          {products.isPending ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: PREVIEW_LIMIT }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : products.isError ? (
            <div className="rounded-2xl border border-border px-5 py-12 text-center">
              <EmptyState
                icon={PackageSearch}
                title="This collection is temporarily unavailable"
                description="We could not load these products right now. Please try again."
                action={
                  <Button
                    onClick={() => products.refetch()}
                    disabled={products.isFetching}
                  >
                    {products.isFetching ? "Retrying..." : "Try Again"}
                  </Button>
                }
              />
            </div>
          ) : preview.length === 0 ? (
            <div className="rounded-2xl border border-border px-5 py-12 text-center">
              <EmptyState
                icon={PackageSearch}
                title="Nothing in this collection yet"
                description="New pieces are on their way. Explore our full catalog meanwhile."
                action={
                  <Button asChild>
                    <Link href="/products">Browse Everything</Link>
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
              {preview.map((product, index) => (
                <div
                  key={product.id}
                  className="min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!products.isPending &&
          !products.isError &&
          preview.length > 0 && (
            <div className="mt-10 flex justify-center">
              <Button
                asChild
                variant="outline"
                className="group h-11 rounded-full px-7"
              >
                <Link
                  href={
                    activeCategory
                      ? `/products?category=${encodeURIComponent(activeCategory.slug)}`
                      : "/products"
                  }
                >
                  Discover More
                  <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>
          )}
      </div>
    </section>
  );
}
