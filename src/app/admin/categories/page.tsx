import type { Metadata } from "next";

import { TaxonomyAdmin } from "@/components/admin/taxonomy-admin";

export const metadata: Metadata = { title: "Categories" };

export default function AdminCategoriesPage() {
  return <TaxonomyAdmin mode="categories" />;
}
