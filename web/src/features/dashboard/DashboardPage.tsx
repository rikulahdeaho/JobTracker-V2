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
import { mockApplications } from "../applications/data/mockApplications";

const dashboardStats = [
  {
    label: "Total applications",
    value: mockApplications.length,
    icon: <BusinessCenterOutlinedIcon color="primary" />,
  },
  {
    label: "Active processes",
    value: mockApplications.filter((application) =>
      ["Applied", "Interviewing", "Assignment", "Offer"].includes(application.status),
    ).length,
    icon: <PendingActionsOutlinedIcon color="primary" />,
  },
  {
    label: "Interviews",
    value: mockApplications.filter((application) => application.status === "Interviewing").length,
    icon: <RecordVoiceOverOutlinedIcon color="primary" />,
  },
  {
    label: "Offers",
    value: mockApplications.filter((application) => application.status === "Offer").length,
    icon: <AssignmentTurnedInOutlinedIcon color="primary" />,
  },
];

export function DashboardPage() {
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
            Smartly.io has an offer deadline on 2026-08-14, and Solita has an assignment due on 2026-08-15.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
