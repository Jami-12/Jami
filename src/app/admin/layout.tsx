import type { Metadata } from "next";

import { AdminLayout } from "@/components/dashboard/dashboard-layouts";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
