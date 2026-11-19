"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { brandsApi } from "@/lib/api/services";

/** Kept for direct imports; the redesigned navbar uses CategoriesMenu. */
export function BrandsMenu() {
  const query = useQuery({
    queryKey: ["nav", "brands"],
    queryFn: () => brandsApi.list(),
    staleTime: 5 * 60_000,
  });

  if (!query.data?.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-1 rounded-full px-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground transition hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-muted data-[state=open]:text-foreground"
        >
          Brands
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56 rounded-2xl border-border/80 p-2 shadow-lift"
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Shop by brand
        </DropdownMenuLabel>
        {query.data.slice(0, 8).map((brand) => (
          <DropdownMenuItem key={brand.id} asChild className="rounded-xl">
            <Link href={`/products?brand=${encodeURIComponent(brand.slug)}`}>
              {brand.name}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
