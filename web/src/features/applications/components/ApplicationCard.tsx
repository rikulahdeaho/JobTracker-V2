import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { JobApplication } from "../types/application";
import { getApplicationNextAction } from "../utils/applicationNextAction";
import { formatApplicationDate } from "../utils/applicationPresentation";
import { NextActionChip } from "./NextActionChip";
import { StatusChip } from "./StatusChip";
import { ApplicationIdentity } from "./ApplicationIdentity";

type ApplicationCardProps = {
  application: JobApplication;
};

function formatKeyDate(application: JobApplication) {
  if (application.appliedDate) {
    return `Applied ${formatApplicationDate(application.appliedDate, "Not applied")}`;
  }

  if (application.deadline) {
    return `Deadline ${formatApplicationDate(application.deadline, "No deadline")}`;
  }

  return application.status === "Draft" || application.status === "ToApply"
    ? "Not applied yet"
    : "Applied date not recorded";
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const nextAction = getApplicationNextAction(application);

  return (
    <Card
      sx={{
        height: "100%",
        transition: "border-color 160ms ease",
        "&:hover": {
          borderColor: "primary.main",
        },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/applications/${application.id}`}
        sx={{ height: "100%", alignItems: "stretch" }}
      >
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.75, height: "100%", p: { xs: 2, md: 2.5 } }}>
          <Stack gap={1.5}>
            <ApplicationIdentity jobTitle={application.jobTitle} companyName={application.companyName} />
            <Box><StatusChip status={application.status} /></Box>
          </Stack>
          <Stack direction="row" flexWrap="wrap" gap={1.5} color="text.secondary">
            {application.location ? (
            <Stack direction="row" gap={0.75} alignItems="center" sx={{ minWidth: 0 }}>
              <LocationOnOutlinedIcon fontSize="small" />
              <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>{application.location}</Typography>
            </Stack>
            ) : null}
            <Stack direction="row" gap={0.75} alignItems="center">
              <TodayOutlinedIcon fontSize="small" />
              <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>{formatKeyDate(application)}</Typography>
            </Stack>
          </Stack>
          <Stack gap={1} sx={{ pt: 1.75, mt: 0.5, borderTop: 1, borderColor: "divider" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} flexWrap="wrap">
              <Typography variant="body2" fontWeight={600}>
                Next action
              </Typography>
              <NextActionChip application={application} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {nextAction.description}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end" gap={1.5} flexWrap="wrap" sx={{ mt: "auto", pt: 1 }}>
            <Box sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
              {application.source ? <Typography variant="caption" color="text.secondary">Source: {application.source}</Typography> : null}
              <Typography variant="caption" display="block" color="text.secondary" sx={{ fontVariantNumeric: "tabular-nums" }}>
                Updated {formatApplicationDate(application.updatedAt, "recently")}
              </Typography>
            </Box>
            <Stack direction="row" gap={0.5} alignItems="center" color="primary.main" sx={{ flexShrink: 0 }}>
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
