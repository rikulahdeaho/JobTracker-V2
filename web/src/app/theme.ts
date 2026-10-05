import type { PaletteMode } from "@mui/material";
import { alpha, createTheme } from "@mui/material/styles";
import interUrl from "../assets/fonts/Inter-VariableFont_opsz,wght.ttf";

export type ThemeMode = PaletteMode;

const palette = {
  primary: "#235FC7",
  secondary: "#586672",
  success: "#166534",
  warning: "#92400E",
  error: "#B91C1C",
  light: {
    background: "#F3F5F6",
    paper: "#FFFFFF",
    mutedSurface: "#E9EEF2",
    textPrimary: "#222B34",
    textSecondary: "#586672",
    border: "#D7DFE5",
  },
  dark: {
    background: "#161B20",
    paper: "#1E252C",
    mutedSurface: "#252E37",
    textPrimary: "#EAF0F5",
    textSecondary: "#A8B5C1",
    border: "#35404C",
  },
};

export function createAppTheme(mode: ThemeMode) {
  const isDark = mode === "dark";
  const modePalette = isDark ? palette.dark : palette.light;
  const paperColor = modePalette.paper;
  const mutedSurfaceColor = modePalette.mutedSurface;
  const primaryColor = isDark ? "#89B4FF" : palette.primary;
  const successColor = isDark ? "#10B981" : palette.success;
  const warningColor = isDark ? "#F59E0B" : palette.warning;
  const errorColor = isDark ? "#FB7185" : palette.error;
  const infoColor = primaryColor;
  const filledTextColor = isDark ? "#122033" : "#FFFFFF";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryColor,
        light: "#60A5FA",
        dark: isDark ? "#A8C7FF" : "#194CA6",
        contrastText: filledTextColor,
      },
      secondary: {
        main: modePalette.textSecondary,
        light: isDark ? "#CDD6DF" : "#76818B",
        dark: isDark ? "#CDD6DF" : "#3F4D59",
        contrastText: filledTextColor,
      },
      success: {
        main: successColor,
        light: "#4ADE80",
        dark: isDark ? "#34D399" : "#166534",
        contrastText: filledTextColor,
      },
      warning: {
        main: warningColor,
        light: "#FBBF24",
        dark: isDark ? "#FBBF24" : "#92400E",
        contrastText: filledTextColor,
      },
      error: {
        main: errorColor,
        light: "#F87171",
        dark: isDark ? "#FDA4AF" : "#991B1B",
        contrastText: filledTextColor,
      },
      info: {
        main: infoColor,
        light: "#22D3EE",
        dark: isDark ? "#7DD3FC" : "#155E75",
        contrastText: filledTextColor,
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
        fontSize: "1.875rem",
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
      },
      h5: {
        fontSize: "1.25rem",
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: "-0.015em",
      },
      h6: {
        fontSize: "1.125rem",
        fontWeight: 600,
        lineHeight: 1.35,
        letterSpacing: "-0.01em",
      },
      subtitle1: {
        fontSize: "1rem",
        fontWeight: 600,
        lineHeight: 1.5,
      },
      subtitle2: {
        fontSize: "0.9375rem",
        fontWeight: 600,
        lineHeight: 1.45,
      },
      body1: {
        fontSize: "1rem",
        lineHeight: 1.5,
      },
      body2: {
        fontSize: "0.875rem",
        lineHeight: 1.5,
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
        fontWeight: 600,
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
            caretColor: primaryColor,
            scrollbarColor: `${modePalette.textSecondary} ${modePalette.background}`,
            textUnderlineOffset: "0.2em",
          },
          "::selection": {
            backgroundColor: primaryColor,
            color: filledTextColor,
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: { overflowWrap: "anywhere" },
        },
      },
      MuiButtonBase: {
        styleOverrides: {
          root: {
            "&.Mui-focusVisible": {
              outline: `2px solid ${primaryColor}`,
              outlineOffset: 3,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: { root: { minWidth: 44, minHeight: 44 } },
      },
      MuiToggleButton: {
        styleOverrides: { root: { minHeight: 44 } },
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
            borderRadius: 8,
            backgroundColor: paperColor,
            backgroundImage: "none",
            boxShadow: "none",
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
            minHeight: 44,
          },
          contained: {
            "&:hover": {
              boxShadow: "none",
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontSize: "0.8125rem",
            fontWeight: 600,
            borderRadius: 4,
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
            transition: "border-color 160ms ease",
            "&.MuiInputBase-multiline": {
              minHeight: 0,
            },
            "& .MuiOutlinedInput-input": {
              fontSize: "0.9375rem",
              "&::placeholder": { color: modePalette.textSecondary, opacity: 1 },
            },
            "&.Mui-focused:not(.Mui-error)": {
              boxShadow: "none",
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
            backgroundColor: paperColor,
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
  const colors = palette[mode];
  const accent = mode === "dark" ? "#89B4FF" : palette.primary;
  return {
    background: colors.background,
    text: colors.textSecondary,
    eyebrow: colors.textPrimary,
    border: colors.border,
    activeBackground: alpha(accent, 0.1),
    activeText: accent,
    hoverBackground: colors.mutedSurface,
    workspaceBackground: colors.mutedSurface,
    muted: colors.textSecondary,
  };
}

export function getStatusChipStyles(statusColor: string, mode: ThemeMode) {
  const chipColor = mode === "dark" ? getDarkChipColor(statusColor) : getLightChipColor(statusColor);

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
  const chipColor = mode === "dark" ? getDarkChipColor(color) : getLightChipColor(color);
  return {
    bgcolor: alpha(chipColor, mode === "dark" ? 0.12 : 0.08),
    color: chipColor,
    borderColor: alpha(chipColor, 0.24),
  };
}

function getLightChipColor(color: string): string {
  const lightColors: Record<string, string> = {
    "#64748B": "#475569",
    "#586672": "#586672",
    "#0891B2": "#0E7490",
    "#2563EB": "#1D4ED8",
    "#D97706": "#92400E",
    "#16A34A": "#166534",
    "#DC2626": "#B91C1C",
  };
  return lightColors[color] ?? color;
}

function getDarkChipColor(statusColor: string): string {
  const darkColors: Record<string, string> = {
    "#64748B": "#A8A29E",
    "#586672": "#A8B5C1",
    "#0891B2": "#38BDF8",
    "#2563EB": "#60A5FA",
    "#3B82F6": "#60A5FA",
    "#7C3AED": "#C4B5FD",
    "#D97706": "#FBBF24",
    "#16A34A": "#34D399",
    "#DC2626": "#FB7185",
  };

  return darkColors[statusColor] ?? statusColor;
}
