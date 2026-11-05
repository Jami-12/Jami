import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { ProductDetail } from "@/components/storefront/product-detail";
import { ProductGrid } from "@/components/storefront/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { SITE } from "@/lib/constants";
import { catalog } from "@/services/catalog";
import type { Product } from "@/types";
import { productImage, productName, productImages } from "@/types";

export const revalidate = 120;

async function loadProduct(slug: string): Promise<Product | null> {
  try {
    return await catalog.productBySlug(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return { title: "Object not found" };

  const image = productImage(product);
  const title = productName(product);

  return {
    title,
    description:
      product.shortDescription ??
      product.description.slice(0, 160).replace(/\s+/g, " ").trim(),
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title,
      description: product.shortDescription ?? product.description.slice(0, 160),
      url: `${SITE.url}/products/${product.slug}`,
      images: image ? [{ url: image, alt: title }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await loadProduct(slug);

  if (!product || product.isArchived) {
    notFound();
  }

  let related: Product[] = [];
  try {
    const result = await catalog.products({
      category: product.category.slug,
      limit: 5,
      inStock: true,
      status: "ACTIVE",
    });
    related = result.items.filter((item) => item.id !== product.id).slice(0, 4);
  } catch {
    related = [];
  }

  const images = productImages(product);
  const available = product.stock > 0 && product.status !== "OUT_OF_STOCK";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName(product),
    description: product.description,
    sku: product.sku,
    image: images,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    category: product.category.name,
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.averageRating,
            reviewCount: product.reviewCount,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: product.finalPrice,
      availability: available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${SITE.url}/products/${product.slug}`,
    },
  };

  return (
    <div className="container-page py-8 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/products" className="hover:text-foreground">
              Shop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-foreground"
            >
              {product.category.name}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="max-w-[16rem] truncate font-semibold text-foreground">
            {productName(product)}
          </li>
        </ol>
      </nav>

      <div className="mt-6">
        <ProductDetail product={product} />
      </div>

      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className="mt-16 border-t border-border pt-10">
          <SectionHeading
            eyebrow="Pairs well with"
            title="More from this room"
            description="Objects that share a material language or a way of living."
            action={
              <Link
                href={`/products?category=${product.category.slug}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline dark:text-accent-300"
              >
                All {product.category.name}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />
          <h2 id="related-heading" className="sr-only">
            Related objects
          </h2>
          <ProductGrid products={related} className="mt-6" />
        </section>
      ) : null}
    </div>
  );
}
