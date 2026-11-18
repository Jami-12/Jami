"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

import { FALLBACK_CATEGORIES, useNavCategories } from "./use-nav-categories";

export function CategoriesMenu() {
  const query = useNavCategories();
  const categories = query.data?.length ? query.data : FALLBACK_CATEGORIES;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-muted data-[state=open]:text-foreground"
        >
          Categories
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Shop by category</DropdownMenuLabel>
        {query.isLoading ? (
          <div className="space-y-2 px-3 py-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
        ) : (
          categories.map((category) => (
            <DropdownMenuItem key={category.id} asChild>
              <Link href={`/products?category=${encodeURIComponent(category.slug)}`}>
                {category.name}
              </Link>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/products" className="font-semibold">
            All pieces
            <ArrowRight className="ml-auto h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
