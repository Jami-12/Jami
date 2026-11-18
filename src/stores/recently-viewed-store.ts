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
      add: (productId) =>
        set({
          ids: [productId, ...get().ids.filter((id) => id !== productId)].slice(
            0,
            MAX_ITEMS,
          ),
        }),
      clear: () => set({ ids: [] }),
    }),
    {
      name: "aether-recently-viewed",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ ids: state.ids }),
    },
  ),
);
