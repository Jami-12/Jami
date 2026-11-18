import type { Metadata } from "next";

import { BannerForm } from "@/components/admin/banners";

export const metadata: Metadata = { title: "New banner" };

export default function NewBannerPage() {
  return <BannerForm />;
}
