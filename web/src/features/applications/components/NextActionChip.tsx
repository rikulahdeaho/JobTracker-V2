import { Chip } from "@mui/material";
import type { JobApplication } from "../types/application";
import { getApplicationNextAction } from "../utils/applicationNextAction";

type NextActionChipProps = {
  application: JobApplication;
};

export function NextActionChip({ application }: NextActionChipProps) {
  const nextAction = getApplicationNextAction(application);

  return <Chip color={nextAction.color} label={nextAction.title} size="small" variant="outlined" />;
}
