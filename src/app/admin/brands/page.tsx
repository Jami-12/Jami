import type { Metadata } from "next";

import { TaxonomyAdmin } from "@/components/admin/taxonomy-admin";

export const metadata: Metadata = { title: "Brands" };

export default function AdminBrandsPage() {
  return <TaxonomyAdmin mode="brands" />;
}
