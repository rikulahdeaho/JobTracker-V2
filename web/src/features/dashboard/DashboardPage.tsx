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
  Chip,
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
import { StatusChip } from "../applications/components/StatusChip";
import type { ApplicationStatus, JobApplication } from "../applications/types/application";
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
      helper: "Saved in this browser",
      icon: <BusinessCenterOutlinedIcon color="primary" />,
    },
    {
      label: "Active processes",
      value: applications.filter((application) =>
        ["Applied", "Interviewing", "Assignment", "Offer"].includes(application.status),
      ).length,
      helper: "Still moving",
      icon: <PendingActionsOutlinedIcon color="primary" />,
    },
    {
      label: "Interviews",
      value: applications.filter((application) => application.status === "Interviewing").length,
      helper: "Need preparation",
      icon: <RecordVoiceOverOutlinedIcon color="primary" />,
    },
    {
      label: "Offers",
      value: applications.filter((application) => application.status === "Offer").length,
      helper: "Decision stage",
      icon: <AssignmentTurnedInOutlinedIcon color="primary" />,
    },
    {
      label: "Needs follow-up",
      value: followUpApplications.length,
      helper: "Action suggested",
      icon: <MarkEmailUnreadOutlinedIcon color="primary" />,
    },
    {
      label: "Ghosted risk",
      value: ghostedRiskApplications.length,
      helper: "Long silence",
      icon: <WatchLaterOutlinedIcon color="primary" />,
    },
  ];
  const pipelineStatuses: ApplicationStatus[] = ["Applied", "Interviewing", "Assignment", "Offer"];
  const pipelineSnapshot = pipelineStatuses.map((status) => ({
    status,
    count: applications.filter((application) => application.status === status).length,
  }));
  const activeCount = applications.filter((application) =>
    ["Applied", "Interviewing", "Assignment", "Offer"].includes(application.status),
  ).length;
  const closedCount = applications.length - activeCount;

  return (
    <PageShell>
      <PageHeader
        title="Job search at a glance"
        description="A polished local-first dashboard powered entirely by your current mock application data."
      />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, xl: 8 }}>
          <SectionCard
            title="Priority action"
            description="Start here. This is the highest-signal next step from the current local pipeline."
          >
            {priorityItem ? (
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                gap={2.5}
                sx={(theme) => ({
                  p: { xs: 2.5, md: 3.5 },
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 0.14 : 0.08),
                  border: 1,
                  borderColor: alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 0.32 : 0.22),
                })}
              >
                <Stack direction="row" gap={2} alignItems="flex-start">
                  <Avatar
                    sx={(theme) => ({
                      bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 0.24 : 0.13),
                      color: "warning.main",
                      width: 56,
                      height: 56,
                    })}
                  >
                    <PendingActionsOutlinedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="overline" color="warning.main">
                      {priorityItem.application.companyName}
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 0.25 }}>
                      {priorityItem.nextAction.title} for {priorityItem.application.jobTitle}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 640 }}>
                      {priorityItem.nextAction.description}
                    </Typography>
                    <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center" sx={{ mt: 1.5 }}>
                      <StatusChip status={priorityItem.application.status} />
                      <Chip
                        label={getApplicationDateContext(priorityItem.application)}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Box>
                </Stack>
                <Button
                  component={RouterLink}
                  to={`/applications/${priorityItem.application.id}`}
                  variant="contained"
                  endIcon={<ChevronRightOutlinedIcon />}
                >
                  Open application
                </Button>
              </Stack>
            ) : (
              <Typography color="text.secondary">
                Add applications to surface the most important next step here.
              </Typography>
            )}
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, xl: 4 }}>
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
                <Grid container spacing={1.25}>
                  {reminderGroups.map((group) => (
                    <Grid key={group.key} size={{ xs: 4 }}>
                      <Box sx={{ p: 1.5, border: 1, borderColor: "divider", borderRadius: 2 }}>
                        <Typography variant="h5">{group.reminders.length}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
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
      </Grid>
      <Grid container spacing={2.5}>
        {dashboardStats.map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, lg: 4, xl: 2 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack gap={2}>
                  <Avatar
                    sx={{
                      bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.22 : 0.1),
                      color: "primary.main",
                      width: 42,
                      height: 42,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.label}
                    </Typography>
                    <Typography variant="h4">{stat.value}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      {stat.helper}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, xl: 7 }}>
          <SectionCard
            title="Pipeline snapshot"
            description="A compact health check. Insights keeps the deeper breakdown."
          >
            <Stack gap={2}>
              <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
                <Box sx={{ flex: 1, p: 2, border: 1, borderColor: "divider", borderRadius: 2 }}>
                  <Typography variant="overline" color="text.secondary">
                    Active
                  </Typography>
                  <Typography variant="h4">{activeCount}</Typography>
                  <Typography color="text.secondary">Processes still worth tracking closely.</Typography>
                </Box>
                <Box sx={{ flex: 1, p: 2, border: 1, borderColor: "divider", borderRadius: 2 }}>
                  <Typography variant="overline" color="text.secondary">
                    Closed
                  </Typography>
                  <Typography variant="h4">{closedCount}</Typography>
                  <Typography color="text.secondary">Rejected, ghosted, or withdrawn applications.</Typography>
                </Box>
              </Stack>
              <Divider />
              <Stack direction="row" gap={1} flexWrap="wrap">
                {pipelineSnapshot.map(({ status, count }) => (
                  <Chip
                    key={status}
                    label={`${applicationStatusLabel[status]}: ${count}`}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Stack>
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, xl: 5 }}>
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
                      secondary={
                        <Stack gap={1} sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {nextAction.description}
                          </Typography>
                          <Stack direction="row" gap={1} flexWrap="wrap">
                            <Chip label={getApplicationDateContext(application)} size="small" variant="outlined" />
                            <StatusChip status={application.status} />
                          </Stack>
                        </Stack>
                      }
                    />
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
      </Grid>
    </PageShell>
  );
}

function getApplicationDateContext(application: JobApplication): string {
  if (application.deadline) {
    return `Due ${formatApplicationDate(application.deadline, "No deadline")}`;
  }

  if (application.appliedDate) {
    return `Applied ${formatApplicationDate(application.appliedDate, "Not applied")}`;
  }

  return `Updated ${formatApplicationDate(application.updatedAt, "recently")}`;
}
