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
          className="inline-flex h-10 items-center gap-2 rounded-none border border-border bg-background px-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground not-italic transition-colors hover:border-foreground hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:border-foreground data-[state=open]:bg-foreground data-[state=open]:text-background"
        >
          Categories
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-64 rounded-none border border-border bg-popover p-1 text-popover-foreground shadow-none"
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground not-italic">
          Shop by category
        </DropdownMenuLabel>
        {query.isLoading ? (
          <div className="space-y-2 px-2 py-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full rounded-none" />
            ))}
          </div>
        ) : (
          categories.map((category) => (
            <DropdownMenuItem
              key={category.id}
              asChild
              className="rounded-none text-[13px] font-medium text-muted-foreground transition-colors hover:bg-foreground hover:text-background focus:bg-foreground focus:text-background"
            >
              <Link
                href={`/products?category=${encodeURIComponent(category.slug)}`}
              >
                {category.name}
              </Link>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          asChild
          className="rounded-none text-[11px] font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-foreground hover:text-background focus:bg-foreground focus:text-background"
        >
          <Link href="/products">
            All pieces
            <ArrowRight className="ml-auto h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
