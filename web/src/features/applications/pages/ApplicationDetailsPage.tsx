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
import { applicationMethodLabels, followUpModeLabels } from "../utils/applicationContact";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../../../components/ui/PageSection";
import { ApplicationEventDialog } from "../components/ApplicationEventDialog";
import { ApplicationFormDialog } from "../components/ApplicationFormDialog";
import { ApplicationDataState } from "../components/ApplicationDataState";
import { useApplicationQuery } from "../api/applicationQueries";
import { getApiErrorMessage, isNotFoundError } from "../../../lib/apiClient";
import { NextActionChip } from "../components/NextActionChip";
import { TimelineEventList } from "../components/TimelineEventList";
import { StatusChip } from "../components/StatusChip";
import { useApplications } from "../context/ApplicationsContext";
import type { JobApplicationFormValues } from "../types/application";
import { toApplicationFormValues } from "../utils/applicationForm";
import { getApplicationNextAction } from "../utils/applicationNextAction";
import { formatApplicationDate } from "../utils/applicationPresentation";
import { getApplicationTimelineEvents } from "../utils/applicationWorkflow";

export function ApplicationDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateApplication, deleteApplication } = useApplications();
  const query = useApplicationQuery(id);
  const [eventOpen, setEventOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isReviewSaving, setIsReviewSaving] = useState(false);
  const application = query.data;

  if (query.isPending || isNotFoundError(query.error) || !application) {
    return (
      <PageShell>
        <Stack gap={2}>
          <Button
            component={RouterLink}
            to="/applications"
            startIcon={<ArrowBackOutlinedIcon />}
            sx={{ alignSelf: "flex-start" }}
          >
            Back to applications
          </Button>
          {isNotFoundError(query.error) || !id ? (
            <Alert severity="warning">Application not found.</Alert>
          ) : (
            <ApplicationDataState
              isPending={query.isPending}
              error={query.error}
              onRetry={() => { void query.refetch(); }}
            />
          )}
        </Stack>
      </PageShell>
    );
  }

  const nextAction = getApplicationNextAction(application);
  const timelineEvents = getApplicationTimelineEvents(application);
  const companyInitial = application.companyName.trim().charAt(0).toUpperCase();

  const handleUpdateApplication = async (values: JobApplicationFormValues) => {
    await updateApplication(application.id, values);
    setEditOpen(false);
  };

  const handleDeleteApplication = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteApplication(application.id);
      navigate("/applications", { replace: true });
    } catch (error) {
      setDeleteError(getApiErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageShell>
      <Stack gap={2.5}>
        <ApplicationDataState isPending={false} error={query.error} onRetry={() => { void query.refetch(); }} />
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
                  onClick={() => { setDeleteError(null); setDeleteOpen(true); }}
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
                  {nextAction.needsAttention ? (
                    <Chip label="Needs attention" color="secondary" variant="outlined" />
                  ) : null}
                  {nextAction.needsStatusReview ? <>
                    <Button disabled={isReviewSaving} onClick={() => {
                      setReviewMessage("Kept active. Review status remains available until you record new communication or change status.");
                    }}>Keep active</Button>
                    <Button disabled={isReviewSaving} color="warning" onClick={async () => {
                      setIsReviewSaving(true);
                      setReviewError(null);
                      try {
                        await updateApplication(application.id, { ...toApplicationFormValues(application), status: "Ghosted" });
                        setReviewMessage(null);
                      } catch (error) { setReviewError(getApiErrorMessage(error)); }
                      finally { setIsReviewSaving(false); }
                    }}>Mark as ghosted</Button>
                  </> : null}
                </Stack>
                {reviewMessage && <Alert severity="info" sx={{ mt: 1 }}>{reviewMessage}</Alert>}
                {reviewError && <Alert severity="error" sx={{ mt: 1 }}>{reviewError}</Alert>}
              </Box>
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
                      <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 760, whiteSpace: "pre-line", lineHeight: 1.7 }}>
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
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">Timeline</Typography>
                      <Button variant="contained" startIcon={<EditOutlinedIcon />} onClick={() => setEventOpen(true)}>Record activity</Button>
                    </Stack>
                    <Typography color="text.secondary">
                      Recorded application activity. Status changes are saved automatically.
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
                  <Stack gap={1.75}>
                    <Typography variant="h6">Quick facts</Typography>
                    <Divider />
                    <DetailCard label="Application method" value={applicationMethodLabels[application.applicationMethod] ?? "Unknown"} />
                    <DetailCard label="Contact person" value={application.contactPerson || "Not specified"} />
                    <DetailCard label="Contact email" value={application.contactEmail || "Not specified"} />
                    <DetailCard label="Follow-up preference" value={followUpModeLabels[application.followUpMode] ?? "Unknown"} />
                    <FactRow icon={<PlaceOutlinedIcon fontSize="small" />} label="Location" value={application.location || "Location not specified"} />
                    <FactRow icon={<SourceOutlinedIcon fontSize="small" />} label="Source" value={application.source || "Source not specified"} />
                    <FactRow
                      icon={<CalendarTodayOutlinedIcon fontSize="small" />}
                      label="Deadline"
                      value={formatApplicationDate(application.deadline, "No deadline")}
                    />
                    <DetailCard label="Salary range" value={application.salaryRange || "Not specified"} />
                    <DetailCard label="Applied date" value={formatApplicationDate(application.appliedDate, "Not applied yet")} />
                    <DetailCard label="Created" value={formatApplicationDate(application.createdAt, "Unknown")} />
                    <DetailCard label="Updated" value={formatApplicationDate(application.updatedAt, "Unknown")} />
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
        {eventOpen && <ApplicationEventDialog application={application} onClose={() => setEventOpen(false)} />}
        {editOpen ? (
          <ApplicationFormDialog
            key={application.id}
            mode="edit"
            open={editOpen}
            initialValues={toApplicationFormValues(application)}
            onClose={() => setEditOpen(false)}
            onSubmit={handleUpdateApplication}
          />
        ) : null}
        <Dialog open={deleteOpen} onClose={isDeleting ? undefined : () => setDeleteOpen(false)}>
          <DialogTitle>Delete application?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This permanently deletes {application.companyName} - {application.jobTitle}.
            </DialogContentText>
            {deleteError ? <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert> : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteOpen(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDeleteApplication} disabled={isDeleting}>
              {isDeleting ? "Deleting…" : "Delete"}
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
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      gap={2}
      sx={{ py: 0.75, borderTop: 1, borderColor: "divider" }}
    >
      <Box>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
      </Box>
      <Typography sx={{ textAlign: "right", maxWidth: "60%" }}>{value}</Typography>
    </Stack>
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
