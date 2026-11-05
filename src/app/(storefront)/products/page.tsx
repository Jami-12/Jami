import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch } from "lucide-react";

import { ProductFilters } from "@/components/storefront/product-filters";
import { WardrobeRail } from "@/components/storefront/wardrobe-rail";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { productQuerySchema } from "@/lib/validations";
import { catalog } from "@/services/catalog";
import type { Product } from "@/types";
import { mapSort } from "@/types/ui";

export const metadata: Metadata = {
  title: "Shop all objects",
  description:
    "Browse the full Aether collection: audio, wearables, lighting, workspace, home and accessories from independent studios.",
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
  const query = parsed.success
    ? parsed.data
    : {
        sort: "featured" as const,
        page: 1,
        pageSize: 12,
        q: undefined,
        category: undefined,
        brand: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        rating: undefined,
        inStock: undefined,
        onSale: undefined,
      };

  const sort = mapSort(query.sort);

  const [result, categories, brands] = await Promise.all([
    catalog.products({
      page: query.page,
      limit: query.pageSize,
      search: query.q,
      category: query.category,
      brand: query.brand,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      inStock: query.inStock,
      status: "ACTIVE",
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder,
    }),
    catalog.categories().catch(() => []),
    catalog.brands().catch(() => []),
  ]);

  let items: Product[] = result.items;
  if (query.rating) {
    items = items.filter((product) => product.averageRating >= Number(query.rating));
  }
  if (query.onSale) {
    items = items.filter((product) => product.finalPrice < product.originalPrice);
  }

  const page = result.meta.page;
  const pageSize = result.meta.limit;
  const start = result.meta.total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, result.meta.total);

  const paginationParams = {
    q: query.q,
    category: query.category,
    brand: query.brand,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    rating: query.rating,
    inStock: query.inStock,
    onSale: query.onSale,
    sort: query.sort !== "featured" ? query.sort : undefined,
    pageSize: query.pageSize !== 12 ? query.pageSize : undefined,
  };

  const priceRange = {
    min: 0,
    max: Math.max(1000, ...items.map((product) => Math.ceil(product.originalPrice))),
  };

  const activeCategory = categories.find((category) => category.slug === query.category);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Aether collection",
    numberOfItems: result.meta.total,
    itemListElement: items.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `/products/${product.slug}`,
      name: product.title,
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
          <li className="font-semibold text-foreground">
            {activeCategory ? activeCategory.name : "Shop"}
          </li>
        </ol>
      </nav>

      <header className="mt-5 max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-500 dark:text-accent-300">
          The collection
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {activeCategory ? activeCategory.name : "Everything we make."}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {result.meta.total} considered object{result.meta.total === 1 ? "" : "s"},
          made by independent studios. Prices show in your selected currency.
        </p>
      </header>

      <div className="mt-8">
        <ProductFilters categories={categories} brands={brands} priceRange={priceRange}>
          <div className="flex items-center justify-between gap-3 pb-1">
            <p className="text-xs text-muted-foreground sm:text-sm" aria-live="polite">
              {result.meta.total === 0
                ? "No objects match these filters"
                : `Showing ${start}–${end} of ${result.meta.total}`}
            </p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Free shipping over ৳1,000
            </p>
          </div>

          {items.length === 0 ? (
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
            <WardrobeRail products={items} />
          )}

          <Pagination
            page={page}
            totalPages={result.meta.totalPages}
            href={{ pathname: "/products", params: paginationParams }}
            className="pt-6"
          />
        </ProductFilters>
      </div>

      {query.q ? (
        <p className="mt-8 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Search:</span> “{query.q}”
          — {result.meta.total} result{result.meta.total === 1 ? "" : "s"}.
        </p>
      ) : null}
    </div>
  );
}
