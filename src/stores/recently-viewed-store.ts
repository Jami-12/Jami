"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface RecentlyViewedState {
  ids: string[];
  add: (productId: string) => void;
  clear: () => void;
}

const MAX_ITEMS = 8;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      ids: [],
      add: (productId) => {
        const ids = get().ids;
        // Re-visiting the same product must not rewrite (and re-persist) state.
        if (ids[0] === productId) return;
        set({
          ids: [productId, ...ids.filter((id) => id !== productId)].slice(
            0,
            MAX_ITEMS,
          ),
        });
      },
      clear: () => set({ ids: [] }),
    }),
    {
      name: "store-recently-viewed",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ ids: state.ids }),
    },
  ),
);
