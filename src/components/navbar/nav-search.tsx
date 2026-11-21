"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search, X } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { SmartImage } from "@/components/ui/smart-image";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { productsApi } from "@/lib/api/services";
import { cn, formatCurrency } from "@/lib/utils";
import { productName, productPrimaryImage } from "@/types";

export function NavSearch({
  className,
  autoFocus = false,
}: {
  className?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const inputId = React.useId();
  const [query, setQuery] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  const debounced = useDebouncedValue(query.trim(), 250);

  const results = useQuery({
    queryKey: ["nav", "search", debounced],
    queryFn: () =>
      productsApi.list({ search: debounced, limit: 5, status: "ACTIVE" }),
    enabled: debounced.length >= 2,
    staleTime: 20_000,
  });

  const items = results.data?.items ?? [];
  const showPanel = focused && query.trim().length >= 2;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    setFocused(false);
    router.push(`/products?q=${encodeURIComponent(term)}`);
  };

  const clear = () => {
    setQuery("");
    setFocused(false);
  };

  return (
    <div
      className={cn("relative", className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocused(false);
        }
      }}
    >
      <form role="search" onSubmit={submit} className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          id={inputId}
          type="search"
          value={query}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setFocused(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") clear();
          }}
          placeholder="Search pieces, makers…"
          aria-label="Search products"
          autoComplete="off"
          className="h-10 w-full rounded-none border border-border bg-card pl-10 pr-9 text-sm text-foreground not-italic outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground focus:bg-surface focus:ring-1 focus:ring-ring [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-none border border-transparent text-muted-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </form>

      {showPanel ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-px max-w-full overflow-hidden rounded-none border border-border bg-popover text-popover-foreground shadow-none not-italic">
          {results.isFetching ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-none border border-border bg-muted" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-2.5 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-muted-foreground">
              No pieces match “{query.trim()}”.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto p-1">
              {items.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={clear}
                    className="group flex items-center gap-3 rounded-none border border-transparent px-2 py-2 transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                  >
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-none border border-border bg-muted">
                      <SmartImage
                        src={productPrimaryImage(product)}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-foreground group-hover:text-background">
                        {productName(product)}
                      </span>
                      <span className="block text-[11px] text-muted-foreground group-hover:text-background">
                        {product.category?.name}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold tabular-nums">
                      {formatCurrency(product.finalPrice)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={`/products?q=${encodeURIComponent(query.trim())}`}
            onClick={clear}
            className="flex items-center justify-between gap-2 border-t border-border px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground not-italic transition-colors hover:bg-foreground hover:text-background"
          >
            View all results
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
