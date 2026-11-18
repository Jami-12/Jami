import type { Metadata } from "next";
import { BannersAdmin } from "@/components/admin/banners";

export const metadata: Metadata = {
  title: "Banners · Admin",
  description: "Manage storefront banners and promotional displays.",
};

export default function AdminBannersPage() {
  return <BannersAdmin />;
}
