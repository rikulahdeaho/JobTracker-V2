import * as React from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ApplicationList } from "../components/ApplicationList";
import { ApplicationFormDialog } from "../components/ApplicationFormDialog";
import { useApplications } from "../context/ApplicationsContext";
import type { JobApplicationFormValues } from "../types/application";

export function ApplicationsPage() {
  const navigate = useNavigate();
  const { applications, addApplication } = useApplications();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleAddApplication = (values: JobApplicationFormValues) => {
    const createdApplication = addApplication(values);
    setDialogOpen(false);
    navigate(`/applications/${createdApplication.id}`);
  };

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
          <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setDialogOpen(true)}>
            Add Application
          </Button>
        </Stack>
      </Stack>
      {applications.length > 0 ? (
        <ApplicationList applications={applications} />
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              No applications yet
            </Typography>
            <Typography color="text.secondary">
              Start by adding your first application to the local tracker.
            </Typography>
          </CardContent>
        </Card>
      )}
      <ApplicationFormDialog
        mode="add"
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleAddApplication}
      />
    </Stack>
  );
}
