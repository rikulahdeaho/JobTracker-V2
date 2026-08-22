import { Chip } from "@mui/material";
import type { ChipProps, Theme } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { getSemanticChipStyles } from "../../../app/theme";
import type { JobApplication } from "../types/application";
import { getApplicationNextAction } from "../utils/applicationNextAction";

type NextActionChipProps = {
  application: JobApplication;
};

export function NextActionChip({ application }: NextActionChipProps) {
  const theme = useTheme();
  const nextAction = getApplicationNextAction(application);
  const paletteColor = getPaletteColor(nextAction.color, theme);

  return (
    <Chip
      label={nextAction.title}
      size="small"
      variant="outlined"
      sx={getSemanticChipStyles(paletteColor, theme.palette.mode)}
    />
  );
}

function getPaletteColor(color: ChipProps["color"], theme: Theme): string {
  switch (color) {
    case "primary":
      return theme.palette.primary.main;
    case "secondary":
      return theme.palette.secondary.main;
    case "success":
      return theme.palette.success.main;
    case "warning":
      return theme.palette.warning.main;
    case "error":
      return theme.palette.error.main;
    case "info":
      return theme.palette.info.main;
    case "default":
    case undefined:
      return theme.palette.text.secondary;
  }
}
