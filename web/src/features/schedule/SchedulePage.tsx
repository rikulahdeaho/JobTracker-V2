import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import {
  Box,
  Chip,
  Divider,
  Grid,
  List,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
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

  if (isPending || error) {
    return (
      <PageShell>
        <PageHeader title="Schedule" description="Plan around application deadlines, current statuses, and follow-up signals." />
        <ApplicationDataState isPending={isPending} error={error} onRetry={refetch} />
      </PageShell>
    );
  }
  const reminderGroups = getGroupedReminders(applications, new Date(), "hardDate");
  const suggestedAttention = getAllReminders(applications).filter(item => item.category === "suggestedAttention");
  const activePipeline = applications
    .filter((application) => ["Interviewing", "Assignment", "Offer"].includes(application.status))
    .sort((left, right) => getLastWorkflowTime(right).localeCompare(getLastWorkflowTime(left)))
    .slice(0, 4);

  return (
    <PageShell>
      <PageHeader
        title="Schedule"
        description="Recorded dates and commitments, with suggested attention shown separately below."
      />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard
            title="Overdue commitments"
            description="Recorded deadlines that have passed."
            action={
              <Chip
                label={reminderGroups[0].reminders.length > 0 ? `${reminderGroups[0].reminders.length} overdue` : "Clear"}
                color={reminderGroups[0].reminders.length > 0 ? "error" : "success"}
                size="small"
                variant="outlined"
              />
            }
          >
            <Box
              sx={(theme) => ({
                px: 1.75,
                py: 0.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.error.main, theme.palette.mode === "dark" ? 0.1 : 0.04),
                borderLeft: 3,
                borderColor: reminderGroups[0].reminders.length > 0 ? "error.main" : "divider",
              })}
            >
              {reminderGroups[0].reminders.length > 0 ? (
                <List disablePadding>
                  {reminderGroups[0].reminders.map((reminder, index) => (
                    <ReminderListItem key={reminder.id} reminder={reminder} borderTop={index > 0} />
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" sx={{ py: 1.25 }}>
                  No overdue reminders right now.
                </Typography>
              )}
            </Box>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard
            title="Today"
            description="Hard dates recorded for today."
            action={<Chip label={`${reminderGroups[1].reminders.length} today`} color="warning" size="small" variant="outlined" />}
          >
            <Box
              sx={(theme) => ({
                px: 1.75,
                py: 0.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 0.1 : 0.04),
                borderLeft: 3,
                borderColor: "warning.main",
              })}
            >
              {reminderGroups[1].reminders.length > 0 ? (
                <List disablePadding>
                  {reminderGroups[1].reminders.map((reminder, index) => (
                    <ReminderListItem key={reminder.id} reminder={reminder} borderTop={index > 0} />
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" sx={{ py: 1.25 }}>
                  Nothing is specifically due today.
                </Typography>
              )}
            </Box>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard
            title="Active queue"
            description="Keep the most time-sensitive active processes visible in one place."
            action={<Chip label={`${activePipeline.length} active`} color="primary" size="small" variant="outlined" />}
          >
            {activePipeline.length > 0 ? (
              <Stack gap={1.5}>
                {activePipeline.map((application, index) => (
                  <Stack key={application.id} gap={0.75}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
                      <Typography fontWeight={600}>{application.companyName}</Typography>
                      <StatusChip status={application.status} />
                    </Stack>
                    <Typography color="text.secondary">{application.jobTitle}</Typography>
                    <Stack direction="row" gap={1} flexWrap="wrap">
                      <Chip icon={<TodayOutlinedIcon />} label={`Activity ${formatApplicationDate(getLastWorkflowTime(application), "unknown")}`} size="small" />
                    </Stack>
                    {index < activePipeline.length - 1 ? <Divider /> : null}
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">Active interview, assignment, or offer stages will appear here.</Typography>
            )}
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <SectionCard
            title="Upcoming commitments"
            description="Recorded interview times and application, assignment, or offer deadlines."
            action={<Chip label={`${reminderGroups[2].reminders.length} upcoming`} size="small" variant="outlined" />}
          >
            {reminderGroups[2].reminders.length > 0 ? (
              <List disablePadding>
                {reminderGroups[2].reminders.map((reminder, index) => (
                  <ReminderListItem key={reminder.id} reminder={reminder} borderTop={index > 0} />
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">No upcoming reminders are queued yet.</Typography>
            )}
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <SectionCard title="Suggested attention" description="Suggested follow-up and status-review dates. These are not deadlines.">
            {suggestedAttention.length ? <List disablePadding>
              {suggestedAttention.map((reminder, index) => <ReminderListItem key={reminder.id} reminder={reminder} borderTop={index > 0} />)}
            </List> : <Typography color="text.secondary">No suggested attention scheduled.</Typography>}
          </SectionCard>
        </Grid>
      </Grid>
    </PageShell>
  );
}
