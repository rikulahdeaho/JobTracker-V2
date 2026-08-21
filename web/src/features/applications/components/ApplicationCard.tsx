import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import {
  Divider,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { JobApplication } from "../types/application";
import { getApplicationNextAction } from "../utils/applicationNextAction";
import { NextActionChip } from "./NextActionChip";
import { StatusChip } from "./StatusChip";

type ApplicationCardProps = {
  application: JobApplication;
};

function formatKeyDate(application: JobApplication) {
  if (application.appliedDate) {
    return `Applied ${application.appliedDate}`;
  }

  if (application.deadline) {
    return `Deadline ${application.deadline}`;
  }

  return "Date pending";
}

function formatUpdatedDate(updatedAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(updatedAt));
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const nextAction = getApplicationNextAction(application);

  return (
    <Card sx={{ height: "100%" }}>
      <CardActionArea
        component={RouterLink}
        to={`/applications/${application.id}`}
        sx={{ height: "100%", alignItems: "stretch" }}
      >
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
            <div>
              <Typography variant="h6">{application.jobTitle}</Typography>
              <Typography color="text.secondary">{application.companyName}</Typography>
            </div>
            <StatusChip status={application.status} />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} gap={2} color="text.secondary">
            <Stack direction="row" gap={0.75} alignItems="center">
              <LocationOnOutlinedIcon fontSize="small" />
              <Typography variant="body2">{application.location}</Typography>
            </Stack>
            <Stack direction="row" gap={0.75} alignItems="center">
              <TodayOutlinedIcon fontSize="small" />
              <Typography variant="body2">{formatKeyDate(application)}</Typography>
            </Stack>
          </Stack>
          <Stack gap={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight={600}>
                Next action
              </Typography>
              <NextActionChip application={application} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {nextAction.description}
            </Typography>
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: "auto" }}>
            <div>
              <Typography variant="body2" color="text.secondary">
                Source: {application.source}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Updated {formatUpdatedDate(application.updatedAt)}
              </Typography>
            </div>
            <Stack direction="row" gap={0.5} alignItems="center" color="primary.main">
              <Typography variant="body2" fontWeight={600}>
                Open details
              </Typography>
              <ArrowOutwardIcon fontSize="small" />
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
