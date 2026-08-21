import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import {
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { PageHeader, PageShell, SectionCard } from "../../components/ui/PageSection";
import { useApplications } from "../applications/context/ApplicationsContext";
import { StatusChip } from "../applications/components/StatusChip";
import { formatApplicationDate, getUpcomingApplications } from "../applications/utils/applicationPresentation";
import { getApplicationNextAction, getApplicationsNeedingFollowUp } from "../applications/utils/applicationNextAction";

export function SchedulePage() {
  const { applications } = useApplications();
  const upcomingDeadlines = getUpcomingApplications(applications).slice(0, 5);
  const followUps = getApplicationsNeedingFollowUp(applications).slice(0, 5);
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
          <SectionCard title="Upcoming deadlines" description="Closest application deadlines from the current local data.">
            {upcomingDeadlines.length > 0 ? (
              <List disablePadding>
                {upcomingDeadlines.map((application, index) => (
                  <ListItem key={application.id} disableGutters sx={{ borderTop: index === 0 ? 0 : 1, borderColor: "divider", py: 1.25 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <CalendarMonthOutlinedIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${application.companyName} - ${application.jobTitle}`}
                      secondary={`Deadline ${formatApplicationDate(application.deadline, "No deadline")}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">No future deadlines are saved yet.</Typography>
            )}
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Needs follow-up" description="Applications that the local next-action logic marks for follow-up.">
            {followUps.length > 0 ? (
              <Stack gap={1.5}>
                {followUps.map((application) => {
                  const nextAction = getApplicationNextAction(application);

                  return (
                    <Stack key={application.id} gap={0.75}>
                      <Stack direction="row" justifyContent="space-between" gap={2} alignItems="center">
                        <Typography fontWeight={600}>{application.companyName}</Typography>
                        <Chip label={nextAction.title} size="small" color={nextAction.color} variant="outlined" />
                      </Stack>
                      <Typography color="text.secondary">{nextAction.description}</Typography>
                      <Divider />
                    </Stack>
                  );
                })}
              </Stack>
            ) : (
              <Typography color="text.secondary">No follow-ups are overdue right now.</Typography>
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
      </Grid>
    </PageShell>
  );
}
