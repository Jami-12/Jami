import {
  BrandShowcase,
  CategoryGrid,
  HeroBanner,
  NewArrivals,
  NewsletterSection,
  PromoBanners,
} from "@/components/home";
import { SITE } from "@/lib/constants";
import {
  getActiveBanners,
  getBrands,
  getCategories,
  getFeaturedProducts,
  getNewArrivals,
  getTrendingProducts,
} from "@/services/catalog";

export const revalidate = 120;

export default async function HomePage() {
  const [featured, trending, newArrivals, categories, brands, banners] =
    await Promise.all([
      getFeaturedProducts(8),
      getTrendingProducts(8),
      getNewArrivals(8),
      getCategories(),
      getBrands(),
      getActiveBanners(),
    ]);

  const heroProducts =
    featured.length > 0 ? featured : trending.length > 0 ? trending : newArrivals;
  const newArrivalItems =
    newArrivals.length > 0 ? newArrivals.slice(0, 8) : featured.slice(0, 8);
  const promoBanners = banners.filter((banner) => banner.placement === "PROMO");

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HeroBanner
        products={heroProducts}
      />

      <CategoryGrid categories={categories} />


      <NewArrivals products={newArrivalItems} />


      <BrandShowcase brands={brands} />

      <PromoBanners banners={promoBanners} />



      <NewsletterSection />
    </>
  );
}
