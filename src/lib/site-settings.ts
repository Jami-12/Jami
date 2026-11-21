import { SITE } from "@/lib/constants";
import type { SiteSettings } from "@/types";

export const HOME_SECTION_KEYS = [
 "showHero",
 "showProductFinder",
 "showMiddleCategories",
 "showCategorySections",
 "showNewArrivals",
 "showBrands",
 "showPromoBanners",
 "showNewsletter",
] as const;

export type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number];

export const HOME_SECTION_META: Record<
  HomeSectionKey,
  { label: string; description: string }
> = {
  showHero: {
    label: "Hero showcase",
    description: "Lead with featured products and quick shop links.",
  },
  showProductFinder: {
    label: "Customer product finder",
    description: "Keyword, category and sort controls above the catalogue.",
  },
  showMiddleCategories: {
    label: "All-categories strip",
    description: "Centred icon links that jump to any category.",
  },
  showCategorySections: {
    label: "Category product sections",
    description: "Product rows for each enabled category section.",
  },
  showNewArrivals: {
    label: "New arrivals",
    description: "The most recent pieces added to the storefront.",
  },
  showBrands: {
    label: "Brand showcase",
    description: "The studios and labels carried by the store.",
  },
  showPromoBanners: {
    label: "Promotional banners",
    description: "Admin-managed HERO and PROMO placement banners.",
  },
  showNewsletter: {
    label: "Newsletter block",
    description: "Email signup call-to-action at the end of the page.",
  },
};

/** Safe fallback used by the server, storefront and client before settings load. */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: "default",
  siteName: SITE.name,
  navbarLogoUrl: null,
  navbarLogoPublicId: null,
  showHero: true,
  showProductFinder: true,
  showMiddleCategories: true,
  showCategorySections: true,
  showNewArrivals: true,
  showBrands: true,
  showPromoBanners: true,
  showNewsletter: true,
  categorySections: [],
  visibleCategoryIds: [],
  updatedAt: "",
};

export function isHomeSectionVisible(
  settings: SiteSettings | null | undefined,
  key: HomeSectionKey,
): boolean {
  return (settings ?? DEFAULT_SITE_SETTINGS)[key];
}

/** Category sections visible on the home page, in display order. */
export function visibleCategorySections(settings: SiteSettings | null | undefined) {
  if (!settings?.showCategorySections) return [];
  return [...(settings.categorySections ?? [])]
    .filter((section) => section.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
