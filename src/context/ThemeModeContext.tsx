// src/context/ThemeModeContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "@mui/material";
import { loadThemeMode, saveThemeMode } from "../utils/storage";

export type ThemeMode = "light" | "dark" | "system";

type ThemeModeContextValue = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  resolvedMode: "light" | "dark";
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => loadThemeMode());

  // Sync if theme is changed in another tab/window
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "themeMode") return;
      setThemeModeState(loadThemeMode());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const resolvedMode: "light" | "dark" = useMemo(() => {
    if (themeMode === "system") return prefersDark ? "dark" : "light";
    return themeMode;
  }, [themeMode, prefersDark]);

  function setThemeMode(mode: ThemeMode) {
    setThemeModeState(mode);
    saveThemeMode(mode);
  }

  return (
    <ThemeModeContext.Provider value={{ themeMode, setThemeMode, resolvedMode }}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("ThemeModeContext missing");
  return ctx;
}