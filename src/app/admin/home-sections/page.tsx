import type { Metadata } from "next";

import { HomeSectionsControl } from "@/components/admin/home-sections";

export const metadata: Metadata = {
  title: "Home sections · Admin",
  description: "Control which sections appear on the storefront home page.",
  robots: { index: false, follow: false },
};

export default function AdminHomeSectionsPage() {
  return <HomeSectionsControl />;
}
