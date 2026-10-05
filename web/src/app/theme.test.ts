import { decomposeColor, getContrastRatio } from "@mui/material/styles";
import { expect, it } from "vitest";
import { applicationStatusHexColor } from "../features/applications/utils/applicationStatus";
import { createAppTheme, getSemanticChipStyles, getSidebarColors, getStatusChipStyles } from "./theme";

function composite(background: string, surface: string): string {
  const { values: [red, green, blue, opacity = 1] } = decomposeColor(background);
  const { values: base } = decomposeColor(surface);
  return `rgb(${[red, green, blue].map((value, index) => value * opacity + base[index] * (1 - opacity)).join(",")})`;
}

it.each(["light", "dark"] as const)("keeps semantic labels and button states readable in %s mode", mode => {
  const theme = createAppTheme(mode);
  const surface = theme.palette.background.paper;
  for (const color of Object.values(applicationStatusHexColor)) {
    const chip = getStatusChipStyles(color, mode);
    expect(getContrastRatio(chip.color, composite(chip.bgcolor, surface))).toBeGreaterThanOrEqual(4.5);
  }
  for (const role of ["primary", "secondary", "success", "warning", "error", "info"] as const) {
    const palette = theme.palette[role];
    const chip = getSemanticChipStyles(palette.main, mode);
    expect(getContrastRatio(chip.color, composite(chip.bgcolor, surface))).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(palette.contrastText, palette.main)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(palette.contrastText, palette.dark)).toBeGreaterThanOrEqual(4.5);
  }
  const sidebar = getSidebarColors(mode);
  expect(getContrastRatio(sidebar.muted, sidebar.background)).toBeGreaterThanOrEqual(4.5);
  expect(getContrastRatio(sidebar.activeText, composite(sidebar.activeBackground, sidebar.background))).toBeGreaterThanOrEqual(4.5);
});
