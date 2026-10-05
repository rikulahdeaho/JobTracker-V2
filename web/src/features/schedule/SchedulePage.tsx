import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import { Box, Chip, Divider, Grid, List, Stack, Typography } from "@mui/material";
import { PageHeader, PageShell, SectionCard } from "../../components/ui/PageSection";
import { useApplications } from "../applications/context/ApplicationsContext";
import { ApplicationDataState } from "../applications/components/ApplicationDataState";
import { ReminderListItem } from "../applications/components/ReminderListItem";
import { StatusChip } from "../applications/components/StatusChip";
import { formatApplicationDate } from "../applications/utils/applicationPresentation";
import { getLastWorkflowTime } from "../applications/utils/applicationActivity";
import { getAllReminders, getGroupedReminders } from "../applications/utils/applicationWorkflow";

export function SchedulePage() {
  const { applications, isPending, error, refetch } = useApplications();
  if (isPending || error) return <PageShell>
    <PageHeader title="Schedule" description="Your recorded dates and upcoming commitments." />
    <ApplicationDataState isPending={isPending} error={error} onRetry={refetch} />
  </PageShell>;
  const reminderGroups = getGroupedReminders(applications, new Date(), "hardDate");
  const suggestedAttention = getAllReminders(applications).filter(item => item.category === "suggestedAttention");
  const activePipeline = applications.filter(application => ["Interviewing", "Assignment", "Offer"].includes(application.status))
    .sort((left, right) => getLastWorkflowTime(right).localeCompare(getLastWorkflowTime(left))).slice(0, 4);
  return (
    <PageShell>
      <PageHeader title="Schedule" description="Your recorded dates and upcoming commitments." />
      <Grid container spacing={{ xs: 4, md: 5 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack gap={3}>
            {reminderGroups.map((group, index) => <Box key={group.key} sx={{ pb: 3, borderBottom: 1, borderColor: "divider" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                <Typography component="h2" variant="h6">{index === 0 ? "Overdue commitments" : index === 1 ? "Today" : "Upcoming commitments"}</Typography>
                <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums", flexShrink: 0 }} color={group.reminders.length > 0 ? index === 0 ? "error.main" : index === 1 ? "warning.main" : "text.secondary" : "text.secondary"}>
                  {group.reminders.length} {index === 0 ? "overdue" : index === 1 ? "today" : "upcoming"}
                </Typography>
              </Stack>
              {group.reminders.length > 0 ? <List disablePadding>{group.reminders.map((reminder, itemIndex) => <ReminderListItem key={reminder.id} reminder={reminder} borderTop={itemIndex > 0} />)}</List>
                : <Typography color="text.secondary">{index === 0 ? "No overdue commitments." : index === 1 ? "Nothing due today." : "No upcoming dates. Recorded interviews and deadlines will appear here."}</Typography>}
            </Box>)}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack gap={4}>
            <SectionCard variant="plain" title="Active queue" description="Your current interviews, assignments and offers." action={<Chip label={`${activePipeline.length} active`} size="small" variant="outlined" />}>
              {activePipeline.length > 0 ? <Stack gap={2}>{activePipeline.map((application, index) => <Stack key={application.id} gap={0.75}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
                  <Typography fontWeight={600}>{application.jobTitle}</Typography>
                  <StatusChip status={application.status} />
                </Stack>
                <Typography color="text.secondary">{application.companyName}</Typography>
                <Stack direction="row" gap={0.75} alignItems="center" color="text.secondary">
                  <TodayOutlinedIcon fontSize="small" />
                  <Typography variant="body2">Activity {formatApplicationDate(getLastWorkflowTime(application), "unknown")}</Typography>
                </Stack>
                {index < activePipeline.length - 1 ? <Divider sx={{ mt: 1 }} /> : null}
              </Stack>)}</Stack> : <Typography color="text.secondary">No interviews, assignments or offers to prepare for right now.</Typography>}
            </SectionCard>
            <SectionCard variant="plain" title="Suggested attention" description="Follow-up and status-review suggestions, separate from your deadlines.">
              {suggestedAttention.length > 0 ? <List disablePadding>{suggestedAttention.map((reminder, index) => <ReminderListItem key={reminder.id} reminder={reminder} borderTop={index > 0} />)}</List> : <Typography color="text.secondary">No suggested attention scheduled.</Typography>}
            </SectionCard>
          </Stack>
        </Grid>
      </Grid>
    </PageShell>
  );
}
