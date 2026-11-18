
"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Heart,
  ShoppingBag,
  Eye,
  X,
  PackageSearch,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { SmartImage } from "@/components/ui/smart-image";
import type { Product } from "@/types";
import { productName, productPrimaryImage } from "@/types";
import { cn } from "@/lib/utils";

type Props = {
  products: Product[];
};

type SortOption = "newest" | "low" | "high";

export function HeroBanner({ products }: Props) {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("All");
  const [sort, setSort] = React.useState<SortOption>("newest");
  const [showFilters, setShowFilters] = React.useState(false);
  const [featuredOnly, setFeaturedOnly] = React.useState(false);
  const [inStockOnly, setInStockOnly] = React.useState(false);
  const [visibleCount, setVisibleCount] = React.useState(12);

  const categories = React.useMemo(() => {
    const unique = Array.from(
      new Set(
        products
          .map((product) => product.category?.name)
          .filter((name): name is string => Boolean(name)),
      ),
    );

    return ["All", ...unique];
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    let result = [...products];

    if (category !== "All") {
      result = result.filter(
        (product) => product.category?.name === category,
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((product) => {
        const name = productName(product).toLowerCase();
        const categoryName =
          product.category?.name?.toLowerCase() ?? "";

        return (
          name.includes(query) ||
          categoryName.includes(query)
        );
      });
    }

    if (featuredOnly) {
      result = result.filter((product) => product.isFeatured);
    }

    if (inStockOnly) {
      result = result.filter((product) => {
        const stock = product.stock;
        return typeof stock === "number" && stock > 0;
      });
    }

    if (sort === "low") {
      result.sort((a, b) => a.finalPrice - b.finalPrice);
    } else if (sort === "high") {
      result.sort((a, b) => b.finalPrice - a.finalPrice);
    }

    return result;
  }, [
    products,
    category,
    search,
    sort,
    featuredOnly,
    inStockOnly,
  ]);

  React.useEffect(() => {
    setVisibleCount(12);
  }, [category, search, sort, featuredOnly, inStockOnly]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  return (
    <section className="container-page pb-16 pt-8">

      {/* TOP HEADING */}
      <div className="mb-8 flex flex-col justify-between gap-5 border-b border-black/10 pb-7 sm:flex-row sm:items-end">

        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#E65B35]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E65B35]">
              THE COLLECTION
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl">
            Discover Our Collection
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Find something that matches your style.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <PackageSearch className="h-4 w-4" />
          <span>
            <strong className="text-[#171717]">
              {filteredProducts.length}
            </strong>{" "}
            Products Available
          </span>
        </div>

      </div>

      {/* SEARCH + SORT */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="h-12 w-full border border-black/10 bg-white pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-[#E65B35]"
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "h-12 rounded-none border-black/10 px-4 text-xs font-semibold uppercase tracking-wider",
              showFilters && "border-[#E65B35] text-[#E65B35]",
            )}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>

          <div className="relative flex h-12 items-center border border-black/10 bg-white px-3">
            <ArrowUpDown className="mr-2 h-4 w-4 text-gray-500" />

            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value as SortOption)
              }
              className="h-full bg-transparent text-xs font-semibold outline-none"
              aria-label="Sort products"
            >
              <option value="newest">Newest First</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </div>

        </div>
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="mb-6 flex flex-wrap items-center gap-5 border border-black/10 bg-white p-5">

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
              className="accent-[#E65B35]"
            />
            Featured Products
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-[#E65B35]"
            />
            In Stock Only
          </label>

          <button
            onClick={() => {
              setFeaturedOnly(false);
              setInStockOnly(false);
              setCategory("All");
              setSearch("");
              setSort("newest");
            }}
            className="text-xs font-bold uppercase tracking-wider text-[#E65B35]"
          >
            Reset Filters
          </button>

        </div>
      )}

      {/* CATEGORY NAVIGATION */}
      <div className="mb-8 overflow-x-auto border-b border-black/10">
        <div className="flex min-w-max items-center gap-7">

          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={cn(
                "relative pb-4 text-xs font-bold uppercase tracking-wider transition-colors",
                category === item
                  ? "text-[#E65B35]"
                  : "text-gray-400 hover:text-black",
              )}
            >
              {item}

              {category === item && (
                <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#E65B35]" />
              )}
            </button>
          ))}

        </div>
      </div>

      {/* PRODUCT GRID */}
      {visibleProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

            {visibleProducts.map((product) => {
              const image = productPrimaryImage(product);
              const name = productName(product);

              return (
                <article
                  key={product.id}
                  className="group min-w-0"
                >

                  {/* PRODUCT IMAGE */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#F1F0ED]">

                    <Link
                      href={`/products/${product.slug}`}
                      className="absolute inset-0 z-0"
                      aria-label={`View ${name}`}
                    >
                      {image && (
                        <SmartImage
                          src={image}
                          alt={name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      )}
                    </Link>

                    {/* BADGES */}
                    <div className="absolute left-2 top-2 z-10 flex flex-col gap-1.5 sm:left-3 sm:top-3">

                      {product.isFeatured && (
                        <Badge className="rounded-none bg-[#171717] px-2 py-1 text-[9px] uppercase tracking-wider text-white hover:bg-[#171717]">
                          Featured
                        </Badge>
                      )}

                      {product.originalPrice > product.finalPrice && (
                        <Badge className="rounded-none bg-[#E65B35] px-2 py-1 text-[9px] uppercase tracking-wider text-white hover:bg-[#E65B35]">
                          Sale
                        </Badge>
                      )}

                    </div>

                    {/* WISHLIST */}
                    <button
                      type="button"
                      aria-label={`Add ${name} to wishlist`}
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent("wishlist:add", {
                            detail: product,
                          }),
                        );
                      }}
                      className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#171717] shadow-sm transition-all hover:bg-[#E65B35] hover:text-white sm:right-3 sm:top-3"
                    >
                      <Heart className="h-4 w-4" />
                    </button>

                    {/* QUICK ACTIONS */}
                    <div className="absolute inset-x-2 bottom-2 z-10 hidden translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:block sm:inset-x-3 sm:bottom-3">

                      <Link
                        href={`/products/${product.slug}`}
                        className="flex h-10 items-center justify-center gap-2 bg-white text-[10px] font-bold uppercase tracking-widest text-[#171717] shadow-lg transition-colors hover:bg-[#E65B35] hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                        View Product
                      </Link>

                    </div>

                  </div>

                  {/* PRODUCT INFORMATION */}
                  <div className="pt-3">

                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                        {product.category?.name ?? "Collection"}
                      </span>

                      <span className="shrink-0 text-[9px] font-medium uppercase text-gray-400">
                        {product.stock > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>

                    <Link
                      href={`/products/${product.slug}`}
                      className="block truncate text-sm font-semibold text-[#171717] transition-colors hover:text-[#E65B35] sm:text-base"
                    >
                      {name}
                    </Link>

                    <div className="mt-2">
                      <Price
                        amount={product.finalPrice}
                        compareAt={
                          product.originalPrice > product.finalPrice
                            ? product.originalPrice
                            : undefined
                        }
                        size="sm"
                        className="font-semibold text-[#171717]"
                      />
                    </div>

                    <Link
                      href={`/products/${product.slug}`}
                      className="mt-3 flex h-10 w-full items-center justify-center gap-2 border border-black/10 text-[10px] font-bold uppercase tracking-widest text-[#171717] transition-all hover:border-[#E65B35] hover:bg-[#E65B35] hover:text-white sm:hidden"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      View Product
                    </Link>

                  </div>

                </article>
              );
            })}

          </div>

          {/* LOAD MORE */}
          {visibleCount < filteredProducts.length && (
            <div className="mt-14 flex flex-col items-center gap-3">

              <p className="text-xs text-gray-400">
                Showing {visibleProducts.length} of {filteredProducts.length} products
              </p>

              <Button
                onClick={() =>
                  setVisibleCount((prev) => prev + 12)
                }
                className="h-12 rounded-none bg-[#171717] px-10 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#E65B35]"
              >
                Load More Products
              </Button>

            </div>
          )}

        </>
      ) : (
        /* EMPTY STATE */
        <div className="flex min-h-[350px] flex-col items-center justify-center border border-dashed border-black/15 bg-[#F8F8F6] px-5 text-center">

          <PackageSearch className="mb-5 h-12 w-12 text-gray-300" />

          <h3 className="text-xl font-bold text-[#171717]">
            No Products Found
          </h3>

          <p className="mt-2 max-w-sm text-sm text-gray-500">
            We could not find any products matching your search. Try another category or keyword.
          </p>

          <Button
            onClick={() => {
              setSearch("");
              setCategory("All");
              setFeaturedOnly(false);
              setInStockOnly(false);
            }}
            className="mt-6 rounded-none bg-[#E65B35] px-7 text-white hover:bg-[#171717]"
          >
            Clear Filters
          </Button>

        </div>
      )}

    </section>
  );
}
