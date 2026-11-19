import { API_BASE_URL } from "@/lib/constants";
import type {
  Banner,
  Brand,
  Category,
  Paginated,
  Product,
  ProductListParams,
  ProductReviews,
  SiteSettings,
} from "@/types";

/**
 * Server-safe catalog access. `src/lib/api/services.ts` is a client module (it
 * attaches auth tokens), so server components use this thin `fetch` layer
 * against the same public endpoints instead.
 */

const DEFAULT_REVALIDATE = 60;

function queryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

async function publicRequest<T>(
  path: string,
  options: { revalidate?: number | false; signal?: AbortSignal } = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
    signal: options.signal,
    next:
      options.revalidate === false
        ? undefined
        : { revalidate: options.revalidate ?? DEFAULT_REVALIDATE },
    ...(options.revalidate === false ? { cache: "no-store" as const } : {}),
  });

  if (!response.ok) {
    throw new Error(`Catalog request failed (${response.status})`);
  }

  const body = (await response.json()) as ApiEnvelope<T>;
  if (!body.success) {
    throw new Error(body.message ?? "Catalog request failed");
  }
  return body.data;
}

export const catalog = {
  products: async (
    params: ProductListParams = {},
    options?: { revalidate?: number | false },
  ): Promise<Paginated<Product>> =>
    publicRequest<Paginated<Product>>(
      `/products${queryString(params as Record<string, unknown>)}`,
      options,
    ),

  productBySlug: async (slug: string): Promise<Product> => {
    const result = await publicRequest<{ product: Product }>(
      `/products/slug/${encodeURIComponent(slug)}`,
    );
    return result.product;
  },

  productById: async (id: string): Promise<Product> => {
    const result = await publicRequest<{ product: Product }>(`/products/${id}`);
    return result.product;
  },

  categories: async (): Promise<Category[]> => {
    const result = await publicRequest<{ items: Category[] }>("/categories");
    return result.items;
  },

  brands: async (): Promise<Brand[]> => {
    const result = await publicRequest<{ items: Brand[] }>("/brands");
    return result.items;
  },

  reviews: async (
    productId: string,
    params: { page?: number; limit?: number; rating?: number } = {},
  ): Promise<ProductReviews> =>
    publicRequest<ProductReviews>(
      `/products/${productId}/reviews${queryString(params)}`,
    ),

  banners: async (placement?: "HERO" | "PROMO"): Promise<Banner[]> => {
    const result = await publicRequest<{ banners: Banner[] }>(
      `/banners${placement ? `?placement=${placement}` : ""}`,
    );
    return result.banners;
  },
};

/** Featured products with a safe fallback so the home page never crashes. */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  try {
    const result = await catalog.products({
      featured: true,
      inStock: true,
      limit,
      sortBy: "soldCount",
      sortOrder: "desc",
    });
    if (result.items.length > 0) return result.items;
    const fallback = await catalog.products({
      inStock: true,
      limit,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    return fallback.items;
  } catch {
    return [];
  }
}

export async function getTrendingProducts(limit = 8): Promise<Product[]> {
  try {
    const result = await catalog.products({
      inStock: true,
      limit,
      sortBy: "soldCount",
      sortOrder: "desc",
    });
    return result.items;
  } catch {
    return [];
  }
}

export async function getNewArrivals(limit = 4): Promise<Product[]> {
  try {
    const result = await catalog.products({
      limit,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    return result.items;
  } catch {
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    return await catalog.categories();
  } catch {
    return [];
  }
}

export async function getBrands(): Promise<Brand[]> {
  try {
    return await catalog.brands();
  } catch {
    return [];
  }
}

/** Active storefront banners. Returns an empty list if the API is unreachable. */
export async function getActiveBanners(): Promise<Banner[]> {
  try {
    return await catalog.banners();
  } catch {
    return [];
  }
}

/**
 * Live storefront settings (navbar logo + section visibility). Read on every
 * request so an admin toggle is reflected on the next visit, and degrade to
 * `null` when the API is unavailable so every page still renders.
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const result = await publicRequest<{ settings: SiteSettings }>("/settings", {
      revalidate: false,
      signal: AbortSignal.timeout(4_000),
    });
    return result.settings ?? null;
  } catch {
    return null;
  }
}
