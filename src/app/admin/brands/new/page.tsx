import type { Metadata } from "next";

import { BrandForm } from "@/components/admin/brands";

export const metadata: Metadata = { title: "New brand" };

export default function NewBrandPage() {
  return <BrandForm />;
}
