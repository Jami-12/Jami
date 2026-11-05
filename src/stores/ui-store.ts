"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { BASE_CURRENCY, USD_TO_BDT } from "@/lib/constants";

export type DisplayCurrency = "BDT" | "USD";

interface UiState {
  mobileNavOpen: boolean;
  searchOpen: boolean;
  cartOpen: boolean;
  currency: DisplayCurrency;
  setMobileNav: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  setCartOpen: (open: boolean) => void;
  setCurrency: (currency: DisplayCurrency) => void;
  toggleCurrency: () => void;
  closeAll: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      mobileNavOpen: false,
      searchOpen: false,
      cartOpen: false,
      currency: BASE_CURRENCY === "USD" ? "USD" : "BDT",
      setMobileNav: (open) => set({ mobileNavOpen: open }),
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
      setSearchOpen: (open) => set({ searchOpen: open }),
      openCart: () => set({ cartOpen: true }),
      closeCart: () => set({ cartOpen: false }),
      setCartOpen: (open) => set({ cartOpen: open }),
      setCurrency: (currency) => set({ currency }),
      toggleCurrency: () =>
        set((state) => ({ currency: state.currency === "BDT" ? "USD" : "BDT" })),
      closeAll: () =>
        set({ mobileNavOpen: false, searchOpen: false, cartOpen: false }),
    }),
    {
      name: "aether-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ currency: state.currency }),
    },
  ),
);

/** Convert an amount in the backend base currency into the display currency. */
export function displayAmount(amount: number, currency: DisplayCurrency): number {
  if (BASE_CURRENCY === "USD" && currency === "BDT") return amount * USD_TO_BDT;
  if (BASE_CURRENCY === "BDT" && currency === "USD") return amount / USD_TO_BDT;
  return amount;
}
