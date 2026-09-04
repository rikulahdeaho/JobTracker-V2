import type { PaletteMode } from "@mui/material";
import { alpha, createTheme } from "@mui/material/styles";
import interUrl from "../assets/fonts/Inter-VariableFont_opsz,wght.ttf";

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
    mutedSurface: "#EEF2F8",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    border: "#E2E8F0",
  },
  dark: {
    background: "#020617",
    paper: "#111827",
    mutedSurface: "#1E293B",
    textPrimary: "#F1F5F9",
    textSecondary: "#B6C2D1",
    border: "#334155",
  },
};

export function createAppTheme(mode: ThemeMode) {
  const isDark = mode === "dark";
  const modePalette = isDark ? palette.dark : palette.light;
  const paperColor = modePalette.paper;
  const mutedSurfaceColor = modePalette.mutedSurface;

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
      fontFamily: '"Inter", "Segoe UI", "Helvetica Neue", sans-serif',
      fontSize: 15,
      h4: {
        fontSize: "2rem",
        fontWeight: 750,
        lineHeight: 1.18,
        letterSpacing: "-0.02em",
      },
      h5: {
        fontSize: "1.25rem",
        fontWeight: 750,
        lineHeight: 1.3,
        letterSpacing: "-0.015em",
      },
      h6: {
        fontSize: "1.125rem",
        fontWeight: 700,
        lineHeight: 1.35,
        letterSpacing: "-0.01em",
      },
      subtitle1: {
        fontSize: "1rem",
        fontWeight: 650,
        lineHeight: 1.5,
      },
      subtitle2: {
        fontSize: "0.9375rem",
        fontWeight: 650,
        lineHeight: 1.45,
      },
      body1: {
        fontSize: "1rem",
        lineHeight: 1.6,
      },
      body2: {
        fontSize: "0.9375rem",
        lineHeight: 1.55,
      },
      caption: {
        fontSize: "0.8125rem",
        lineHeight: 1.4,
      },
      overline: {
        fontSize: "0.75rem",
        fontWeight: 800,
        lineHeight: 1.35,
        letterSpacing: "0.08em",
      },
      button: {
        fontSize: "0.875rem",
        fontWeight: 700,
        lineHeight: 1.4,
        textTransform: "none",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          "@font-face": {
            fontFamily: "Inter",
            fontStyle: "normal",
            fontWeight: "100 900",
            fontDisplay: "swap",
            src: `url(${interUrl}) format("truetype")`,
          },
          body: {
            backgroundColor: modePalette.background,
            color: modePalette.textPrimary,
            fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
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
            borderRadius: 10,
            backgroundColor: paperColor,
            backgroundImage: "none",
            boxShadow: isDark ? "none" : `0 1px 2px ${alpha("#0F172A", 0.035)}`,
          },
        },
      },
      MuiCardActionArea: {
        styleOverrides: {
          root: {
            "&:hover .MuiCardActionArea-focusHighlight": {
              opacity: isDark ? 0.08 : 0.04,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: "none",
          },
          contained: {
            "&:hover": {
              boxShadow: isDark ? "none" : `0 8px 18px ${alpha(palette.primary, 0.16)}`,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontSize: "0.8125rem",
            fontWeight: 700,
            borderRadius: 999,
          },
          outlined: {
            backgroundColor: isDark ? alpha("#FFFFFF", 0.03) : alpha("#111827", 0.02),
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: "0.875rem",
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            fontSize: "0.8125rem",
            lineHeight: 1.4,
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
            borderRadius: 8,
            transition: "box-shadow 160ms ease, border-color 160ms ease",
            "&.Mui-focused": {
              boxShadow: `0 0 0 3px ${alpha(palette.primary, isDark ? 0.18 : 0.12)}`,
            },
          },
          notchedOutline: {
            borderColor: modePalette.border,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            backgroundColor: mutedSurfaceColor,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            border: `1px solid ${modePalette.border}`,
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
  return mode === "dark" ? palette.dark.paper : palette.light.paper;
}

export function getMutedSurfaceColor(mode: ThemeMode) {
  return mode === "dark" ? palette.dark.mutedSurface : palette.light.mutedSurface;
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
      border: "#1E293B",
      activeBackground: alpha(palette.primary, 0.24),
      activeText: "#FFFFFF",
      muted: "#64748B",
    };
  }

  return {
    background: "#FFFFFF",
    text: "#475569",
    eyebrow: palette.primary,
    border: "#E2E8F0",
    activeBackground: alpha(palette.primary, 0.12),
    activeText: palette.primary,
    muted: "#94A3B8",
  };
}

export function getStatusChipStyles(statusColor: string, mode: ThemeMode) {
  return {
    bgcolor: alpha(statusColor, mode === "dark" ? 0.2 : 0.1),
    color: mode === "dark" ? "#F8FAFC" : statusColor,
    borderColor: alpha(statusColor, mode === "dark" ? 0.46 : 0.28),
    "& .MuiChip-label": {
      px: 1,
    },
  };
}

export function getSemanticChipStyles(color: string, mode: ThemeMode) {
  return {
    bgcolor: alpha(color, mode === "dark" ? 0.18 : 0.08),
    color: mode === "dark" ? "#F8FAFC" : color,
    borderColor: alpha(color, mode === "dark" ? 0.42 : 0.24),
  };
}
