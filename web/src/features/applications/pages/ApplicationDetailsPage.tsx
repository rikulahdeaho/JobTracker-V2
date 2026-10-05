import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LaunchOutlinedIcon from "@mui/icons-material/LaunchOutlined";
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
import { useState } from "react";
import { applicationMethodLabels, followUpModeLabels } from "../utils/applicationContact";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../../../components/ui/PageSection";
import { NextActionMark } from "../../../components/ui/NextActionMark";
import { ApplicationIdentity } from "../components/ApplicationIdentity";
import { ApplicationEventDialog } from "../components/ApplicationEventDialog";
import { ApplicationFormDialog } from "../components/ApplicationFormDialog";
import { ApplicationDataState } from "../components/ApplicationDataState";
import { useApplicationQuery } from "../api/applicationQueries";
import { getApiErrorMessage, isNotFoundError } from "../../../lib/apiClient";
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
      <PageShell maxWidth={1200}>
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
  const optionalFacts = [
    { label: "Contact person", value: application.contactPerson, group: "Contact" },
    { label: "Contact email", value: application.contactEmail, group: "Contact" },
    { label: "Location", value: application.location, group: "Reference" },
    { label: "Source", value: application.source, group: "Reference" },
    { label: "Salary range", value: application.salaryRange, group: "Reference" },
    { label: "Deadline", value: application.deadline ? formatApplicationDate(application.deadline, "No deadline") : null, group: "Dates" },
    { label: "Job URL", value: application.jobUrl, group: "Reference" },
  ];
  const missingFacts = optionalFacts.filter(fact => !fact.value);

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
    <PageShell maxWidth={1200}>
      <Stack gap={{ xs: 3, md: 4 }}>
        <ApplicationDataState isPending={false} error={query.error} onRetry={() => { void query.refetch(); }} />
        <Button
          component={RouterLink}
          to="/applications"
          startIcon={<ArrowBackOutlinedIcon />}
          sx={{ alignSelf: "flex-start" }}
        >
          Back to applications
        </Button>

        <Card sx={{ border: 0, bgcolor: "transparent", boxShadow: "none" }}>
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              gap={2.5}
            >
              <Stack gap={1.5} sx={{ minWidth: 0 }}>
                <ApplicationIdentity jobTitle={application.jobTitle} companyName={application.companyName} heading="h1" size="page" />
                <Box><StatusChip status={application.status} /></Box>
              </Stack>
              <Stack direction="row" gap={1.5} flexWrap="wrap">
                <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => setEditOpen(true)}>
                  Edit
                </Button>
                <Button
                  variant="text"
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

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack gap={4}>
              <Card sx={{ bgcolor: "action.hover", border: 0, boxShadow: "none" }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Stack
                    direction="column"
                    alignItems="flex-start"
                    gap={2}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography component="h2" variant="h6" sx={{ display: "flex", gap: 1.5, alignItems: "center", overflowWrap: "anywhere" }}>
                        <NextActionMark />
                        <span>Next Action · {nextAction.title}</span>
                      </Typography>
                      <Typography sx={{ mt: 0.75, maxWidth: "65ch" }}>
                        {nextAction.description}
                      </Typography>
                      <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
                        {nextAction.needsAttention ? (
                          <Chip label="Needs attention" variant="outlined" />
                        ) : null}
                        {nextAction.needsStatusReview ? <>
                          <Button disabled={isReviewSaving} onClick={() => {
                            setReviewMessage("Kept active. Review status remains available until you record new communication or change status.");
                          }}>Keep active</Button>
                          <Button disabled={isReviewSaving} onClick={async () => {
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
                    <Button variant="contained" startIcon={<EditOutlinedIcon />} onClick={() => setEventOpen(true)} sx={{ flexShrink: 0 }}>Record activity</Button>
                  </Stack>
                </CardContent>
              </Card>

              <Card sx={{ border: 0, bgcolor: "transparent" }}>
                <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                  <Stack gap={1.5}>
                    <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                      <Typography component="h2" variant="h6">Timeline</Typography>
                    </Stack>
                    <Typography color="text.secondary">
                      Your application history, newest first. Status changes are recorded automatically.
                    </Typography>
                    <TimelineEventList events={timelineEvents} />
                  </Stack>
                </CardContent>
              </Card>
              <Card sx={{ border: 0, bgcolor: "transparent" }}>
                <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                  <Stack gap={2}>
                    <Typography component="h2" variant="h6">Description & notes</Typography>
                    <Divider />
                    <Box>
                      <Typography component="h3" variant="subtitle2">
                        Job description
                      </Typography>
                      <Typography sx={{ mt: 1, maxWidth: "75ch", whiteSpace: "pre-line", overflowWrap: "anywhere" }}>
                        {application.jobDescription || "No job description saved for this application yet."}
                      </Typography>
                    </Box>
                    <Box
                      sx={(theme) => ({
                        pt: 2,
                        borderTop: `1px solid ${theme.palette.divider}`,
                      })}
                    >
                      <Typography component="h3" variant="subtitle2">
                        My notes
                      </Typography>
                      <Typography sx={{ mt: 1, maxWidth: "75ch", whiteSpace: "pre-line", overflowWrap: "anywhere" }}>
                        {application.notes || "No notes saved for this application yet."}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack gap={2.5}>
              <Card sx={{ border: 0, bgcolor: "transparent" }}>
                <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                  <Stack gap={1.75}>
                    <Typography component="h2" variant="h6">Quick facts</Typography>
                    <Divider />
                    <Box>
                      <Typography component="h3" variant="subtitle2" sx={{ mb: 1 }}>Dates</Typography>
                      <DetailRow label="Applied date" value={formatApplicationDate(application.appliedDate,
                        application.status === "Draft" || application.status === "ToApply" ? "Not applied yet" : "Applied date not recorded")} />
                      {optionalFacts.filter(fact => fact.group === "Dates" && fact.value).map(fact => <DetailRow key={fact.label} label={fact.label} value={fact.value!} />)}
                      <DetailRow label="Created" value={formatApplicationDate(application.createdAt, "Unknown")} />
                      <DetailRow label="Updated" value={formatApplicationDate(application.updatedAt, "Unknown")} />
                    </Box>
                    <Box>
                      <Typography component="h3" variant="subtitle2" sx={{ mb: 1 }}>Contact</Typography>
                      <DetailRow label="Application method" value={applicationMethodLabels[application.applicationMethod] ?? "Unknown"} />
                      {optionalFacts.filter(fact => fact.group === "Contact" && fact.value).map(fact => <DetailRow key={fact.label} label={fact.label} value={fact.value!} />)}
                      <DetailRow label="Follow-up preference" value={followUpModeLabels[application.followUpMode] ?? "Unknown"} />
                    </Box>
                    {optionalFacts.some(fact => fact.group === "Reference" && fact.value) ? <Box>
                      <Typography component="h3" variant="subtitle2" sx={{ mb: 1 }}>Reference</Typography>
                      {optionalFacts.filter(fact => fact.group === "Reference" && fact.label !== "Job URL" && fact.value).map(fact => <DetailRow key={fact.label} label={fact.label} value={fact.value!} />)}
                      {application.jobUrl ? <Button href={application.jobUrl} target="_blank" rel="noreferrer" variant="text" endIcon={<LaunchOutlinedIcon />} sx={{ mt: 0.5, px: 0 }}>Open job ad</Button> : null}
                    </Box> : null}
                    {missingFacts.length > 0 ? <Accordion disableGutters elevation={0} sx={{ bgcolor: "transparent", border: 0, "&:before": { display: "none" } }}>
                      <AccordionSummary expandIcon={<ExpandMoreOutlinedIcon />} aria-controls="missing-optional-facts" id="missing-optional-summary" sx={{ px: 0, minHeight: 44 }}>
                        <Typography variant="body2" color="text.secondary">Missing optional details</Typography>
                      </AccordionSummary>
                      <AccordionDetails id="missing-optional-facts" sx={{ px: 0, pt: 0 }}>
                        {missingFacts.map(fact => <DetailRow key={fact.label} label={fact.label} value="Not specified" />)}
                        <Button size="small" onClick={() => setEditOpen(true)} sx={{ mt: 1 }}>Add details</Button>
                      </AccordionDetails>
                    </Accordion> : null}
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

function DetailRow({ label, value }: DetailItemProps) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      gap={2}
      sx={{ py: 0.75, minWidth: 0 }}
    >
      <Box sx={{ flex: "0 0 44%" }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ minWidth: 0, textAlign: "right", overflowWrap: "anywhere", fontVariantNumeric: "tabular-nums" }}>{value}</Typography>
    </Stack>
  );
}
