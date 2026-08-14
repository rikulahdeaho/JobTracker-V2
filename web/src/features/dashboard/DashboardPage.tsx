import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import RecordVoiceOverOutlinedIcon from "@mui/icons-material/RecordVoiceOverOutlined";
import {
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useApplications } from "../applications/context/ApplicationsContext";

export function DashboardPage() {
  const { applications } = useApplications();
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
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current focus
          </Typography>
          <Typography color="text.secondary">
            {upcomingDeadlines.length > 0
              ? `Nearest deadlines: ${upcomingDeadlines.join(" and ")}.`
              : "Add applications with deadlines to surface the next priorities here."}
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
