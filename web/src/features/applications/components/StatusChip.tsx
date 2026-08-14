import { Chip } from "@mui/material";
import type { ApplicationStatus } from "../types/application";
import { applicationStatusColor, applicationStatusLabel } from "../utils/applicationStatus";

type StatusChipProps = {
  status: ApplicationStatus;
};

export function StatusChip({ status }: StatusChipProps) {
  return <Chip color={applicationStatusColor[status]} label={applicationStatusLabel[status]} size="small" />;
}
