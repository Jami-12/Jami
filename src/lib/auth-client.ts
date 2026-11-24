"use client";

import { cartApi, wishlistApi } from "@/lib/api/services";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

/**
 * After a customer signs in, carry the local (guest) bag and wishlist into the
 * server-backed ones. Failures are ignored per item so a single unavailable
 * product never blocks sign-in.
 */
export async function adoptGuestState(): Promise<void> {
  const cartItems = useCartStore.getState().items;
  const wishlistIds = useWishlistStore.getState().ids;

  await Promise.allSettled(
    cartItems.map((item) =>
      cartApi.add({
        productId: item.productId,
        quantity: item.quantity,
        selectedSize: item.selectedSize ?? "",
        selectedColor: item.selectedColor ?? "",
      }),
    ),
  );

  await Promise.allSettled(wishlistIds.map((id) => wishlistApi.add(id)));

  await Promise.allSettled([
    useCartStore.getState().syncFromServer(),
    useWishlistStore.getState().syncFromServer(),
  ]);
}
