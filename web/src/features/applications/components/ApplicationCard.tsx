import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import {
  Avatar,
  Box,
  Divider,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
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
  const companyInitial = application.companyName.trim().charAt(0).toUpperCase();

  return (
    <Card
      sx={{
        height: "100%",
        transition: "border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease",
        "&:hover": {
          borderColor: "primary.main",
          transform: "translateY(-1px)",
          boxShadow: (theme) =>
            theme.palette.mode === "dark" ? "none" : `0 10px 24px ${alpha(theme.palette.primary.main, 0.08)}`,
        },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/applications/${application.id}`}
        sx={{ height: "100%", alignItems: "stretch" }}
      >
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.25, height: "100%", p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
            <Stack direction="row" gap={1.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
              <Avatar
                variant="rounded"
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.22 : 0.1),
                  color: "primary.main",
                  fontWeight: 800,
                  border: 1,
                  borderColor: "divider",
                }}
              >
                {companyInitial}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ lineHeight: 1.25 }}>
                  {application.jobTitle}
                </Typography>
                <Typography color="text.secondary">{application.companyName}</Typography>
              </Box>
            </Stack>
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
