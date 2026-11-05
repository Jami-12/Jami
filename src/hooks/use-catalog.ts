"use client";

import { useQuery } from "@tanstack/react-query";

import { productsApi, reviewsApi } from "@/lib/api/services";
import { catalog } from "@/services/catalog";
import type { ProductListParams } from "@/types";

export const catalogKeys = {
  products: (params: ProductListParams) => ["products", params] as const,
  product: (slug: string) => ["product", slug] as const,
  categories: ["categories"] as const,
  brands: ["brands"] as const,
  reviews: (productId: string, page = 1) =>
    ["reviews", productId, page] as const,
};

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: catalogKeys.products(params),
    queryFn: () => productsApi.list(params),
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: catalogKeys.product(slug),
    queryFn: () => productsApi.getBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories,
    queryFn: () => catalog.categories(),
  });
}

export function useBrands() {
  return useQuery({
    queryKey: catalogKeys.brands,
    queryFn: () => catalog.brands(),
  });
}

export function useProductReviews(
  productId: string | undefined,
  page = 1,
  limit = 8,
) {
  return useQuery({
    queryKey: catalogKeys.reviews(productId ?? "none", page),
    queryFn: () => reviewsApi.forProduct(productId ?? "", { page, limit }),
    enabled: Boolean(productId),
  });
}
