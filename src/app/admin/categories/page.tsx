import type { Metadata } from "next";

import { CategoriesAdmin } from "@/components/admin/categories";

export const metadata: Metadata = { title: "Categories" };

export default function AdminCategoriesPage() {
  return <CategoriesAdmin />;
}
