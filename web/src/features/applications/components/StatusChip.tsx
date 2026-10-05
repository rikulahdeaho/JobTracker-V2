import { Box, Chip } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { getStatusChipStyles } from "../../../app/theme";
import type { ApplicationStatus } from "../types/application";
import { applicationStatusHexColor, applicationStatusLabel } from "../utils/applicationStatus";

type StatusChipProps = {
  status: ApplicationStatus;
};

export function StatusChip({ status }: StatusChipProps) {
  const theme = useTheme();

  return (
    <Chip
      label={applicationStatusLabel[status]}
      icon={<Box component="span" aria-hidden="true" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: ["Draft", "ToApply"].includes(status) ? "transparent" : "currentColor", border: "1px solid currentColor", ml: "8px !important" }} />}
      size="small"
      variant="outlined"
      sx={getStatusChipStyles(applicationStatusHexColor[status], theme.palette.mode)}
    />
  );
}
