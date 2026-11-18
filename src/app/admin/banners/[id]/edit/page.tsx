import type { Metadata } from "next";

import { BannerForm } from "@/components/admin/banners";

export const metadata: Metadata = { title: "Edit banner" };

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BannerForm bannerId={id} />;
}
