import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { Card, CardContent, List, ListItem, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";

const upcomingItems = [
  "2026-08-14 - Respond to Smartly.io offer",
  "2026-08-15 - Submit Solita assignment",
  "2026-08-18 - Reaktor technical interview prep",
  "2026-08-20 - Apply to Nitor UI Engineer role",
];

export function SchedulePage() {
  return (
    <Stack gap={3}>
      <div>
        <Typography variant="h4" gutterBottom>
          Schedule
        </Typography>
        <Typography color="text.secondary">
          A simple placeholder for upcoming reminders and deadlines during the mock-data phase.
        </Typography>
      </div>
      <Card>
        <CardContent>
          <List disablePadding>
            {upcomingItems.map((item) => (
              <ListItem key={item} disableGutters>
                <ListItemIcon>
                  <CalendarMonthOutlinedIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Stack>
  );
}
