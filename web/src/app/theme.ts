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
    background: "#131211",
    paper: "#181716",
    mutedSurface: "#1E1C1A",
    textPrimary: "#F5F3F0",
    textSecondary: "#A8A29E",
    border: "#262422",
  },
};

export function createAppTheme(mode: ThemeMode) {
  const isDark = mode === "dark";
  const modePalette = isDark ? palette.dark : palette.light;
  const paperColor = modePalette.paper;
  const mutedSurfaceColor = modePalette.mutedSurface;
  const primaryColor = isDark ? "#3B82F6" : palette.primary;
  const successColor = isDark ? "#10B981" : palette.success;
  const warningColor = isDark ? "#F59E0B" : palette.warning;
  const errorColor = isDark ? "#F43F5E" : palette.error;
  const infoColor = isDark ? "#38BDF8" : "#0891B2";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryColor,
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
        main: successColor,
        light: "#4ADE80",
        dark: "#15803D",
        contrastText: "#FFFFFF",
      },
      warning: {
        main: warningColor,
        light: "#FBBF24",
        dark: "#B45309",
        contrastText: "#0F172A",
      },
      error: {
        main: errorColor,
        light: "#F87171",
        dark: "#B91C1C",
        contrastText: "#FFFFFF",
      },
      info: {
        main: infoColor,
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
        fontSize: "0.9rem",
        fontWeight: 700,
        lineHeight: 1.9,
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
            WebkitFontSmoothing: "antialiased",
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
              backgroundColor: isDark ? "#2563EB" : undefined,
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
            backgroundColor: isDark ? mutedSurfaceColor : alpha("#111827", 0.02),
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
            backgroundColor: isDark ? paperColor : "#FFFFFF",
            borderRadius: 8,
            minHeight: 48,
            transition: "box-shadow 160ms ease, border-color 160ms ease",
            "&.MuiInputBase-multiline": {
              minHeight: 0,
            },
            "& .MuiOutlinedInput-input": {
              fontSize: "0.9375rem",
            },
            "&.Mui-focused": {
              boxShadow: isDark ? "none" : `0 0 0 3px ${alpha(palette.primary, 0.12)}`,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: primaryColor,
              },
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
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? mutedSurfaceColor : paperColor,
            border: isDark ? `1px solid ${modePalette.border}` : undefined,
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
      background: "#181716",
      text: "#A8A29E",
      eyebrow: "#F5F3F0",
      border: "#262422",
      activeBackground: "#3B82F6",
      activeText: "#FFFFFF",
      hoverBackground: "#1E1C1A",
      workspaceBackground: "#1E1C1A",
      muted: "#6E6761",
    };
  }

  return {
    background: "#FFFFFF",
    text: "#475569",
    eyebrow: palette.primary,
    border: "#E2E8F0",
    activeBackground: alpha(palette.primary, 0.12),
    activeText: palette.primary,
    hoverBackground: alpha(palette.primary, 0.08),
    workspaceBackground: alpha(palette.primary, 0.08),
    muted: "#64748B",
  };
}

export function getStatusChipStyles(statusColor: string, mode: ThemeMode) {
  const chipColor = mode === "dark" ? getDarkChipColor(statusColor) : statusColor;

  return {
    bgcolor: alpha(chipColor, mode === "dark" ? 0.12 : 0.1),
    color: chipColor,
    borderColor: alpha(chipColor, mode === "dark" ? 0.24 : 0.28),
    "& .MuiChip-label": {
      px: 1,
    },
  };
}

export function getSemanticChipStyles(color: string, mode: ThemeMode) {
  return {
    bgcolor: alpha(color, mode === "dark" ? 0.12 : 0.08),
    color,
    borderColor: alpha(color, mode === "dark" ? 0.24 : 0.24),
  };
}

function getDarkChipColor(statusColor: string): string {
  const darkColors: Record<string, string> = {
    "#64748B": "#A8A29E",
    "#0891B2": "#38BDF8",
    "#2563EB": "#60A5FA",
    "#7C3AED": "#C4B5FD",
    "#D97706": "#FBBF24",
    "#16A34A": "#34D399",
    "#DC2626": "#FB7185",
  };

  return darkColors[statusColor] ?? statusColor;
}
