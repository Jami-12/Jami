"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { playClickSound } from "@/lib/click-sound";

interface SoundState {
  /** True when interface sounds are audible. */
  enabled: boolean;
  toggle: () => void;
  setEnabled: (enabled: boolean) => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      enabled: true,
      toggle: () => {
        const next = !get().enabled;
        set({ enabled: next });
        if (next) playClickSound("toggle");
      },
      setEnabled: (enabled) => set({ enabled }),
    }),
    { name: "store-sound" },
  ),
);
