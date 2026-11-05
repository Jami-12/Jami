"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2, Search, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Price } from "@/components/ui/price";
import { SmartImage } from "@/components/ui/smart-image";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { productsApi } from "@/lib/api/services";
import { CATEGORIES, CATEGORY_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import { productImage, productName } from "@/types";

export function SearchDialog() {
  const open = useUiStore((state) => state.searchOpen);
  const setOpen = useUiStore((state) => state.setSearchOpen);
  const close = React.useCallback(() => setOpen(false), [setOpen]);
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const debounced = useDebouncedValue(query.trim(), 200);

  const { data, isFetching } = useQuery({
    queryKey: ["search", debounced],
    queryFn: () =>
      productsApi.list({ search: debounced, limit: 6, inStock: true, status: "ACTIVE" }),
    enabled: open && debounced.length > 1,
  });

  const results = data?.items ?? [];

  React.useEffect(() => {
    setActiveIndex(0);
  }, [debounced]);

  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const goToResults = () => {
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        results.length ? (current + 1) % results.length : 0,
      );
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        results.length ? (current - 1 + results.length) % results.length : 0,
      );
    }
    if (event.key === "Enter") {
      const active = results[activeIndex];
      if (active) {
        event.preventDefault();
        setOpen(false);
        router.push(`/products/${active.slug}`);
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Search Aether"
      description="Products, categories and materials — start typing."
      size="md"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          goToResults();
        }}
      >
        <div className="relative">
          {isFetching ? (
            <Loader2
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
              aria-hidden="true"
            />
          ) : (
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          )}
          <input
            data-autofocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Try “headphones”, “oak” or “lighting”"
            aria-label="Search products"
            className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-ring/25"
          />
        </div>
      </form>

      <div className="mt-4" aria-live="polite">
        {debounced.length > 1 && !isFetching && results.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
            <p className="text-sm font-semibold">No matches for “{query}”</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a broader term, or browse every category.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/products" onClick={close}>
                Browse all products
              </Link>
            </Button>
          </div>
        ) : null}

        {results.length > 0 ? (
          <ul className="space-y-1">
            {results.map((product, index) => (
              <li key={product.id}>
                <Link
                  href={`/products/${product.slug}`}
                  onClick={close}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border border-transparent p-2.5 transition",
                    activeIndex === index
                      ? "border-border bg-muted"
                      : "hover:bg-muted/70",
                  )}
                >
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <SmartImage
                      src={productImage(product)}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {productName(product)}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                        {product.category?.name ?? CATEGORY_LABEL[product.category?.slug ?? ""] ?? "Aether"}
                      </span>
                      <Price
                        amount={product.finalPrice}
                        className="text-xs text-muted-foreground"
                      />
                    </span>
                  </span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={goToResults}
                className="mt-1 flex w-full items-center justify-between rounded-xl bg-primary-50 px-3 py-2.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-100 dark:bg-primary-900/40 dark:text-accent-200 dark:hover:bg-primary-900/70"
              >
                See all results for “{query.trim()}”
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          </ul>
        ) : null}

        {!query.trim() ? (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              <Tag className="h-3.5 w-3.5" aria-hidden="true" /> Browse categories
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <Link
                  key={category.value}
                  href={`/products?category=${category.value}`}
                  onClick={close}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-primary-300 hover:text-foreground"
                >
                  {category.label}
                </Link>
              ))}
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {[
                { label: "New arrivals", href: "/products?sort=newest" },
                { label: "Bestsellers", href: "/products?sort=popular" },
                { label: "On sale", href: "/products?onSale=true" },
              ].map((shortcut) => (
                <Link
                  key={shortcut.label}
                  href={shortcut.href}
                  onClick={close}
                  className="rounded-xl border border-border bg-background px-3 py-3 text-sm font-semibold transition hover:bg-muted"
                >
                  {shortcut.label}
                </Link>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2">
              <Badge tone="accent">Live catalog</Badge>
              <span className="text-xs text-muted-foreground">
                Every result comes from the store&apos;s live inventory.
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
