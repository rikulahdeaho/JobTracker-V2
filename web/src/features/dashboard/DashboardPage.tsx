import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import RecordVoiceOverOutlinedIcon from "@mui/icons-material/RecordVoiceOverOutlined";
import WatchLaterOutlinedIcon from "@mui/icons-material/WatchLaterOutlined";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import { PageHeader, PageShell, SectionCard } from "../../components/ui/PageSection";
import { useApplications } from "../applications/context/ApplicationsContext";
import { StatusChip } from "../applications/components/StatusChip";
import type { ApplicationStatus } from "../applications/types/application";
import { formatApplicationDate } from "../applications/utils/applicationPresentation";
import { applicationStatusLabel } from "../applications/utils/applicationStatus";
import {
  getApplicationNextAction,
  getApplicationsNeedingFollowUp,
  getGhostedRiskApplications,
} from "../applications/utils/applicationNextAction";
import { getAllReminders, getGroupedReminders } from "../applications/utils/applicationWorkflow";

export function DashboardPage() {
  const { applications } = useApplications();
  const followUpApplications = getApplicationsNeedingFollowUp(applications);
  const ghostedRiskApplications = getGhostedRiskApplications(applications);
  const reminderGroups = getGroupedReminders(applications);
  const reminders = getAllReminders(applications);
  const topActionItems = applications
    .map((application) => ({
      application,
      nextAction: getApplicationNextAction(application),
    }))
    .filter(({ nextAction }) => nextAction.title !== "No action")
    .sort((left, right) => {
      if (left.nextAction.isGhostedRisk !== right.nextAction.isGhostedRisk) {
        return left.nextAction.isGhostedRisk ? -1 : 1;
      }

      if (left.nextAction.isNeedsFollowUp !== right.nextAction.isNeedsFollowUp) {
        return left.nextAction.isNeedsFollowUp ? -1 : 1;
      }

      return left.application.companyName.localeCompare(right.application.companyName);
    });
  const priorityItem = topActionItems[0];
  const nextActionItems = topActionItems.slice(1, 4);
  const nextReminder = [...reminders].sort((left, right) => left.dueDate.localeCompare(right.dueDate))[0];

  const dashboardStats = [
    {
      label: "Total applications",
      value: applications.length,
      icon: <BusinessCenterOutlinedIcon color="primary" />,
    },
    {
      label: "Active processes",
      value: applications.filter((application) =>
        ["Applied", "Interviewing", "Assignment", "Offer"].includes(application.status),
      ).length,
      icon: <PendingActionsOutlinedIcon color="primary" />,
    },
    {
      label: "Interviews",
      value: applications.filter((application) => application.status === "Interviewing").length,
      icon: <RecordVoiceOverOutlinedIcon color="primary" />,
    },
    {
      label: "Offers",
      value: applications.filter((application) => application.status === "Offer").length,
      icon: <AssignmentTurnedInOutlinedIcon color="primary" />,
    },
    {
      label: "Needs follow-up",
      value: followUpApplications.length,
      icon: <MarkEmailUnreadOutlinedIcon color="primary" />,
    },
    {
      label: "Ghosted risk",
      value: ghostedRiskApplications.length,
      icon: <WatchLaterOutlinedIcon color="primary" />,
    },
  ];
  const pipelineStatuses: ApplicationStatus[] = ["Applied", "Interviewing", "Assignment", "Offer", "Ghosted"];
  const pipelineSnapshot = pipelineStatuses.map((status) => ({
    status,
    count: applications.filter((application) => application.status === status).length,
  }));

  return (
    <PageShell>
      <PageHeader
        title="Job search at a glance"
        description="A polished local-first dashboard powered entirely by your current mock application data."
      />
      <Grid container spacing={2.5}>
        {dashboardStats.map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, xl: 4 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {stat.label}
                    </Typography>
                    <Typography variant="h4">{stat.value}</Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.22 : 0.1),
                      color: "primary.main",
                      width: 44,
                      height: 44,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, xl: 5 }}>
          <SectionCard
            title="Priority focus"
            description="The one thing most worth acting on before you scan the rest of the pipeline."
          >
            {priorityItem ? (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.14 : 0.07),
                  border: 1,
                  borderColor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.28 : 0.16),
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {priorityItem.application.companyName}
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.75 }}>
                  {priorityItem.nextAction.title}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {priorityItem.nextAction.description}
                </Typography>
                <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center" sx={{ mt: 2 }}>
                  <StatusChip status={priorityItem.application.status} />
                  <Button
                    component={RouterLink}
                    to={`/applications/${priorityItem.application.id}`}
                    variant="contained"
                    endIcon={<ChevronRightOutlinedIcon />}
                  >
                    Open application
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Typography color="text.secondary">
                Add applications to surface the most important next step here.
              </Typography>
            )}
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, xl: 7 }}>
          <SectionCard
            title="Next actions"
            description="Suggested actions are still generated locally from the existing next-action rules."
          >
            {nextActionItems.length > 0 ? (
              <List disablePadding>
                {nextActionItems.map(({ application, nextAction }, index) => (
                  <ListItem
                    key={application.id}
                    disableGutters
                    component={RouterLink}
                    to={`/applications/${application.id}`}
                    sx={{
                      py: 1.25,
                      textDecoration: "none",
                      color: "inherit",
                      borderTop: index === 0 ? 0 : 1,
                      borderColor: "divider",
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: (theme) =>
                            alpha(theme.palette.secondary.main, theme.palette.mode === "dark" ? 0.22 : 0.1),
                          color: "secondary.main",
                          width: 40,
                          height: 40,
                        }}
                      >
                        <ChevronRightOutlinedIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${application.companyName} - ${nextAction.title}`}
                      secondary={nextAction.description}
                    />
                    <StatusChip status={application.status} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                No additional next actions are queued behind the current priority.
              </Typography>
            )}
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, xl: 5 }}>
          <SectionCard
            title="Schedule summary"
            description="A compact reminder snapshot. Schedule keeps the full grouped view."
            action={
              <Button component={RouterLink} to="/schedule" variant="outlined" endIcon={<ChevronRightOutlinedIcon />}>
                View schedule
              </Button>
            }
          >
            {reminders.length > 0 ? (
              <Stack gap={2}>
                <Grid container spacing={1.5}>
                  {reminderGroups.map((group) => (
                    <Grid key={group.key} size={{ xs: 4 }}>
                      <Box sx={{ p: 1.5, border: 1, borderColor: "divider", borderRadius: 2 }}>
                        <Typography variant="h5">{group.reminders.length}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {group.title}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Next reminder
                  </Typography>
                  <Typography fontWeight={700} sx={{ mt: 0.5 }}>
                    {nextReminder
                      ? `${nextReminder.title}: ${nextReminder.companyName}`
                      : "No reminder queued"}
                  </Typography>
                  <Typography color="text.secondary">
                    {nextReminder ? formatApplicationDate(nextReminder.dueDate, "No due date") : "Add a deadline to create one."}
                  </Typography>
                </Box>
              </Stack>
            ) : (
              <Typography color="text.secondary">
                Reminders will appear here as applications pick up deadlines, interviews, and follow-up needs.
              </Typography>
            )}
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, xl: 7 }}>
          <SectionCard
            title="Pipeline snapshot"
            description="A quick read on where applications sit without turning the dashboard into the Insights page."
          >
            <Stack gap={1.75}>
              {pipelineSnapshot.map(({ status, count }) => {
                const percentage = applications.length > 0 ? Math.round((count / applications.length) * 100) : 0;

                return (
                  <Stack key={status} gap={0.75}>
                    <Stack direction="row" justifyContent="space-between" gap={2} alignItems="center">
                      <Stack direction="row" gap={1} alignItems="center">
                        <StatusChip status={status} />
                        <Typography color="text.secondary">{applicationStatusLabel[status]}</Typography>
                      </Stack>
                      <Typography fontWeight={700}>{count}</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={percentage} sx={{ height: 8, borderRadius: 999 }} />
                  </Stack>
                );
              })}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </PageShell>
  );
}
