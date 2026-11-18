"use client";

import { useQuery } from "@tanstack/react-query";

import { categoriesApi } from "@/lib/api/services";
import { CATEGORIES } from "@/lib/constants";

export const FALLBACK_CATEGORIES = CATEGORIES.map((category) => ({
  id: category.value,
  name: category.label,
  slug: category.value,
}));

export function useNavCategories() {
  return useQuery({
    queryKey: ["nav", "categories"],
    queryFn: () => categoriesApi.list(),
    staleTime: 5 * 60_000,
  });
}
