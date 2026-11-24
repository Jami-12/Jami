import { PAYMENT_METHOD_META, PAYMENT_STATUSES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import type {
  InitiatePaymentResult,
  PaymentMethod,
  PaymentStatus,
} from "@/types";

/** Methods that require a gateway step before the order can be paid. */
export const ONLINE_PAYMENT_METHODS = ["BKASH", "NAGAD", "CARD"] as const;

/** How often an in-flight payment is re-checked while the customer waits. */
export const PAYMENT_STATUS_REFRESH_INTERVAL_MS = 3_000;

/** Stop automatic polling after this long so a stuck payment does not poll forever. */
export const PAYMENT_STATUS_POLL_TIMEOUT_MS = 90_000;

export function isOnlinePaymentMethod(
  method: PaymentMethod | null | undefined,
): boolean {
  return Boolean(
    method &&
      (ONLINE_PAYMENT_METHODS as readonly PaymentMethod[]).includes(method),
  );
}

export function isRedirectPaymentMethod(
  method: PaymentMethod,
): method is "BKASH" | "NAGAD" {
  return method === "BKASH" || method === "NAGAD";
}

export function isPaymentInProgress(
  status: PaymentStatus | null | undefined,
): boolean {
  return status === "PENDING" || status === "PROCESSING";
}

/**
 * Validates a provider redirect URL returned by the backend before the browser
 * is sent to it.
 *
 * bKash only works over HTTPS (its sandbox and production checkouts are both
 * HTTPS). Nagad's sandbox is served over HTTP, so HTTP is accepted for Nagad
 * but not for other methods. Everything that is not HTTP(S) is rejected so a
 * malformed or injected URL can never execute in the current page.
 */
export function getSafePaymentRedirectUrl(
  redirectUrl: string | null | undefined,
  method: PaymentMethod,
): string | null {
  if (typeof redirectUrl !== "string" || redirectUrl.trim().length === 0) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(redirectUrl.trim());
  } catch {
    return null;
  }

  // Reject URLs with embedded credentials; providers never need them.
  if (parsed.username || parsed.password) return null;

  if (parsed.protocol === "https:") {
    return parsed.toString();
  }

  if (parsed.protocol === "http:" && method === "NAGAD") {
    return parsed.toString();
  }

  return null;
}

/**
 * bKash responses use `bkashURL`; other gateways use `redirectUrl`. Prefer the
 * canonical field so a missing alias can never send the browser to the wrong
 * place.
 */
export function getPaymentRedirectUrl(
  result: InitiatePaymentResult,
  method: PaymentMethod,
): string | null {
  const candidate =
    method === "BKASH"
      ? (result.bkashURL ?? result.redirectUrl)
      : result.redirectUrl;

  return getSafePaymentRedirectUrl(candidate, method);
}

/**
 * Guards against an unexpected or partial initiation response. The returned
 * value is the original API object; only its shape is checked.
 */
export function ensureInitiatePaymentResult(
  value: InitiatePaymentResult,
  expectedMethod: PaymentMethod,
): InitiatePaymentResult {
  if (!value || typeof value !== "object") {
    throw new Error("The payment provider returned an unexpected response.");
  }

  const payment = value.payment;
  if (
    !payment ||
    typeof payment !== "object" ||
    typeof payment.id !== "string" ||
    payment.id.length === 0
  ) {
    throw new Error(
 "The payment provider response is missing the payment record.",
    );
  }

  if (value.method !== expectedMethod || payment.method !== expectedMethod) {
    throw new Error(
 "The payment provider response does not match this order's payment method.",
    );
  }

  if (
    typeof value.paymentStatus !== "string" ||
    !(PAYMENT_STATUSES as string[]).includes(value.paymentStatus)
  ) {
    throw new Error(
 "The payment provider response is missing a valid payment status.",
    );
  }

  return value;
}

export function getPaymentStartErrorMessage(
  error: unknown,
  method: PaymentMethod,
  fallback?: string,
): string {
  const label = PAYMENT_METHOD_META[method]?.label ?? "Online";
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? (error as { status?: unknown }).status
      : undefined;

  if (status === 503) {
    const backendMessage = getErrorMessage(error, "").trim();
    return (
      backendMessage ||
      `${label} payments are not available right now. Choose another method or retry later.`
    );
  }

  return getErrorMessage(
    error,
    fallback ?? `The ${label} payment could not be started. Please try again.`,
  );
}
