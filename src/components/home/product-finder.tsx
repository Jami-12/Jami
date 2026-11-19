"use client";

import * as React from "react";
import {
  ArrowRight,
  PackageSearch,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { ProductCard } from "@/components/storefront/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Label, Select } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs } from "@/components/ui/tabs";
import type { Product } from "@/types";
import { productName } from "@/types";

const PAGE_SIZE = 8;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export function ProductFinder({ products }: { products: Product[] }) {
  const [keyword, setKeyword] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [sort, setSort] = React.useState<SortValue>("newest");
  const [inStockOnly, setInStockOnly] = React.useState(false);
  const [featuredOnly, setFeaturedOnly] = React.useState(false);
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);

  const categoryTabs = React.useMemo(() => {
    const grouped = new Map<string, { name: string; count: number }>();

    for (const product of products) {
      const slug = product.category?.slug;
      if (!slug) continue;

      const current = grouped.get(slug);
      grouped.set(slug, {
        name: product.category?.name ?? "Collection",
        count: (current?.count ?? 0) + 1,
      });
    }

    return [
      { value: "all", label: "All products", count: products.length },
      ...Array.from(grouped.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([slug, value]) => ({
          value: slug,
          label: value.name,
          count: value.count,
        })),
    ];
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    const query = keyword.trim().toLowerCase();

    const result = products.filter((product) => {
      if (category !== "all" && product.category?.slug !== category) {
        return false;
      }
      if (
        query &&
        !`${productName(product)} ${product.category?.name ?? ""} ${product.brand?.name ?? ""}`
          .toLowerCase()
          .includes(query)
      ) {
        return false;
      }
      if (inStockOnly && (product.stock <= 0 || product.status === "OUT_OF_STOCK")) {
        return false;
      }
      if (featuredOnly && !product.isFeatured) {
        return false;
      }
      return true;
    });

    return result.sort((left, right) => {
      if (sort === "price-asc") return left.finalPrice - right.finalPrice;
      if (sort === "price-desc") return right.finalPrice - left.finalPrice;
      return (
        (Date.parse(right.createdAt) || 0) - (Date.parse(left.createdAt) || 0)
      );
    });
  }, [products, keyword, category, sort, inStockOnly, featuredOnly]);

  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [keyword, category, sort, inStockOnly, featuredOnly]);

  const hasFilters =
    keyword.trim().length > 0 ||
    category !== "all" ||
    sort !== "newest" ||
    inStockOnly ||
    featuredOnly;

  const resetFilters = React.useCallback(() => {
    setKeyword("");
    setCategory("all");
    setSort("newest");
    setInStockOnly(false);
    setFeaturedOnly(false);
  }, []);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  return (
    <section
      id="product-finder"
      aria-labelledby="product-finder-heading"
      className="container-page scroll-mt-24 py-14 sm:py-20"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Product finder</p>
          <h2
            id="product-finder-heading"
            className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Find your next favourite.
          </h2>
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Search the edit, narrow it by category and arrange the results the
            way that suits you.
          </p>
        </div>
        <Badge tone="accent" className="w-fit">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          {products.length} pieces to explore
        </Badge>
      </div>

      <div className="mt-8 rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Search by name, brand or category"
              aria-label="Search products"
              className="pl-10 pr-10"
            />
            {keyword ? (
              <button
                type="button"
                onClick={() => setKeyword("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <Tabs
              items={categoryTabs}
              value={category}
              onChange={setCategory}
              className="w-full"
            />
          </div>
        </div>

        <Separator className="my-5" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <label
              htmlFor="finder-in-stock"
              className="flex cursor-pointer items-center gap-2 text-sm font-medium"
            >
              <Switch
                id="finder-in-stock"
                checked={inStockOnly}
                onCheckedChange={setInStockOnly}
              />
              In stock only
            </label>
            <label
              htmlFor="finder-featured"
              className="flex cursor-pointer items-center gap-2 text-sm font-medium"
            >
              <Switch
                id="finder-featured"
                checked={featuredOnly}
                onCheckedChange={setFeaturedOnly}
              />
              Featured only
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hasFilters ? (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Reset filters
              </Button>
            ) : null}
            <div className="w-full sm:w-52">
              <Label htmlFor="finder-sort" className="mb-1">
                Sort by
              </Label>
              <Select
                id="finder-sort"
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as SortValue)
                }
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 mt-7 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {filteredProducts.length}
          </span>{" "}
          {filteredProducts.length === 1 ? "piece" : "pieces"}
        </p>
      </div>

      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="Nothing matches just yet"
          description="Try a different keyword, category or filter to see more of the collection."
          action={
            <Button onClick={resetFilters} disabled={!hasFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {visibleCount < filteredProducts.length ? (
            <div className="mt-10 flex flex-col items-center gap-3">
              <p className="text-xs text-muted-foreground">
                Showing {visibleProducts.length} of {filteredProducts.length}
              </p>
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  setVisibleCount((current) => current + PAGE_SIZE)
                }
              >
                Load more
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
