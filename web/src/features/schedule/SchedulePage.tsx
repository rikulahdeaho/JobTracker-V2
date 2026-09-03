import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import {
  Chip,
  Divider,
  Grid,
  List,
  Stack,
  Typography,
} from "@mui/material";
import { PageHeader, PageShell, SectionCard } from "../../components/ui/PageSection";
import { useApplications } from "../applications/context/ApplicationsContext";
import { ReminderListItem } from "../applications/components/ReminderListItem";
import { StatusChip } from "../applications/components/StatusChip";
import { formatApplicationDate } from "../applications/utils/applicationPresentation";
import { getGroupedReminders } from "../applications/utils/applicationWorkflow";

export function SchedulePage() {
  const { applications } = useApplications();
  const reminderGroups = getGroupedReminders(applications);
  const activePipeline = applications
    .filter((application) => ["Interviewing", "Assignment", "Offer"].includes(application.status))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 4);

  return (
    <PageShell>
      <PageHeader
        title="Schedule"
        description="A lightweight planning view generated from application deadlines, current statuses, and follow-up signals."
      />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Overdue" description="Reminder items that are already past their due date.">
            {reminderGroups[0].reminders.length > 0 ? (
              <List disablePadding>
                {reminderGroups[0].reminders.map((reminder, index) => (
                  <ReminderListItem key={reminder.id} reminder={reminder} borderTop={index > 0} />
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">No overdue reminders right now.</Typography>
            )}
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Today" description="Items that should be handled today in the current mock schedule.">
            {reminderGroups[1].reminders.length > 0 ? (
              <List disablePadding>
                {reminderGroups[1].reminders.map((reminder, index) => (
                  <ReminderListItem key={reminder.id} reminder={reminder} borderTop={index > 0} />
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">Nothing is specifically due today.</Typography>
            )}
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Active queue" description="Keep the most time-sensitive active processes visible in one place.">
            {activePipeline.length > 0 ? (
              <Stack gap={1.5}>
                {activePipeline.map((application) => (
                  <Stack key={application.id} gap={0.75}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
                      <Typography fontWeight={600}>{application.companyName}</Typography>
                      <StatusChip status={application.status} />
                    </Stack>
                    <Typography color="text.secondary">{application.jobTitle}</Typography>
                    <Stack direction="row" gap={1} flexWrap="wrap">
                      <Chip icon={<TodayOutlinedIcon />} label={`Updated ${formatApplicationDate(application.updatedAt, "recently")}`} size="small" />
                      {application.deadline ? (
                        <Chip icon={<NotificationsActiveOutlinedIcon />} label={`Due ${formatApplicationDate(application.deadline, "No deadline")}`} size="small" variant="outlined" />
                      ) : null}
                    </Stack>
                    <Divider />
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">Active interview, assignment, or offer stages will appear here.</Typography>
            )}
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <SectionCard title="Upcoming deadlines & tasks" description="The full upcoming queue generated from deadlines, follow-ups, interviews, assignments, and offers.">
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
      </Grid>
    </PageShell>
  );
}
