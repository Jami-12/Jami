import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch } from "lucide-react";

import { ProductFilters } from "@/components/storefront/product-filters";
import { ProductGrid } from "@/components/storefront/product-grid";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { FREE_SHIPPING_THRESHOLD, SITE } from "@/lib/constants";
import { productColors } from "@/lib/product-options";
import { formatCurrency } from "@/lib/utils";
import { productQuerySchema } from "@/lib/validations";
import { catalog } from "@/services/catalog";
import type { Product } from "@/types";
import { mapSort } from "@/types/ui";

export const metadata: Metadata = {
  title: "Shop the collection",
  description:
    "Browse the full collection: elevated essentials, considered details and pieces made to be worn for years, not seasons.",
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
        color: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        rating: undefined,
        inStock: undefined,
        onSale: undefined,
      };

  const sort = mapSort(query.sort);

  /**
   * Rating, sale and colour are not part of the catalogue API. When one of
   * them is active we page through the base result set first, then filter and
   * paginate locally so counts, pages and results always agree.
   */
  const hasClientOnlyFilters = Boolean(query.rating || query.onSale || query.color);
  const baseParams = {
    search: query.q,
    category: query.category,
    brand: query.brand,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    inStock: query.inStock,
    status: "ACTIVE" as const,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
  };

  const [firstResult, categories, brands] = await Promise.all([
    catalog.products({
      ...baseParams,
      page: hasClientOnlyFilters ? 1 : query.page,
      limit: hasClientOnlyFilters ? 100 : query.pageSize,
    }),
    catalog.categories().catch(() => []),
    catalog.brands().catch(() => []),
  ]);

  let pageItems: Product[];
  let total: number;
  let totalPages: number;
  let page: number;
  const pageSize = query.pageSize;

  if (hasClientOnlyFilters) {
    let allItems = firstResult.items;
    if (firstResult.meta.totalPages > 1) {
      const remaining = await Promise.all(
        Array.from({ length: firstResult.meta.totalPages - 1 }, (_, index) =>
          catalog.products({ ...baseParams, page: index + 2, limit: 100 }),
        ),
      );
      allItems = allItems.concat(...remaining.map((result) => result.items));
    }

    if (query.rating) {
      allItems = allItems.filter(
        (product) => product.averageRating >= Number(query.rating),
      );
    }
    if (query.onSale) {
      allItems = allItems.filter(
        (product) => product.finalPrice < product.originalPrice,
      );
    }
    if (query.color) {
      const wanted = query.color.toLowerCase();
      allItems = allItems.filter((product) =>
        productColors(product).some(
          (colour) => colour.name.toLowerCase() === wanted,
        ),
      );
    }

    total = allItems.length;
    totalPages = Math.max(1, Math.ceil(total / pageSize));
    page = Math.min(query.page, totalPages);
    pageItems = allItems.slice((page - 1) * pageSize, page * pageSize);
  } else {
    pageItems = firstResult.items;
    total = firstResult.meta.total;
    totalPages = firstResult.meta.totalPages;
    page = firstResult.meta.page;
  }

  const items = pageItems;
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const paginationParams = {
    q: query.q,
    category: query.category,
    brand: query.brand,
    color: query.color,
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
    name: `${SITE.name} collection`,
    numberOfItems: total,
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

      <header className="mt-5 max-w-3xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-600 dark:text-accent-300">
          The collection
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
          {activeCategory ? activeCategory.name : "Everything we make."}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {total} considered piece{total === 1 ? "" : "s"}, photographed on the
          hanger and close up. Prices show in your selected currency.
        </p>
      </header>

      <div className="mt-8">
        <ProductFilters categories={categories} brands={brands} priceRange={priceRange}>
          <div className="flex items-center justify-between gap-3 pb-1">
            <p className="text-xs text-muted-foreground sm:text-sm" aria-live="polite">
              {total === 0
                ? "No pieces match these filters"
                : `Showing ${start}–${end} of ${total}`}
            </p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Free shipping over {formatCurrency(FREE_SHIPPING_THRESHOLD)}
            </p>
          </div>

          {items.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No pieces found"
              description="Try removing a filter, widening the price range, or searching a different term."
              action={
                <Button asChild>
                  <Link href="/products">Reset the collection</Link>
                </Button>
              }
            />
          ) : (
            <ProductGrid products={items} priorityCount={4} />
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            href={{ pathname: "/products", params: paginationParams }}
            className="pt-6"
          />
        </ProductFilters>
      </div>

      {query.q ? (
        <p className="mt-8 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Search:</span> “{query.q}”
          — {total} result{total === 1 ? "" : "s"}.
        </p>
      ) : null}
    </div>
  );
}
