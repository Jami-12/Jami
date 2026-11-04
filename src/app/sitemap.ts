import type { MetadataRoute } from "next";

import { SITE } from "@/lib/constants";
import { PRODUCTS } from "@/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes = [
    { path: "/", priority: 1 },
    { path: "/products", priority: 0.9 },
    { path: "/checkout", priority: 0.4 },
    { path: "/account", priority: 0.5 },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route.path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route.priority,
    })),
    ...PRODUCTS.map((product) => ({
      url: `${base}/products/${product.slug}`,
      lastModified: new Date(product.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
