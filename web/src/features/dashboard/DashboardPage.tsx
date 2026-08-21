import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import RecordVoiceOverOutlinedIcon from "@mui/icons-material/RecordVoiceOverOutlined";
import WatchLaterOutlinedIcon from "@mui/icons-material/WatchLaterOutlined";
import {
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useApplications } from "../applications/context/ApplicationsContext";
import {
  getApplicationNextAction,
  getApplicationsNeedingFollowUp,
  getGhostedRiskApplications,
} from "../applications/utils/applicationNextAction";

export function DashboardPage() {
  const { applications } = useApplications();
  const followUpApplications = getApplicationsNeedingFollowUp(applications);
  const ghostedRiskApplications = getGhostedRiskApplications(applications);
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
  const upcomingDeadlines = applications
    .filter((application) => application.deadline)
    .sort((left, right) => left.deadline!.localeCompare(right.deadline!))
    .slice(0, 2)
    .map((application) => `${application.companyName} (${application.deadline})`);

  return (
    <Stack gap={3}>
      <div>
        <Typography variant="h4" gutterBottom>
          Job search at a glance
        </Typography>
        <Typography color="text.secondary">
          This first prototype keeps the dashboard lightweight and powered entirely by hardcoded application data.
        </Typography>
      </div>
      <Grid container spacing={2.5}>
        {dashboardStats.map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, xl: 3 }}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <div>
                    <Typography color="text.secondary" gutterBottom>
                      {stat.label}
                    </Typography>
                    <Typography variant="h4">{stat.value}</Typography>
                  </div>
                  {stat.icon}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current focus
              </Typography>
              <Typography color="text.secondary">
                {upcomingDeadlines.length > 0
                  ? `Nearest deadlines: ${upcomingDeadlines.join(" and ")}.`
                  : "Add applications with deadlines to surface the next priorities here."}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                {followUpApplications.length > 0
                  ? `${followUpApplications.length} application${followUpApplications.length === 1 ? "" : "s"} need follow-up based on the current local activity dates.`
                  : "No follow-ups are overdue right now."}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Next actions
              </Typography>
              {topActionItems.length > 0 ? (
                <List disablePadding>
                  {topActionItems.map(({ application, nextAction }) => (
                    <ListItem key={application.id} disableGutters>
                      <ListItemText
                        primary={`${application.companyName} - ${nextAction.title}`}
                        secondary={nextAction.description}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  Add applications to see suggested next steps here.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
