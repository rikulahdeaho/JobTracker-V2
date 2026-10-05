import { Chip } from "@mui/material";
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
  const paletteColor = !nextAction.needsAttention
    ? theme.palette.text.secondary : theme.palette.primary.main;

  return (
    <Chip
      label={nextAction.title}
      size="small"
      variant="outlined"
      sx={{
        ...getSemanticChipStyles(paletteColor, theme.palette.mode),
        maxWidth: "100%",
        height: "auto",
        minHeight: 24,
        "& .MuiChip-label": { whiteSpace: "normal", overflowWrap: "anywhere", py: 0.25 },
      }}
    />
  );
}
