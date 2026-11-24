/**
 * Guest orders have no login credential. The API returns a random token once
 * at checkout; we keep it in localStorage so the order and payment can still be
 * accessed after gateway redirects or a page refresh.
 */

const STORAGE_KEY = "ecommerce-guest-orders";
const LAST_ORDER_KEY = "ecommerce-last-guest-order";

interface StoredGuestOrder {
  id: string;
  token: string;
  orderNumber: string;
  createdAt: string;
}

const readOrders = (): StoredGuestOrder[] => {
  if (typeof window === "undefined") return [];

  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (entry): entry is StoredGuestOrder =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as StoredGuestOrder).id === "string" &&
        typeof (entry as StoredGuestOrder).token === "string",
    );
  } catch {
    return [];
  }
};

export function rememberGuestOrder(order: {
  id: string;
  guestToken?: string | null;
  orderNumber: string;
  createdAt: string;
}): void {
  if (typeof window === "undefined" || !order.guestToken) return;

  const next = readOrders().filter((entry) => entry.id !== order.id);
  next.push({
    id: order.id,
    token: order.guestToken,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
  });

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.localStorage.setItem(LAST_ORDER_KEY, order.id);
  } catch {
    // Private browsing can disable storage; checkout still returns the token.
  }
}

export function getGuestToken(orderId: string): string | null {
  if (typeof window === "undefined" || !orderId) return null;
  return readOrders().find((entry) => entry.id === orderId)?.token ?? null;
}

export function getLastGuestOrderId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LAST_ORDER_KEY);
  } catch {
    return null;
  }
}

export function isKnownGuestOrder(orderId: string): boolean {
  return getGuestToken(orderId) !== null;
}
