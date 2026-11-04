import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PackageSearch } from "lucide-react";

import { ProductFilters } from "@/components/storefront/product-filters";
import { ProductGrid } from "@/components/storefront/product-grid";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton, ProductCardSkeleton } from "@/components/ui/skeleton";
import { productQuerySchema } from "@/lib/validations";
import { getProductFacets, queryProducts } from "@/services/products";
import type { ProductQuery, ProductSort } from "@/types";

export const metadata: Metadata = {
  title: "Shop all objects",
  description:
    "Browse the full Aether collection: audio, wearables, lighting, workspace, home and accessories from three independent studios.",
  alternates: { canonical: "/products" },
};

type SearchParams = Record<string, string | string[] | undefined>;

function toRecord(searchParams: SearchParams): Record<string, string> {
  const record: Record<string, string> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) record[key] = first;
  }
  return record;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const raw = toRecord(await searchParams);
  const parsed = productQuerySchema.safeParse(raw);
  const query: ProductQuery = parsed.success
    ? parsed.data
    : { page: 1, pageSize: 12 };

  const result = queryProducts(query);
  const facets = getProductFacets();

  const page = result.page;
  const pageSize = result.pageSize;
  const start = result.total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, result.total);

  const buildPageHref = (nextPage: number): string => {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (query.category) params.set("category", query.category);
    if (query.minPrice !== undefined) params.set("minPrice", String(query.minPrice));
    if (query.maxPrice !== undefined) params.set("maxPrice", String(query.maxPrice));
    if (query.rating !== undefined) params.set("rating", String(query.rating));
    if (query.inStock) params.set("inStock", "true");
    if (query.onSale) params.set("onSale", "true");
    if (query.sort && query.sort !== "featured") params.set("sort", query.sort);
    if (nextPage > 1) params.set("page", String(nextPage));
    const queryString = params.toString();
    return queryString ? `/products?${queryString}` : "/products";
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Aether collection",
    numberOfItems: result.total,
    itemListElement: result.items.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `/products/${product.slug}`,
      name: product.name,
    })),
  };

  return (
    <div className="container-page py-8 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-semibold text-foreground">Shop</li>
        </ol>
      </nav>

      <header className="mt-5 max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-500 dark:text-accent-300">
          The collection
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {query.category ? "A focused edit." : "Everything we make."}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {result.total} considered objects, made by three independent studios.
          Prices shown in USD with a live BDT conversion in the navbar.
        </p>
      </header>

      <div className="mt-8">
        <Suspense
          fallback={
            <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
              <Skeleton className="hidden h-96 rounded-2xl lg:block" />
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {[0, 1, 2, 3].map((item) => (
                  <ProductCardSkeleton key={item} />
                ))}
              </div>
            </div>
          }
        >
          <ProductFilters facets={facets}>
            <div className="flex items-center justify-between gap-3 pb-1">
              <p className="text-xs text-muted-foreground sm:text-sm" aria-live="polite">
                {result.total === 0
                  ? "No objects match these filters"
                  : `Showing ${start}–${end} of ${result.total}`}
              </p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Free shipping over $150
              </p>
            </div>

            {result.items.length === 0 ? (
              <EmptyState
                icon={PackageSearch}
                title="No objects found"
                description="Try removing a filter, widening the price range, or searching a different term."
                action={
                  <Button asChild>
                    <Link href="/products">Reset the collection</Link>
                  </Button>
                }
              />
            ) : (
              <ProductGrid products={result.items} priorityCount={4} />
            )}

            <Pagination
              page={page}
              totalPages={result.totalPages}
              buildHref={buildPageHref}
              className="pt-6"
            />
          </ProductFilters>
        </Suspense>
      </div>

      {query.q ? (
        <p className="mt-8 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Search:</span> “{query.q}”
          — {result.total} result{result.total === 1 ? "" : "s"}.
          {(query.sort as ProductSort | undefined) === "price-asc"
            ? " Sorted by lowest price."
            : ""}
        </p>
      ) : null}
    </div>
  );
}
