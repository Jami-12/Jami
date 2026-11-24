"use client";

import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { SiteSettingsProvider } from "./site-settings-provider";
import { SoundProvider } from "./sound-provider";
import { ThemeProvider } from "./theme-provider";

import { Toaster } from "@/components/ui/sonner";

import { authApi } from "@/lib/api/services";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { SiteSettings } from "@/types";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
      // Cached data stays usable on navigation; explicit invalidations after
      // mutations still refresh it. This avoids redundant requests on mount.
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});

/** Guards against StrictMode double-effects and repeated user changes. */
const syncedUsers = new Set<string>();
let lastVerifiedToken: string | null = null;

/**
 * Refreshes the persisted session against the API and hydrates the customer's
 * server-side cart/wishlist after sign-in. Server data remains authoritative.
 */
function SessionSync() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?.id);
  const role = useAuthStore((state) => state.user?.role);

  useEffect(() => {
    if (!accessToken || lastVerifiedToken === accessToken) return;
    lastVerifiedToken = accessToken;
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
    if (!userId || role !== "CUSTOMER" || syncedUsers.has(userId)) return;
    syncedUsers.add(userId);
    void useCartStore.getState().syncFromServer();
    void useWishlistStore.getState().syncFromServer();
  }, [userId, role]);

  return null;
}

function ThemedToaster() {
  return <Toaster />;
}

export function AppProviders({
  initialSettings = null,
  children,
}: {
  initialSettings?: SiteSettings | null;
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SiteSettingsProvider initialSettings={initialSettings}>
          <SessionSync />
          <SoundProvider />
          {children}
          <ThemedToaster />
        </SiteSettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
