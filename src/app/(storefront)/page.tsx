import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CategoryGrid } from "@/components/storefront/category-grid";
import { Hero } from "@/components/storefront/hero";
import { JournalSection } from "@/components/storefront/journal-section";
import { OfferBanner } from "@/components/storefront/offer-banner";
import { ProductGrid } from "@/components/storefront/product-grid";
import { Testimonials } from "@/components/storefront/testimonials";
import { TrustStrip } from "@/components/storefront/trust-strip";
import { VendorPanel } from "@/components/storefront/vendor-panel";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { SITE } from "@/lib/constants";
import {
  getCategories,
  getFeaturedProducts,
  getTrendingProducts,
} from "@/services/catalog";

export const revalidate = 120;

export default async function HomePage() {
  const [featured, trending, categories] = await Promise.all([
    getFeaturedProducts(8),
    getTrendingProducts(8),
    getCategories(),
  ]);

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
      <Hero />
      <TrustStrip />
      <CategoryGrid categories={categories} />

      <span id="showroom" className="sr-only">
        3D showroom
      </span>

      <section aria-labelledby="featured-heading" className="container-page py-14 sm:py-16">
        <SectionHeading
          eyebrow="The Aether edit"
          title="Pieces we reach for first"
          description="Chosen by the studio for the way they feel, sound and age. Every object is in stock unless marked otherwise."
          action={
            <Button asChild variant="outline">
              <Link href="/products?sort=featured">
                View all
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          }
        />
        <h2 id="featured-heading" className="sr-only">
          Featured objects
        </h2>
        <ProductGrid
          products={featured}
          className="mt-7"
          priorityCount={2}
          emptyTitle="The edit is being prepared"
          emptyDescription="New objects are on their way. Browse the full collection meanwhile."
        />
      </section>

      <OfferBanner />

      <section aria-labelledby="trending-heading" className="container-page py-14 sm:py-16">
        <SectionHeading
          eyebrow="Most wanted"
          title="Trending across the studios"
          description="The objects our customers are talking about this week — ranked by what is actually selling."
          action={
            <Button asChild variant="outline">
              <Link href="/products?sort=popular">
                Shop bestsellers
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          }
        />
        <h2 id="trending-heading" className="sr-only">
          Trending objects
        </h2>
        <ProductGrid products={trending} className="mt-7" />
      </section>

      <VendorPanel />
      <JournalSection />
      <Testimonials />

      <section id="story" className="container-page scroll-mt-24 pb-6 pt-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-10 shadow-soft sm:px-10 sm:py-12">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent-300/20 blur-3xl"
          />
          <div className="relative grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-500 dark:text-accent-300">
                Our standard
              </p>
              <h2 className="mt-2 max-w-lg text-2xl font-extrabold tracking-tight sm:text-3xl">
                Buy less. Choose well. Repair what you can.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Every Aether object ships with a materials passport, a repair
                guide and a two-year warranty. We would rather sell you one lamp
                you keep for a decade than five you replace.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "92%", label: "recycled or renewable content" },
                { value: "4.9/5", label: "average product rating" },
                { value: "30 days", label: "no-questions returns" },
                { value: "3", label: "independent studios" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-background/60 p-3.5"
                >
                  <p className="text-xl font-extrabold tabular-nums">{stat.value}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
