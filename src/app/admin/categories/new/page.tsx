import type { Metadata } from "next";

import { CategoryForm } from "@/components/admin/categories";

export const metadata: Metadata = { title: "New category" };

export default function NewCategoryPage() {
  return <CategoryForm />;
}
