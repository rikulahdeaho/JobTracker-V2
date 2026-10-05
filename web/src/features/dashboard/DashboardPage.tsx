import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import { Box, Button, Divider, Grid, List, ListItem, ListItemButton, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PageHeader, PageShell, SectionCard } from "../../components/ui/PageSection";
import { NextActionMark } from "../../components/ui/NextActionMark";
import { ApplicationIdentity } from "../applications/components/ApplicationIdentity";
import { useApplications } from "../applications/context/ApplicationsContext";
import { ApplicationDataState } from "../applications/components/ApplicationDataState";
import { StatusChip } from "../applications/components/StatusChip";
import type { ApplicationStatus, JobApplication } from "../applications/types/application";
import { formatApplicationDate } from "../applications/utils/applicationPresentation";
import { getApplicationNextAction, getApplicationsNeedingAttention, getStatusReviewApplications } from "../applications/utils/applicationNextAction";
import { getAllReminders, getGroupedReminders } from "../applications/utils/applicationWorkflow";

export function DashboardPage() {
  const { applications, isPending, error, refetch } = useApplications();
  if (isPending || error) {
    return <PageShell>
      <PageHeader title="Your job search" description="Your applications and what to do next." />
      <ApplicationDataState isPending={isPending} error={error} onRetry={refetch} />
    </PageShell>;
  }
  const followUpApplications = getApplicationsNeedingAttention(applications);
  const statusReviewApplications = getStatusReviewApplications(applications);
  const reminderGroups = getGroupedReminders(applications, new Date(), "hardDate");
  const topActionItems = applications
    .map(application => ({ application, nextAction: getApplicationNextAction(application) }))
    .filter(({ nextAction }) => nextAction.title !== "No action")
    .sort((left, right) => {
      if (left.nextAction.needsStatusReview !== right.nextAction.needsStatusReview) return left.nextAction.needsStatusReview ? -1 : 1;
      if (left.nextAction.needsAttention !== right.nextAction.needsAttention) return left.nextAction.needsAttention ? -1 : 1;
      return left.application.companyName.localeCompare(right.application.companyName);
    });
  const priorityItem = topActionItems[0];
  const nextActionItems = topActionItems.slice(1, 4);
  const nextReminders = getAllReminders(applications).filter(reminder => reminder.category === "hardDate")
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate)).slice(0, 2);
  const pipelineStatuses: ApplicationStatus[] = ["Applied", "Interviewing", "Assignment", "Offer"];
  const activeCount = applications.filter(application => pipelineStatuses.includes(application.status)).length;
  const dashboardStats = [
    { label: "Total applications", value: applications.length },
    { label: "Active hiring processes", value: activeCount },
    { label: "Interviews", value: applications.filter(application => application.status === "Interviewing").length },
    { label: "Offers", value: applications.filter(application => application.status === "Offer").length },
    { label: "Needs attention", value: followUpApplications.length },
    { label: "Status review", value: statusReviewApplications.length },
  ];

  return (
    <PageShell maxWidth={1280}>
      <PageHeader title="Your job search" description="Your applications and what to do next." actions={<Button component={RouterLink} to="/applications" variant="outlined">Manage applications</Button>} />
      <Grid container spacing={{ xs: 3, md: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
              <Stack gap={2.5} sx={{ bgcolor: "action.hover", borderRadius: 1, p: { xs: 2.5, md: 3 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                  <Stack direction="row" alignItems="center" gap={1.5}><NextActionMark /><Typography component="h2" variant="h6">Next Action</Typography></Stack>
                  {priorityItem?.nextAction.needsAttention ? <Typography variant="body2" color="text.secondary">Action suggested</Typography> : null}
                </Stack>
                {priorityItem ? <>
                  <Box>
                    <ApplicationIdentity jobTitle={priorityItem.application.jobTitle} companyName={priorityItem.application.companyName} heading="h3" size="page" />
                    <Typography component="h3" variant="h6" sx={{ mt: 2.5 }}>{priorityItem.nextAction.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: "65ch" }}>{priorityItem.nextAction.description}</Typography>
                  </Box>
                  <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                    <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                      <StatusChip status={priorityItem.application.status} />
                      <Typography variant="body2" color="text.secondary">{getApplicationDateContext(priorityItem.application)}</Typography>
                    </Stack>
                    <Button component={RouterLink} to={`/applications/${priorityItem.application.id}`} variant="contained" endIcon={<ChevronRightOutlinedIcon />}>Open application</Button>
                  </Stack>
                </> : <Typography color="text.secondary">{applications.length === 0 ? "Add applications to surface the most important next step here." : "No next actions for your current applications."}</Typography>}
              </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} sx={theme => ({ borderLeft: { md: `1px solid ${theme.palette.divider}` }, pl: { md: 3 } })}>
          <Stack gap={2.25}>
            <Box>
              <Typography component="h2" variant="h6">Schedule summary</Typography>
              <Button component={RouterLink} to="/schedule" endIcon={<ChevronRightOutlinedIcon />} sx={{ ml: -1, mt: 0.5 }}>View schedule</Button>
            </Box>
            <Stack direction="row" gap={2} justifyContent="space-between">
              {reminderGroups.map((group, index) => <Box key={group.key}>
                <Typography fontWeight={650} sx={{ fontVariantNumeric: "tabular-nums" }} color={index === 0 && group.reminders.length > 0 ? "error.main" : "text.primary"}>{group.reminders.length}</Typography>
                <Typography variant="body2" color="text.secondary">{group.title}</Typography>
              </Box>)}
            </Stack>
            <Divider />
            {nextReminders.length > 0 ? nextReminders.map(reminder => <Stack key={reminder.id} direction="row" gap={2}>
              <Typography variant="body2" sx={{ minWidth: 86, fontVariantNumeric: "tabular-nums" }}>{formatApplicationDate(reminder.dueDate, "No due date")}</Typography>
              <Box><Typography fontWeight={600}>{reminder.title}</Typography><Typography variant="body2" color="text.secondary">{reminder.companyName} · {reminder.jobTitle}</Typography></Box>
            </Stack>) : <Typography color="text.secondary">No dates scheduled. Recorded deadlines and interviews will appear here.</Typography>}
          </Stack>
        </Grid>
      </Grid>
      <Box component="dl" aria-label="Application summary" sx={{ m: 0, display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" }, borderTop: 1, borderBottom: 1, borderColor: "divider", py: 1 }}>
        {dashboardStats.map(stat => <Box key={stat.label} sx={{ px: { xs: 1, md: 2 }, py: 1.5 }}>
          <Typography component="dt" variant="body2" color="text.secondary">{stat.label}</Typography>
          <Typography component="dd" variant="h6" sx={{ m: 0, mt: 0.5, fontVariantNumeric: "tabular-nums" }}>{stat.value}</Typography>
        </Box>)}
      </Box>
      <Box>
          <SectionCard variant="plain" title="Next actions">
            {nextActionItems.length > 0 ? <List disablePadding>
              {nextActionItems.map(({ application, nextAction }, index) => <ListItem key={application.id} disablePadding sx={{ borderTop: index > 0 ? 1 : 0, borderColor: "divider" }}>
                <ListItemButton component={RouterLink} to={`/applications/${application.id}`} sx={{ px: 0, py: 2, gap: 2, alignItems: "start", display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr) auto", md: "minmax(0, 1fr) minmax(0, 1.4fr) minmax(140px, .7fr) auto" } }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <ApplicationIdentity jobTitle={application.jobTitle} companyName={application.companyName} heading="h3" />
                  </Box>
                  <Box sx={{ minWidth: 0, gridColumn: { xs: 1, md: "auto" } }}>
                    <Typography sx={{ mt: 0.5 }}>{nextAction.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{nextAction.description}</Typography>
                  </Box>
                    <Stack gap={1} alignItems="flex-start" sx={{ gridColumn: { xs: 1, md: "auto" } }}>
                      <StatusChip status={application.status} />
                      <Typography variant="body2" color="text.secondary">{getApplicationDateContext(application)}</Typography>
                    </Stack>
                  <ChevronRightOutlinedIcon color="action" sx={{ gridColumn: { xs: 2, md: "auto" }, gridRow: { xs: 1, md: "auto" } }} />
                </ListItemButton>
              </ListItem>)}
            </List> : <Typography color="text.secondary">No additional next actions are queued behind the current priority.</Typography>}
          </SectionCard>
      </Box>
    </PageShell>
  );
}

function getApplicationDateContext(application: JobApplication): string {
  if (application.deadline) return `Due ${formatApplicationDate(application.deadline, "No deadline")}`;
  if (application.appliedDate) return `Applied ${formatApplicationDate(application.appliedDate, "Not applied")}`;
  return `Updated ${formatApplicationDate(application.updatedAt, "recently")}`;
}
