import { createContext } from "react";
import type { ThemeMode } from "./theme";

export type ThemeModeContextValue = {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
};

export const THEME_MODE_STORAGE_KEY = "jobtracker.themeMode";

export const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);
