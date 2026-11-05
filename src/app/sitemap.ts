import type { MetadataRoute } from "next";

import { SITE } from "@/lib/constants";
import { catalog } from "@/services/catalog";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes = [
    { path: "/", priority: 1 },
    { path: "/products", priority: 0.9 },
    { path: "/wishlist", priority: 0.5 },
    { path: "/cart", priority: 0.3 },
  ];

  let products: { slug: string; updatedAt: string }[] = [];
  try {
    const result = await catalog.products(
      { limit: 100, status: "ACTIVE" },
      { revalidate: 3600 },
    );
    products = result.items.map((product) => ({
      slug: product.slug,
      updatedAt: product.updatedAt,
    }));
  } catch {
    products = [];
  }

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route.path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route.priority,
    })),
    ...products.map((product) => ({
      url: `${base}/products/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
