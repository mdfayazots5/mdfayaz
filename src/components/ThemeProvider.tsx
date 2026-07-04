import React, { createContext, useContext, useEffect, useState } from "react";
import type { ThemeSet } from "../models/portfolio.model";
import { DEFAULT_THEME_SET, normalizeThemeSet } from "../config/theme-sets";

type Theme = "light" | "dark";

const MODE_KEY = "portfolio-theme";
const THEME_SET_KEY = "portfolio-theme-set";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  themeSet: ThemeSet;
  setThemeSet: (themeSet: ThemeSet) => void;
  /**
   * Apply the admin-managed site-wide default. No-op if the visitor already has a
   * local preference. Deliberately does NOT persist, so a later change to the admin
   * default still reaches inherited (first-time) visitors on their next load.
   */
  applyAdminDefault: (themeSet: string | null | undefined) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(MODE_KEY);
    return saved === "dark" ? "dark" : "light";
  });

  const [themeSet, setThemeSetState] = useState<ThemeSet>(() =>
    normalizeThemeSet(localStorage.getItem(THEME_SET_KEY) ?? DEFAULT_THEME_SET),
  );

  // Apply light/dark mode.
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem(MODE_KEY, theme);
  }, [theme]);

  // Apply palette variant via a data attribute the CSS variable blocks key off.
  // Note: this only syncs the DOM — it does NOT persist. Persistence happens in
  // `setThemeSet` (explicit user choice) so admin-derived defaults stay unpersisted
  // and a changed admin default still reaches first-time visitors on their next load.
  useEffect(() => {
    window.document.documentElement.setAttribute("data-theme-set", themeSet);
  }, [themeSet]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setThemeSet = (next: ThemeSet) => {
    const normalized = normalizeThemeSet(next);
    setThemeSetState(normalized);
    localStorage.setItem(THEME_SET_KEY, normalized);
  };

  const applyAdminDefault = (next: string | null | undefined) => {
    if (localStorage.getItem(THEME_SET_KEY) === null) {
      setThemeSetState(normalizeThemeSet(next));
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeSet, setThemeSet, applyAdminDefault }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
