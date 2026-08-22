import type { PaletteMode } from "@mui/material";
import { alpha, createTheme } from "@mui/material/styles";

export type ThemeMode = PaletteMode;

const palette = {
  primary: "#2563EB",
  secondary: "#7C3AED",
  success: "#16A34A",
  warning: "#D97706",
  error: "#DC2626",
  light: {
    background: "#F8FAFC",
    paper: "#FFFFFF",
    textPrimary: "#0F172A",
    textSecondary: "#64748B",
    border: "#E2E8F0",
  },
  dark: {
    background: "#0B1120",
    paper: "#111827",
    elevatedPaper: "#1E293B",
    textPrimary: "#E5E7EB",
    textSecondary: "#94A3B8",
    border: "#334155",
  },
};

export function createAppTheme(mode: ThemeMode) {
  const isDark = mode === "dark";
  const modePalette = isDark ? palette.dark : palette.light;
  const paperColor = isDark ? palette.dark.elevatedPaper : palette.light.paper;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: palette.primary,
        light: "#60A5FA",
        dark: "#1D4ED8",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: palette.secondary,
        light: "#A78BFA",
        dark: "#6D28D9",
        contrastText: "#FFFFFF",
      },
      success: {
        main: palette.success,
        light: "#4ADE80",
        dark: "#15803D",
        contrastText: "#FFFFFF",
      },
      warning: {
        main: palette.warning,
        light: "#FBBF24",
        dark: "#B45309",
        contrastText: "#0F172A",
      },
      error: {
        main: palette.error,
        light: "#F87171",
        dark: "#B91C1C",
        contrastText: "#FFFFFF",
      },
      info: {
        main: "#0891B2",
        light: "#22D3EE",
        dark: "#0E7490",
        contrastText: "#FFFFFF",
      },
      background: {
        default: modePalette.background,
        paper: paperColor,
      },
      text: {
        primary: modePalette.textPrimary,
        secondary: modePalette.textSecondary,
      },
      divider: modePalette.border,
    },
    shape: {
      borderRadius: 8,
    },
    spacing: 8,
    typography: {
      fontFamily: '"Segoe UI", "Helvetica Neue", sans-serif',
      h4: {
        fontWeight: 750,
        letterSpacing: 0,
      },
      h5: {
        fontWeight: 750,
        letterSpacing: 0,
      },
      h6: {
        fontWeight: 700,
        letterSpacing: 0,
      },
      button: {
        fontWeight: 700,
        textTransform: "none",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: modePalette.background,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            border: `1px solid ${modePalette.border}`,
            backgroundImage: "none",
            boxShadow: isDark ? "none" : `0 1px 2px ${alpha("#0F172A", 0.04)}`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 700,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: "small",
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? alpha("#FFFFFF", 0.03) : "#FFFFFF",
          },
          notchedOutline: {
            borderColor: modePalette.border,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  });
}

export const theme = createAppTheme("light");

export function getSurfaceColor(mode: ThemeMode) {
  return mode === "dark" ? palette.dark.elevatedPaper : palette.light.paper;
}

export function getMutedSurfaceColor(mode: ThemeMode) {
  return mode === "dark" ? alpha("#FFFFFF", 0.04) : alpha(palette.primary, 0.06);
}

export function getBorderColor(mode: ThemeMode) {
  return mode === "dark" ? palette.dark.border : palette.light.border;
}

export function getSidebarColors(mode: ThemeMode) {
  if (mode === "dark") {
    return {
      background: "#020617",
      text: "#CBD5E1",
      eyebrow: "#93C5FD",
      activeBackground: alpha(palette.primary, 0.24),
      activeText: "#FFFFFF",
    };
  }

  return {
    background: "#0F172A",
    text: "#CBD5E1",
    eyebrow: "#93C5FD",
    activeBackground: alpha("#93C5FD", 0.16),
    activeText: "#FFFFFF",
  };
}

export function getStatusChipStyles(statusColor: string, mode: ThemeMode) {
  return {
    bgcolor: alpha(statusColor, mode === "dark" ? 0.22 : 0.12),
    color: mode === "dark" ? "#F8FAFC" : statusColor,
    borderColor: alpha(statusColor, mode === "dark" ? 0.5 : 0.32),
    "& .MuiChip-label": {
      px: 1,
    },
  };
}
