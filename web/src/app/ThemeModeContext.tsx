import { CssBaseline, ThemeProvider } from "@mui/material";
import type { PropsWithChildren } from "react";
import { useMemo, useState } from "react";
import { createAppTheme, type ThemeMode } from "./theme";
import {
  THEME_MODE_STORAGE_KEY,
  ThemeModeContext,
  type ThemeModeContextValue,
} from "./themeMode";

export function ThemeModeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<ThemeMode>(() => loadStoredThemeMode());
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const value = useMemo<ThemeModeContextValue>(
    () => ({
      mode,
      toggleMode: () => {
        setModeState((currentMode) => {
          const nextMode = currentMode === "light" ? "dark" : "light";
          saveThemeMode(nextMode);
          return nextMode;
        });
      },
      setMode: (nextMode) => {
        saveThemeMode(nextMode);
        setModeState(nextMode);
      },
    }),
    [mode],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

function loadStoredThemeMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedMode = window.localStorage.getItem(THEME_MODE_STORAGE_KEY);
  return storedMode === "dark" ? "dark" : "light";
}

function saveThemeMode(mode: ThemeMode) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
}
