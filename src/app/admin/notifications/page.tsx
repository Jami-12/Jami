import type { Metadata } from "next";

import { NotificationsView } from "@/components/account/notifications-view";

export const metadata: Metadata = { title: "Notifications" };

export default function AdminNotificationsPage() {
  return <NotificationsView />;
}
