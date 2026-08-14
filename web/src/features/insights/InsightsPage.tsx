import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { Card, CardContent, Stack, Typography } from "@mui/material";

export function InsightsPage() {
  return (
    <Stack gap={3}>
      <div>
        <Typography variant="h4" gutterBottom>
          Insights
        </Typography>
        <Typography color="text.secondary">
          This page is intentionally simple for the first prototype and can grow into status trends and conversion metrics later.
        </Typography>
      </div>
      <Card>
        <CardContent>
          <Stack direction="row" gap={2} alignItems="center">
            <TrendingUpOutlinedIcon color="primary" />
            <Typography>
              3 of 7 mock applications are in active interview or assignment stages.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
