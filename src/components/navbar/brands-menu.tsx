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
          className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-muted data-[state=open]:text-foreground"
        >
          Brands
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Shop by brand</DropdownMenuLabel>
        {query.data.slice(0, 8).map((brand) => (
          <DropdownMenuItem key={brand.id} asChild>
            <Link href={`/products?brand=${encodeURIComponent(brand.slug)}`}>
              {brand.name}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
