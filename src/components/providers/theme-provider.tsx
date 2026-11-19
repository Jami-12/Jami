"use client";

import * as React from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "store-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("light");
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        setThemeState(stored);
      } else {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        setThemeState(prefersDark ? "dark" : "light");
      }
    } catch {
      setThemeState("light");
    }
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable in private mode; the class still applies.
    }
  }, [theme, ready]);

  const setTheme = React.useCallback((next: Theme) => setThemeState(next), []);
  const toggleTheme = React.useCallback(
    () => setThemeState((current) => (current === "dark" ? "light" : "dark")),
    [],
  );

  const value = React.useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

export const THEME_SCRIPT = `(function(){try{var k='store-theme';var s=localStorage.getItem(k);var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`;
