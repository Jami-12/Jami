import type { Notification, Role } from "@/types";

/**
 * Order notifications deep-link to the exact order. Admins land on the
 * management view (which can confirm the order), customers on their receipt
 * and tracking view.
 */
export function notificationHref(
  notification: Pick<Notification, "orderId">,
  role: Role | null | undefined,
): string | null {
  if (!notification.orderId) return null;
  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    return `/admin/orders?orderId=${encodeURIComponent(notification.orderId)}`;
  }
  if (role === "CUSTOMER") {
    return `/account/orders/${encodeURIComponent(notification.orderId)}`;
  }
  return null;
}
