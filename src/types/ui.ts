import type { Product } from "./api";

type ApiProductSort = "createdAt" | "price" | "title" | "soldCount";

export type ProductSort =
  | "featured"
  | "newest"
  | "popular"
  | "price-asc"
  | "price-desc"
  | "title-asc";

export interface ProductQuery {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  onSale?: boolean;
  sort: ProductSort;
  page: number;
  pageSize: number;
}

export interface ProductFacet {
  value: string;
  label: string;
  count?: number;
}

export interface ProductFacets {
  categories: ProductFacet[];
  brands: ProductFacet[];
  priceRange: { min: number; max: number };
}

/**
 * The backend returns a rich product shape. These helpers keep UI components
 * from repeating fallbacks for names, images and pricing.
 */
export function productName(product: Product): string {
  return product.title || product.name;
}

export function productImage(product: Product): string | null {
  const primary = product.images.find((image) => image.isPrimary);
  return (
    primary?.url ??
    primary?.imageUrl ??
    product.images[0]?.url ??
    product.images[0]?.imageUrl ??
    product.thumbnail ??
    null
  );
}

export function productImages(product: Product): string[] {
  const urls = product.images
    .slice()
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder)
    .map((image) => image.url || image.imageUrl)
    .filter((url): url is string => Boolean(url));

  if (product.thumbnail && !urls.includes(product.thumbnail)) {
    urls.push(product.thumbnail);
  }

  return urls;
}

export function hasDiscount(product: Product): boolean {
  return Boolean(product.discount && product.discount.amount > 0) || product.finalPrice < product.originalPrice;
}

export function discountPercentOf(product: Product): number {
  if (!product.originalPrice || product.finalPrice >= product.originalPrice) return 0;
  return Math.round(((product.originalPrice - product.finalPrice) / product.originalPrice) * 100);
}

export function mapSort(sort: ProductSort): {
  sortBy: ApiProductSort;
  sortOrder: "asc" | "desc";
} {
  switch (sort) {
    case "price-asc":
      return { sortBy: "price", sortOrder: "asc" };
    case "price-desc":
      return { sortBy: "price", sortOrder: "desc" };
    case "title-asc":
      return { sortBy: "title", sortOrder: "asc" };
    case "popular":
      return { sortBy: "soldCount", sortOrder: "desc" };
    case "newest":
    case "featured":
    default:
      return { sortBy: "createdAt", sortOrder: "desc" };
  }
}
