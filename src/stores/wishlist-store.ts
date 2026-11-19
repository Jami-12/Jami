"use client";

import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { wishlistApi } from "@/lib/api/services";
import { getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

interface WishlistState {
  ids: string[];
  syncing: boolean;
  hydrated: boolean;
  toggle: (productId: string, productName?: string) => Promise<void>;
  add: (productId: string) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  has: (productId: string) => boolean;
  syncFromServer: () => Promise<void>;
  reset: () => void;
  setHydrated: (value: boolean) => void;
}

function isCustomer(): boolean {
  return useAuthStore.getState().user?.role === "CUSTOMER";
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      syncing: false,
      hydrated: false,

      toggle: async (productId, productName) => {
        const exists = get().ids.includes(productId);
        if (exists) {
          await get().remove(productId);
          if (productName) toast.success(`${productName} removed from wishlist`);
          return;
        }
        await get().add(productId);
        if (productName) toast.success(`${productName} saved to wishlist`);
      },

      add: async (productId) => {
        if (isCustomer()) {
          set({ syncing: true });
          try {
            await wishlistApi.add(productId);
          } catch (error) {
            set({ syncing: false });
            toast.error(getErrorMessage(error, "Could not save this item"));
            return;
          }
          set({ syncing: false });
        }

        if (!get().ids.includes(productId)) {
          set({ ids: [...get().ids, productId] });
        }
      },

      remove: async (productId) => {
        if (isCustomer()) {
          set({ syncing: true });
          try {
            await wishlistApi.remove(productId);
          } catch (error) {
            set({ syncing: false });
            toast.error(getErrorMessage(error, "Could not remove this item"));
            return;
          }
          set({ syncing: false });
        }
        set({ ids: get().ids.filter((id) => id !== productId) });
      },

      has: (productId) => get().ids.includes(productId),

      syncFromServer: async () => {
        if (!isCustomer()) return;
        set({ syncing: true });
        try {
          const items = await wishlistApi.list();
          set({ ids: items.map((item) => item.productId), syncing: false });
        } catch {
          set({ syncing: false });
        }
      },

      reset: () => set({ ids: [] }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "store-wishlist",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ ids: state.ids }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
