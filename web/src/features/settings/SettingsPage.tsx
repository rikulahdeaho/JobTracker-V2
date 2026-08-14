import { Card, CardContent, Stack, Typography } from "@mui/material";

export function SettingsPage() {
  return (
    <Stack gap={3}>
      <div>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography color="text.secondary">
          Placeholder settings page included to complete the initial navigation shell.
        </Typography>
      </div>
      <Card>
        <CardContent>
          <Typography>
            Future settings can cover profile preferences, default reminders, and integrations once those features exist.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
