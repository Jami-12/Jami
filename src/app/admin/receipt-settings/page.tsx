import type { Metadata } from "next";

import { ReceiptSettingsForm } from "@/components/admin/settings";

export const metadata: Metadata = {
  title: "Receipt settings",
  robots: { index: false, follow: false },
};

export default function AdminReceiptSettingsPage() {
  return <ReceiptSettingsForm />;
}
