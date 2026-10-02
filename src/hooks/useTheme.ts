import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/config";
import { getLocalStorage, setLocalStorage } from "@/lib/storage/cache";

export type Theme = "light" | "dark";

const THEME_KEY = `${STORAGE_KEYS.settings}:theme`;

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function readStoredTheme(): Theme {
  const raw = getLocalStorage(THEME_KEY);
  if (raw === "light" || raw === "dark") return raw;
  return systemTheme();
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  root.classList.toggle("dark", theme === "dark");
}

export function initTheme(): Theme {
  const theme = readStoredTheme();
  applyTheme(theme);
  return theme;
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document === "undefined") return "light";
    if (document.documentElement.classList.contains("dark")) return "dark";
    const current = document.documentElement.dataset.theme;
    if (current === "light" || current === "dark") return current;
    return initTheme();
  });

  useEffect(() => {
    applyTheme(theme);
    setLocalStorage(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  return { theme, toggleTheme, setTheme };
}
