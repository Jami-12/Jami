"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { settingsApi } from "@/lib/api/services";
import { DEFAULT_SITE_SETTINGS } from "@/lib/site-settings";
import type { SiteSettings } from "@/types";

export const SITE_SETTINGS_QUERY_KEY = ["settings"] as const;

interface SiteSettingsContextValue {
  settings: SiteSettings;
  /** Replace settings immediately after a successful admin save. */
  setSettings: (settings: SiteSettings) => void;
  /** Re-fetch from the API (used when server rendering could not reach it). */
  refresh: () => Promise<SiteSettings | null>;
}

const SiteSettingsContext = React.createContext<SiteSettingsContextValue>({
  settings: DEFAULT_SITE_SETTINGS,
  setSettings: () => undefined,
  refresh: async () => null,
});

/**
 * Single source of truth for storefront presentation settings.
 *
 * The root layout seeds the query cache from the server so the correct logo is
 * present on first paint. Client saves write straight into the same cache, and
 * every consumer (Brand, nav, footer, auth shell, dashboards) re-renders
 * immediately without a manual reload.
 */
export function SiteSettingsProvider({
  initialSettings,
  children,
}: {
  /** Fetched in the root layout so the correct logo is present on first paint. */
  initialSettings: SiteSettings | null;
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: SITE_SETTINGS_QUERY_KEY,
    queryFn: settingsApi.get,
    initialData: initialSettings ?? undefined,
    placeholderData: DEFAULT_SITE_SETTINGS,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const settings = query.data ?? DEFAULT_SITE_SETTINGS;

  React.useEffect(() => {
    if (initialSettings) {
      queryClient.setQueryData(SITE_SETTINGS_QUERY_KEY, initialSettings);
    }
  }, [initialSettings, queryClient]);

  const setSettings = React.useCallback(
    (next: SiteSettings) => {
      queryClient.setQueryData(SITE_SETTINGS_QUERY_KEY, next);
    },
    [queryClient],
  );

  const refresh = React.useCallback(async () => {
    try {
      const next = await settingsApi.get();
      queryClient.setQueryData(SITE_SETTINGS_QUERY_KEY, next);
      return next;
    } catch {
      return null;
    }
  }, [queryClient]);

  const value = React.useMemo(
    () => ({ settings, setSettings, refresh }),
    [settings, setSettings, refresh],
  );

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettingsContextValue {
  return React.useContext(SiteSettingsContext);
}
