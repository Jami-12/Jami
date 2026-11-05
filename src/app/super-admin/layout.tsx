import type { Metadata } from "next";

import { SuperAdminLayout } from "@/components/dashboard/dashboard-layouts";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SuperAdminRootLayout({ children }: { children: React.ReactNode }) {
  return <SuperAdminLayout>{children}</SuperAdminLayout>;
}
