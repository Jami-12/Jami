"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { PRODUCT_SORT_OPTIONS } from "@/lib/constants";
import { COLOR_SWATCHES } from "@/lib/product-options";
import { cn } from "@/lib/utils";
import type { Brand, Category } from "@/types";

const RATINGS = [4, 3, 2];

export function ProductFilters({
  categories,
  brands,
  priceRange,
  children,
}: {
  categories: Category[];
  brands: Brand[];
  priceRange: { min: number; max: number };
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const current = React.useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    const min = params.get("minPrice") ?? "";
    const max = params.get("maxPrice") ?? "";
    return {
      q: params.get("q") ?? "",
      category: params.get("category") ?? "",
      brand: params.get("brand") ?? "",
      color: params.get("color") ?? "",
      minPrice: min,
      maxPrice: max,
      rating: params.get("rating") ?? "",
      inStock: params.get("inStock") === "true",
      onSale: params.get("onSale") === "true",
      sort: params.get("sort") ?? "featured",
    };
  }, [searchParams]);

  const [search, setSearch] = React.useState(current.q);
  const [minPrice, setMinPrice] = React.useState(current.minPrice);
  const [maxPrice, setMaxPrice] = React.useState(current.maxPrice);

  React.useEffect(() => {
    setSearch(current.q);
  }, [current.q]);

  React.useEffect(() => {
    setMinPrice(current.minPrice);
    setMaxPrice(current.maxPrice);
  }, [current.minPrice, current.maxPrice]);

  const update = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const setParam = (key: string, value: string | null) => {
    update((params) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
  };

  const activeCount = [
    current.q,
    current.category,
    current.brand,
    current.color,
    current.minPrice,
    current.maxPrice,
    current.rating,
    current.inStock ? "true" : "",
    current.onSale ? "true" : "",
  ].filter(Boolean).length;

  const filterBody = (
    <div className="space-y-6">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setParam("q", search.trim() || null);
        }}
      >
        <Label
          htmlFor="filter-search"
          className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground"
        >
          Search
        </Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="filter-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Linen shirt, knit…"
            className="h-9 pl-8 pr-8"
          />
          {search ? (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setParam("q", null);
              }}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </form>

      <fieldset>
        <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Colour
        </legend>
        <div className="grid grid-cols-6 gap-2">
          {COLOR_SWATCHES.map((colour) => {
            const active = current.color === colour.name;
            return (
              <button
                key={colour.name}
                type="button"
                onClick={() => setParam("color", active ? null : colour.name)}
                aria-label={colour.name}
                aria-pressed={active}
                title={colour.name}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-full border-2 transition",
                  active
                    ? "border-primary-700 dark:border-accent-300"
                    : "border-transparent hover:border-border",
                )}
              >
                <span
                  className="h-5 w-5 rounded-full border border-black/10 shadow-sm"
                  style={{ backgroundColor: colour.hex }}
                />
              </button>
            );
          })}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Category
        </legend>
        <div className="space-y-1">
          <FilterRadio
            name="category"
            label="All categories"
            checked={!current.category}
            onChange={() => setParam("category", null)}
          />
          {categories.map((category) => (
            <FilterRadio
              key={category.id}
              name="category"
              label={category.name}
              count={category.productCount}
              checked={current.category === category.slug}
              onChange={() => setParam("category", category.slug)}
            />
          ))}
        </div>
      </fieldset>

      {brands.length > 0 ? (
        <fieldset>
          <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Brand
          </legend>
          <div className="space-y-1">
            <FilterRadio
              name="brand"
              label="All brands"
              checked={!current.brand}
              onChange={() => setParam("brand", null)}
            />
            {brands.map((brand) => (
              <FilterRadio
                key={brand.id}
                name="brand"
                label={brand.name}
                count={brand.productCount}
                checked={current.brand === brand.slug}
                onChange={() => setParam("brand", brand.slug)}
              />
            ))}
          </div>
        </fieldset>
      ) : null}

      <fieldset>
        <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Price
        </legend>
        <form
          className="flex items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            update((params) => {
              if (minPrice) params.set("minPrice", minPrice);
              else params.delete("minPrice");
              if (maxPrice) params.set("maxPrice", maxPrice);
              else params.delete("maxPrice");
            });
          }}
        >
          <div className="min-w-0 flex-1">
            <Label htmlFor="filter-min-price" className="text-[10px]">
              Min
            </Label>
            <Input
              id="filter-min-price"
              type="number"
              min={0}
              inputMode="numeric"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder={String(priceRange.min)}
              className="h-9"
            />
          </div>
          <div className="min-w-0 flex-1">
            <Label htmlFor="filter-max-price" className="text-[10px]">
              Max
            </Label>
            <Input
              id="filter-max-price"
              type="number"
              min={0}
              inputMode="numeric"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder={String(priceRange.max)}
              className="h-9"
            />
          </div>
          <Button type="submit" size="sm" variant="subtle" className="h-9">
            Apply
          </Button>
        </form>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Rating
        </legend>
        <div className="space-y-1">
          {RATINGS.map((rating) => (
            <FilterRadio
              key={rating}
              name="rating"
              label={`${rating}★ & up`}
              checked={current.rating === String(rating)}
              onChange={() =>
                setParam("rating", current.rating === String(rating) ? null : String(rating))
              }
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Availability
        </legend>
        <Toggle
          label="In stock only"
          checked={current.inStock}
          onChange={(checked) => setParam("inStock", checked ? "true" : null)}
        />
        <Toggle
          label="On sale"
          checked={current.onSale}
          onChange={(checked) => setParam("onSale", checked ? "true" : null)}
        />
      </fieldset>

      {activeCount > 0 ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => router.push(pathname, { scroll: false })}
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Clear {activeCount} filter{activeCount === 1 ? "" : "s"}
        </Button>
      ) : null}
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
      <aside className="hidden lg:sticky lg:top-24 lg:block">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary-500 dark:text-accent-300" aria-hidden="true" />
            <h2 className="text-sm font-bold">Refine</h2>
          </div>
          {filterBody}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-expanded={mobileOpen}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            Filters
            {activeCount > 0 ? (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {activeCount}
              </span>
            ) : null}
          </Button>

          <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Sort</span>
            <Select
              value={current.sort}
              onChange={(event) => setParam("sort", event.target.value === "featured" ? null : event.target.value)}
              className="h-9 w-44 text-xs"
              aria-label="Sort products"
            >
              {PRODUCT_SORT_OPTIONS.map((option) => {
                const value =
                  option.value === "createdAt:desc"
                    ? "newest"
                    : option.value === "soldCount:desc"
                      ? "popular"
                      : option.value.replace(":", "-");
                return (
                  <option key={option.value} value={value}>
                    {option.label}
                  </option>
                );
              })}
            </Select>
          </label>
        </div>

        {children}
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-primary-950/55 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Product filters"
            className={cn(
              "absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl border border-border bg-card p-5 shadow-lift",
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">Refine</h2>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close filters">
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            {filterBody}
            <Button className="mt-5 w-full" onClick={() => setMobileOpen(false)}>
              Show results
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterRadio({
  name,
  label,
  count,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1.5 text-sm transition hover:bg-muted">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 accent-[var(--color-primary-700)]"
      />
      <span className={cn("flex-1", checked ? "font-semibold text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
      {typeof count === "number" ? (
        <span className="text-[10px] tabular-nums text-muted-foreground">{count}</span>
      ) : null}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg px-1.5 py-1.5 text-sm hover:bg-muted">
      <span className="text-muted-foreground">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-3.5 w-3.5 accent-[var(--color-primary-700)]"
      />
    </label>
  );
}
