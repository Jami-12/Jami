import type { CouponValidation, SiteSettings } from "@/types";

/** Mirrors the server's `roundMoney` so estimates match the charged total. */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Store-wide flat discount. Mirrors the server's `calculateFlatDiscountAmount`:
 * the optional minimum applies to the product subtotal, and the discount can
 * never exceed that subtotal.
 */
export function computeFlatDiscount(
  subtotal: number,
  settings: Pick<
    SiteSettings,
    | "flatDiscountEnabled"
    | "flatDiscountType"
    | "flatDiscountValue"
    | "flatDiscountMinAmount"
  >,
): number {
  if (
    !settings.flatDiscountEnabled ||
    !settings.flatDiscountType ||
    settings.flatDiscountValue <= 0
  ) {
    return 0;
  }

  if (
    settings.flatDiscountMinAmount !== null &&
    subtotal < settings.flatDiscountMinAmount
  ) {
    return 0;
  }

  const raw =
    settings.flatDiscountType === "PERCENTAGE"
      ? (subtotal * settings.flatDiscountValue) / 100
      : settings.flatDiscountValue;

  return roundMoney(Math.min(Math.max(raw, 0), Math.max(subtotal, 0)));
}

/**
 * Shipping is based on the PRODUCT SUBTOTAL only. A disabled fee always means
 * free shipping, regardless of the configured threshold.
 */
export function computeShipping(
  subtotal: number,
  settings: Pick<
    SiteSettings,
    "shippingEnabled" | "shippingFee" | "freeShippingThreshold"
  >,
): number {
  if (!settings.shippingEnabled || subtotal <= 0) return 0;
  if (subtotal >= settings.freeShippingThreshold) return 0;
  return roundMoney(Math.max(0, settings.shippingFee));
}

export function computeCouponDiscount(
  coupon: CouponValidation["coupon"] | null,
  subtotal: number,
): number {
  if (!coupon) return 0;
  let discount = 0;
  if (coupon.discountPercent !== null) {
    discount = roundMoney((subtotal * coupon.discountPercent) / 100);
  } else if (coupon.discountAmount !== null) {
    discount = coupon.discountAmount;
  }
  if (coupon.maxDiscount !== null) discount = Math.min(discount, coupon.maxDiscount);
  return roundMoney(Math.min(discount, Math.max(subtotal, 0)));
}

export interface CartTotals {
  subtotal: number;
  /** Automatic store-wide discount from dashboard settings. */
  flatDiscount: number;
  /** Coupon discount, resolved against the post-flat-discount subtotal. */
  couponDiscount: number;
  totalDiscount: number;
  shipping: number;
  total: number;
}

/** Single client-side estimate of the totals recalculated by the server. */
export function computeCartTotals(
  subtotal: number,
  settings: SiteSettings,
  coupon: CouponValidation["coupon"] | null = null,
): CartTotals {
  const flatDiscount = computeFlatDiscount(subtotal, settings);
  const couponDiscount = computeCouponDiscount(
    coupon,
    Math.max(0, subtotal - flatDiscount),
  );
  const totalDiscount = Math.min(subtotal, flatDiscount + couponDiscount);
  const shipping = computeShipping(subtotal, settings);

  return {
    subtotal,
    flatDiscount,
    couponDiscount,
    totalDiscount,
    shipping,
    total: roundMoney(Math.max(0, subtotal - totalDiscount) + shipping),
  };
}
