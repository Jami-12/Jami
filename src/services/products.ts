"use client";

import { productsApi } from "@/lib/api/services";
import type { Product, ProductListParams } from "@/types";

/**
 * Client-side product helpers. Kept as a named module so the search dialog and
 * client filters share one query surface.
 */
export async function searchProducts(term: string, limit = 6): Promise<Product[]> {
  if (!term.trim()) return [];
  const result = await productsApi.list({
    search: term.trim(),
    limit,
    inStock: true,
  });
  return result.items;
}

export function listProducts(params: ProductListParams = {}) {
  return productsApi.list(params);
}
