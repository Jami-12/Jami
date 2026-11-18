import type { Metadata } from "next";

import { BrandForm } from "@/components/admin/brands";

export const metadata: Metadata = { title: "Edit brand" };

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BrandForm brandId={id} />;
}
