"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AuthResult, Role, UserPublic } from "@/types";

interface AuthState {
  user: UserPublic | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;
  setSession: (session: AuthResult) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: UserPublic) => void;
  clearSession: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      hydrated: false,
      setSession: (session) =>
        set({
          user: session.user,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
        }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      clearSession: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
        }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "aether-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export const selectIsAuthenticated = (state: AuthState): boolean =>
  Boolean(state.accessToken && state.user);

export const selectRole = (state: AuthState): Role | null => state.user?.role ?? null;

export function hasRole(role: Role | null, allowed: Role[]): boolean {
  return Boolean(role && allowed.includes(role));
}
