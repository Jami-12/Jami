/** Presentation settings returned by the public `/settings` endpoint. */
export interface HomeCategorySection {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  categoryImage: string | null;
  isVisible: boolean;
  sortOrder: number;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  navbarLogoUrl: string | null;
  navbarLogoPublicId: string | null;
  showHero: boolean;
  showProductFinder: boolean;
  showMiddleCategories: boolean;
  showCategorySections: boolean;
  showNewArrivals: boolean;
  showBrands: boolean;
  showPromoBanners: boolean;
  showNewsletter: boolean;
  /** Dashboard-controlled payment methods. */
  codEnabled: boolean;
  bkashEnabled: boolean;
  nagadEnabled: boolean;
  stripeEnabled: boolean;
  categorySections: HomeCategorySection[];
  /** Category ids with a visible home section, supplied by the API. */
  visibleCategoryIds: string[];
  updatedAt: string;
}

export interface HomeCategorySectionInput {
  categoryId: string;
  isVisible?: boolean;
  sortOrder?: number;
}

/** All fields are optional. `logo` is sent as a multipart file by the client. */
export interface UpdateSettingsInput {
  siteName?: string | null;
  navbarLogoUrl?: string | null;
  navbarLogoPublicId?: string | null;
  logo?: File | null;
  showHero?: boolean;
  showProductFinder?: boolean;
  showMiddleCategories?: boolean;
  showCategorySections?: boolean;
  showNewArrivals?: boolean;
  showBrands?: boolean;
  showPromoBanners?: boolean;
  showNewsletter?: boolean;
  codEnabled?: boolean;
  bkashEnabled?: boolean;
  nagadEnabled?: boolean;
  stripeEnabled?: boolean;
  categorySections?: HomeCategorySectionInput[];
}
