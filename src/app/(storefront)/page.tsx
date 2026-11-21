import Script from "next/script";

import {
  BrandShowcase,
  CategorySections,
  HeroBanner,
  MiddleCategories,
  NewArrivals,
  NewsletterSection,
  OrderTracking,
  ProductFinder,
  PromoBanners,
} from "@/components/home";
import { SITE } from "@/lib/constants";
import {
  isHomeSectionVisible,
  visibleCategorySections,
} from "@/lib/site-settings";
import {
  catalog,
  getActiveBanners,
  getBrands,
  getCategories,
  getFeaturedProducts,
  getNewArrivals,
  getSiteSettings,
  getTrendingProducts,
} from "@/services/catalog";
import type { Product } from "@/types";

export default async function HomePage() {
  const settings = await getSiteSettings();
  const sections = visibleCategorySections(settings);

  const catalogData = Promise.all([
    getFeaturedProducts(8),
    getTrendingProducts(8),
    getNewArrivals(8),
    getCategories(),
    getBrands(),
    getActiveBanners(),
  ]);

  const sectionProductsData = Promise.all(
    sections.map(async (section) => {
      try {
        const result = await catalog.products({
          category: section.categorySlug,
          inStock: true,
          limit: 6,
          sortBy: "soldCount",
          sortOrder: "desc",
        });
        return result.items;
      } catch {
        return [];
      }
    }),
  );

  const [featured, trending, newArrivals, categories, brands, banners] =
    await catalogData;
  const sectionProducts = await sectionProductsData;

  const catalogProducts = Array.from(
    new Map<string, Product>(
      [...featured, ...trending, ...newArrivals].map((product) => [
        product.id,
        product,
      ]),
    ).values(),
  );
  const heroProducts = catalogProducts.slice(0, 5);
  const newArrivalItems = newArrivals.length > 0 ? newArrivals : featured;
  const categoryDescriptions = new Map(
    categories.map((category) => [category.slug, category.description]),
  );

  const jsonLd = {
 "@context": "https://schema.org",
 "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/icon.svg`,
    description: SITE.description,
    email: SITE.email,
    sameAs: [SITE.social.instagram, SITE.social.x, SITE.social.youtube],
  };

  return (
    <>
      <Script
        id="organization-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {isHomeSectionVisible(settings, "showHero") ? (
        <HeroBanner products={heroProducts} />
      ) : null}

      {isHomeSectionVisible(settings, "showProductFinder") ? (
        <ProductFinder products={catalogProducts} />
      ) : null}

      {isHomeSectionVisible(settings, "showMiddleCategories") ? (
        <MiddleCategories categories={categories} />
      ) : null}

      {sections.map((section, index) => (
        <CategorySections
          key={section.id}
          title={section.categoryName}
          slug={section.categorySlug}
          description={
            categoryDescriptions.get(section.categorySlug) ?? undefined
          }
          products={sectionProducts[index] ?? []}
        />
      ))}

      {isHomeSectionVisible(settings, "showNewArrivals") ? (
        <NewArrivals products={newArrivalItems} />
      ) : null}

      {isHomeSectionVisible(settings, "showBrands") ? (
        <BrandShowcase brands={brands} />
      ) : null}

      {isHomeSectionVisible(settings, "showPromoBanners") ? (
        <PromoBanners banners={banners} />
      ) : null}

      <OrderTracking />

      {isHomeSectionVisible(settings, "showNewsletter") ? (
        <NewsletterSection />
      ) : null}
    </>
  );
}
