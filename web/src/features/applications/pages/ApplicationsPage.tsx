import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { Box, Button, Stack, Typography } from "@mui/material";
import { ApplicationList } from "../components/ApplicationList";
import { mockApplications } from "../data/mockApplications";

export function ApplicationsPage() {
  return (
    <Stack gap={3}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        gap={2}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Applications
          </Typography>
          <Typography color="text.secondary">
            Review the current pipeline and open any application for the full mock details view.
          </Typography>
        </Box>
        <Stack direction="row" gap={1.5}>
          <Button variant="outlined" startIcon={<TuneOutlinedIcon />}>
            Filters Later
          </Button>
          <Button variant="contained" startIcon={<AddOutlinedIcon />}>
            Add Later
          </Button>
        </Stack>
      </Stack>
      <ApplicationList applications={mockApplications} />
    </Stack>
  );
}
