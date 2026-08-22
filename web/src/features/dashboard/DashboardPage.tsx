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
  Card,
  CardContent,
  Divider,
  Grid,
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
import { ReminderListItem } from "../applications/components/ReminderListItem";
import { StatusChip } from "../applications/components/StatusChip";
import { formatApplicationDate, getUpcomingApplications } from "../applications/utils/applicationPresentation";
import {
  getApplicationNextAction,
  getApplicationsNeedingFollowUp,
  getGhostedRiskApplications,
} from "../applications/utils/applicationNextAction";
import { getUpcomingReminders } from "../applications/utils/applicationWorkflow";

export function DashboardPage() {
  const { applications } = useApplications();
  const followUpApplications = getApplicationsNeedingFollowUp(applications);
  const ghostedRiskApplications = getGhostedRiskApplications(applications);
  const upcomingDeadlines = getUpcomingApplications(applications).slice(0, 3);
  const upcomingReminders = getUpcomingReminders(applications, 3);
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
    })
    .slice(0, 4);

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
  const latestUpdatedApplication = [...applications].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0];

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
            title="Current focus"
            description="Use deadlines and follow-up signals to decide where to spend your next block of time."
          >
            <Stack gap={2}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.14 : 0.07),
                  border: 1,
                  borderColor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.28 : 0.16),
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Priority signal
                </Typography>
                <Typography variant="h6" sx={{ mt: 0.5 }}>
                  {followUpApplications.length > 0
                    ? `${followUpApplications.length} application${followUpApplications.length === 1 ? "" : "s"} need follow-up`
                    : "No overdue follow-ups right now"}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {latestUpdatedApplication
                    ? `Most recent change: ${latestUpdatedApplication.companyName} was updated ${formatApplicationDate(
                        latestUpdatedApplication.updatedAt,
                        "recently",
                      )}.`
                    : "Add applications to start building a useful activity snapshot."}
                </Typography>
              </Box>
              <Divider />
              {upcomingDeadlines.length > 0 ? (
                <Stack gap={1.5}>
                  {upcomingDeadlines.map((application) => (
                    <Stack
                      key={application.id}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      gap={2}
                    >
                      <Box>
                        <Typography fontWeight={600}>{application.companyName}</Typography>
                        <Typography color="text.secondary">
                          {application.jobTitle} • due {formatApplicationDate(application.deadline, "No deadline")}
                        </Typography>
                      </Box>
                      <StatusChip status={application.status} />
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  Add applications with deadlines to surface the next priorities here.
                </Typography>
              )}
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, xl: 7 }}>
          <SectionCard
            title="Next actions"
            description="Suggested actions are still generated locally from the existing next-action rules."
          >
            {topActionItems.length > 0 ? (
              <List disablePadding>
                {topActionItems.map(({ application, nextAction }, index) => (
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
                Add applications to see suggested next steps here.
              </Typography>
            )}
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <SectionCard
            title="Upcoming reminders"
            description="A small preview of the local reminder queue derived from deadlines, follow-ups, and active stages."
          >
            {upcomingReminders.length > 0 ? (
              <List disablePadding>
                {upcomingReminders.map((reminder, index) => (
                  <ReminderListItem key={reminder.id} reminder={reminder} borderTop={index > 0} />
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                Reminders will appear here as applications pick up deadlines, interviews, and follow-up needs.
              </Typography>
            )}
          </SectionCard>
        </Grid>
      </Grid>
    </PageShell>
  );
}
