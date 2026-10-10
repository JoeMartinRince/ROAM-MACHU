import { useEffect, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";
export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "theme";
const LIGHT_THEME_COLOR = "#FF4D16";
const DARK_THEME_COLOR = "#000000";

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function getThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "system";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
  } catch {
    // ignore storage errors
  }
  return "system";
}

export function getResolvedTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const mode = getThemeMode();
  if (mode === "dark") return "dark";
  if (mode === "light") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function syncThemeDom(theme: Theme) {
  if (typeof document === "undefined") return;
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", isDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
  }
}

export function setThemeMode(mode: ThemeMode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // ignore storage errors
  }
  syncThemeDom(getResolvedTheme());
  notify();
}

export function setTheme(next: Theme) {
  setThemeMode(next);
}

export function toggleTheme() {
  const current = getResolvedTheme();
  setThemeMode(current === "dark" ? "light" : "dark");
}

function subscribe(callback: () => void) {
  listeners.add(callback);

  if (typeof window === "undefined") {
    return () => listeners.delete(callback);
  }

  const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
  const onMediaChange = () => {
    if (getThemeMode() === "system") {
      syncThemeDom(mql.matches ? "dark" : "light");
      callback();
    }
  };
  mql?.addEventListener?.("change", onMediaChange);

  const observer = new MutationObserver(() => {
    callback();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => {
    listeners.delete(callback);
    mql?.removeEventListener?.("change", onMediaChange);
    observer.disconnect();
  };
}

function getSnapshot(): string {
  if (typeof document === "undefined") return "system:light";
  const mode = getThemeMode();
  const resolved = document.documentElement.classList.contains("dark")
    ? "dark"
    : getResolvedTheme();
  return `${mode}:${resolved}`;
}

function getServerSnapshot(): string {
  return "system:light";
}

export function useTheme() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [mode, theme] = snapshot.split(":") as [ThemeMode, Theme];

  useEffect(() => {
    syncThemeDom(getResolvedTheme());
  }, [snapshot]);

  return {
    mode,
    theme,
    isDark: theme === "dark",
    setThemeMode,
    setTheme,
    toggleTheme,
  };
}
