"use client";

import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { ThemeProvider } from "./theme-provider";

import { authApi } from "@/lib/api/services";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Refreshes the persisted session against the API and hydrates the customer's
 * server-side cart/wishlist after sign-in. Server data remains authoritative.
 */
function SessionSync() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?.id);
  const role = useAuthStore((state) => state.user?.role);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;

    authApi
      .me()
      .then((user) => {
        if (!cancelled) useAuthStore.getState().setUser(user);
      })
      .catch(() => {
        if (!cancelled) useAuthStore.getState().clearSession();
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!userId || role !== "CUSTOMER") return;
    void useCartStore.getState().syncFromServer();
    void useWishlistStore.getState().syncFromServer();
  }, [userId, role]);

  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SessionSync />
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{ duration: 4200 }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
