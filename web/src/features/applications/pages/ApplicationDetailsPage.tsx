import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LaunchOutlinedIcon from "@mui/icons-material/LaunchOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { type ReactNode, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../../../components/ui/PageSection";
import { ApplicationFormDialog } from "../components/ApplicationFormDialog";
import { NextActionChip } from "../components/NextActionChip";
import { TimelineEventList } from "../components/TimelineEventList";
import { StatusChip } from "../components/StatusChip";
import { useApplications } from "../context/ApplicationsContext";
import type { JobApplicationFormValues } from "../types/application";
import { toApplicationFormValues } from "../utils/applicationForm";
import { getApplicationNextAction } from "../utils/applicationNextAction";
import { getApplicationTimelineEvents } from "../utils/applicationWorkflow";

export function ApplicationDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getApplicationById, updateApplication, deleteApplication } = useApplications();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const application = id ? getApplicationById(id) : undefined;

  if (!application) {
    return (
      <PageShell maxWidth={1120}>
        <Stack gap={2}>
          <Button
            component={RouterLink}
            to="/applications"
            startIcon={<ArrowBackOutlinedIcon />}
            sx={{ alignSelf: "flex-start" }}
          >
            Back to applications
          </Button>
          <Alert severity="warning">Application not found in the current mock dataset.</Alert>
        </Stack>
      </PageShell>
    );
  }

  const nextAction = getApplicationNextAction(application);
  const timelineEvents = getApplicationTimelineEvents(application);
  const companyInitial = application.companyName.trim().charAt(0).toUpperCase();

  const handleUpdateApplication = (values: JobApplicationFormValues) => {
    updateApplication(application.id, values);
    setEditOpen(false);
  };

  const handleDeleteApplication = () => {
    const deleted = deleteApplication(application.id);

    if (deleted) {
      navigate("/applications");
    }
  };

  return (
    <PageShell maxWidth={1180}>
      <Stack gap={2.5}>
        <Button
          component={RouterLink}
          to="/applications"
          startIcon={<ArrowBackOutlinedIcon />}
          sx={{ alignSelf: "flex-start" }}
        >
          Back to applications
        </Button>

        <Card>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              gap={2.5}
            >
              <Stack direction="row" gap={2} alignItems="flex-start">
                <Avatar
                  variant="rounded"
                  sx={(theme) => ({
                    width: 64,
                    height: 64,
                    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.24 : 0.1),
                    color: "primary.main",
                    fontWeight: 800,
                    fontSize: 28,
                    border: 1,
                    borderColor: "divider",
                  })}
                >
                  {companyInitial}
                </Avatar>
                <Box>
                  <Typography variant="h4" gutterBottom>
                    {application.jobTitle} at {application.companyName}
                  </Typography>
                  <Stack direction="row" gap={1} flexWrap="wrap">
                    <StatusChip status={application.status} />
                    <NextActionChip application={application} />
                  </Stack>
                </Box>
              </Stack>
              <Stack direction="row" gap={1.5} flexWrap="wrap">
                <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => setEditOpen(true)}>
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineOutlinedIcon />}
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={(theme) => ({
            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.18 : 0.1),
            borderColor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.38 : 0.22),
          })}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              gap={2}
            >
              <Box>
                <Typography variant="overline" color="primary.main">
                  Next action
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.25 }}>
                  {nextAction.title}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 720 }}>
                  {nextAction.description}
                </Typography>
                <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
                  {nextAction.isNeedsFollowUp ? (
                    <Chip label="Needs follow-up" color="secondary" variant="outlined" />
                  ) : null}
                  {nextAction.isGhostedRisk ? (
                    <Chip label="Ghosted risk" color="warning" variant="outlined" />
                  ) : null}
                </Stack>
              </Box>
              {application.jobUrl ? (
                <Button
                  href={application.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  variant="contained"
                  endIcon={<LaunchOutlinedIcon />}
                >
                  Open job ad
                </Button>
              ) : null}
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack gap={2.5}>
              <Card>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Stack gap={2}>
                    <Typography variant="h6">Description & notes</Typography>
                    <Divider />
                    <Box>
                      <Typography variant="overline" color="text.secondary">
                        Job description
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 0.75, whiteSpace: "pre-line", lineHeight: 1.7 }}>
                        {application.jobDescription || "No job description saved for this application yet."}
                      </Typography>
                    </Box>
                    <Box
                      sx={(theme) => ({
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.secondary.main, theme.palette.mode === "dark" ? 0.12 : 0.06),
                        border: 1,
                        borderColor: "divider",
                      })}
                    >
                      <Typography variant="overline" color="text.secondary">
                        My notes
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 0.75, whiteSpace: "pre-line", lineHeight: 1.7 }}>
                        {application.notes || "No notes saved for this application yet."}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
              <Card>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Stack gap={1.5}>
                    <Typography variant="h6">Timeline</Typography>
                    <Typography color="text.secondary">
                      A mock history view of this application based on the current local data and status.
                    </Typography>
                    <TimelineEventList events={timelineEvents} />
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack gap={2.5}>
              <Card>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Stack gap={2}>
                    <Typography variant="h6">Quick facts</Typography>
                    <Divider />
                    <FactRow icon={<PlaceOutlinedIcon fontSize="small" />} label="Location" value={application.location || "Location not specified"} />
                    <FactRow icon={<SourceOutlinedIcon fontSize="small" />} label="Source" value={application.source || "Source not specified"} />
                    <FactRow icon={<CalendarTodayOutlinedIcon fontSize="small" />} label="Deadline" value={application.deadline ?? "No deadline"} />
                    <DetailCard label="Salary range" value={application.salaryRange || "Not specified"} />
                    <DetailCard label="Applied date" value={application.appliedDate ?? "Not applied yet"} />
                    <DetailCard label="Created" value={application.createdAt.slice(0, 10)} />
                    <DetailCard label="Updated" value={application.updatedAt.slice(0, 10)} />
                    {application.jobUrl ? (
                      <Button
                        href={application.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        variant="outlined"
                        endIcon={<LaunchOutlinedIcon />}
                        fullWidth
                      >
                        Open job ad
                      </Button>
                    ) : (
                      <Typography color="text.secondary">No job URL saved for this application.</Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
        <ApplicationFormDialog
          mode="edit"
          open={editOpen}
          initialValues={toApplicationFormValues(application)}
          onClose={() => setEditOpen(false)}
          onSubmit={handleUpdateApplication}
        />
        <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
          <DialogTitle>Delete application?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This removes {application.companyName} - {application.jobTitle} from the current local state.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDeleteApplication}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </PageShell>
  );
}

type DetailItemProps = {
  label: string;
  value: string;
};

function DetailCard({ label, value }: DetailItemProps) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 1.75, "&:last-child": { pb: 1.75 } }}>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        <Typography>{value}</Typography>
      </CardContent>
    </Card>
  );
}

type FactRowProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

function FactRow({ icon, label, value }: FactRowProps) {
  return (
    <Stack direction="row" gap={1.25} alignItems="flex-start">
      <Box sx={{ color: "text.secondary", mt: 0.25 }}>{icon}</Box>
      <Box>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        <Typography>{value}</Typography>
      </Box>
    </Stack>
  );
}
