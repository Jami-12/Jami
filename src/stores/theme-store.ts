"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemePreference = "light" | "dark" | "system";

interface ThemeState {
  theme: ThemePreference;
  hydrated: boolean;
  setTheme: (theme: ThemePreference) => void;
  toggle: () => void;
  setHydrated: (value: boolean) => void;
}

function resolveDark(theme: ThemePreference): boolean {
  if (theme === "system") {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return theme === "dark";
}

export function applyTheme(theme: ThemePreference): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolveDark(theme));
  document.documentElement.style.colorScheme = resolveDark(theme) ? "dark" : "light";
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",
      hydrated: false,
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      toggle: () => {
        const next = resolveDark(get().theme) ? "light" : "dark";
        set({ theme: next });
        applyTheme(next);
      },
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "store-theme",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        if (state) applyTheme(state.theme);
      },
    },
  ),
);
