import { Chip } from "@mui/material";
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
      size="small"
      variant="outlined"
      sx={getStatusChipStyles(applicationStatusHexColor[status], theme.palette.mode)}
    />
  );
}
