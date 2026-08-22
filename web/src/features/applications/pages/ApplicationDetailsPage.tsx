import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LaunchOutlinedIcon from "@mui/icons-material/LaunchOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined";
import {
  Alert,
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
  Link,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
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
    <PageShell maxWidth={1120}>
      <Stack gap={3}>
        <Button
          component={RouterLink}
          to="/applications"
          startIcon={<ArrowBackOutlinedIcon />}
          sx={{ alignSelf: "flex-start" }}
        >
          Back to applications
        </Button>
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

        <Card>
          <CardContent>
            <Stack gap={3}>
              <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" gap={2.5}>
                <Box>
                  <Typography variant="h4" gutterBottom>
                    {application.jobTitle}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {application.companyName}
                  </Typography>
                </Box>
                <Stack direction="row" gap={1} flexWrap="wrap">
                  <StatusChip status={application.status} />
                  <NextActionChip application={application} />
                </Stack>
              </Stack>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, xl: 7 }}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent>
                      <Stack gap={2}>
                        <Typography variant="h6">Next action</Typography>
                        <Typography fontWeight={600}>{nextAction.title}</Typography>
                        <Typography color="text.secondary">{nextAction.description}</Typography>
                        <Stack direction="row" gap={1} flexWrap="wrap">
                          {nextAction.isNeedsFollowUp ? (
                            <Chip label="Needs follow-up" color="secondary" variant="outlined" />
                          ) : null}
                          {nextAction.isGhostedRisk ? (
                            <Chip label="Ghosted risk" color="warning" variant="outlined" />
                          ) : null}
                        </Stack>
                        {(nextAction.isNeedsFollowUp || nextAction.isGhostedRisk) ? (
                          <List dense disablePadding>
                            {nextAction.isNeedsFollowUp ? (
                              <ListItem disableGutters>
                                <ListItemText primary="Needs follow-up attention" />
                              </ListItem>
                            ) : null}
                            {nextAction.isGhostedRisk ? (
                              <ListItem disableGutters>
                                <ListItemText primary="Older than 30 days without activity" />
                              </ListItem>
                            ) : null}
                          </List>
                        ) : null}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, xl: 5 }}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent>
                      <Stack gap={2}>
                        <Typography variant="h6">Quick facts</Typography>
                        <Stack direction="row" gap={1} alignItems="center">
                          <PlaceOutlinedIcon fontSize="small" color="action" />
                          <Typography>{application.location || "Location not specified"}</Typography>
                        </Stack>
                        <Stack direction="row" gap={1} alignItems="center">
                          <SourceOutlinedIcon fontSize="small" color="action" />
                          <Typography>{application.source || "Source not specified"}</Typography>
                        </Stack>
                        <Stack direction="row" gap={1} alignItems="center">
                          <CalendarTodayOutlinedIcon fontSize="small" color="action" />
                          <Typography>
                            Applied {application.appliedDate ?? "not yet"} • Deadline {application.deadline ?? "none"}
                          </Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                  <DetailCard label="Salary range" value={application.salaryRange || "Not specified"} />
                </Grid>
                <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                  <DetailCard label="Applied date" value={application.appliedDate ?? "Not applied yet"} />
                </Grid>
                <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                  <DetailCard label="Created" value={application.createdAt.slice(0, 10)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                  <DetailCard label="Updated" value={application.updatedAt.slice(0, 10)} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack gap={1}>
                        <Typography variant="overline" color="text.secondary">
                          Job URL
                        </Typography>
                        {application.jobUrl ? (
                          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                            <Link href={application.jobUrl} target="_blank" rel="noreferrer" underline="hover">
                              {application.jobUrl}
                            </Link>
                            <LaunchOutlinedIcon fontSize="small" color="action" />
                          </Stack>
                        ) : (
                          <Typography color="text.secondary">No job URL saved for this application.</Typography>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Divider />

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, lg: 5 }}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent>
                      <Stack gap={1.5}>
                        <Typography variant="h6">Notes</Typography>
                        <Typography color="text.secondary">
                          {application.notes || "No notes saved for this application yet."}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, lg: 7 }}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent>
                      <Stack gap={1.5}>
                        <Typography variant="h6">Job description</Typography>
                        <Typography color="text.secondary">
                          {application.jobDescription || "No job description saved for this application yet."}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack gap={1.5}>
                        <Typography variant="h6">Timeline</Typography>
                        <Typography color="text.secondary">
                          A mock history view of this application based on the current local data and status.
                        </Typography>
                        <TimelineEventList events={timelineEvents} />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Stack>
          </CardContent>
        </Card>
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
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        <Typography>{value}</Typography>
      </CardContent>
    </Card>
  );
}
