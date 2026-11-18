import type { Metadata } from "next";

import { BrandsAdmin } from "@/components/admin/brands";

export const metadata: Metadata = { title: "Brands" };

export default function AdminBrandsPage() {
  return <BrandsAdmin />;
}
