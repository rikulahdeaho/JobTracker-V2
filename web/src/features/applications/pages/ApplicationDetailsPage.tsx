import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LaunchOutlinedIcon from "@mui/icons-material/LaunchOutlined";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Link,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { ApplicationFormDialog } from "../components/ApplicationFormDialog";
import { NextActionChip } from "../components/NextActionChip";
import { StatusChip } from "../components/StatusChip";
import { useApplications } from "../context/ApplicationsContext";
import type { JobApplicationFormValues } from "../types/application";
import { toApplicationFormValues } from "../utils/applicationForm";
import { getApplicationNextAction } from "../utils/applicationNextAction";

export function ApplicationDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getApplicationById, updateApplication, deleteApplication } = useApplications();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const application = id ? getApplicationById(id) : undefined;

  if (!application) {
    return (
      <Stack gap={2}>
        <Button
          component={RouterLink}
          to="/applications"
          startIcon={<ArrowBackOutlinedIcon />}
          sx={{ alignSelf: "flex-start" }}
        >
          Back to applications
        </Button>
        <Alert severity="warning">Application not found in the current mock dataset.</Alert>
      </Stack>
    );
  }

  const nextAction = getApplicationNextAction(application);

  const handleUpdateApplication = (values: JobApplicationFormValues) => {
    updateApplication(application.id, values);
    setEditOpen(false);
  };

  const handleDeleteApplication = () => {
    const deleted = deleteApplication(application.id);

    if (deleted) {
      navigate("/applications");
    }
  };

  return (
    <Stack gap={3}>
      <Button
        component={RouterLink}
        to="/applications"
        startIcon={<ArrowBackOutlinedIcon />}
        sx={{ alignSelf: "flex-start" }}
      >
        Back to applications
      </Button>
      <Stack direction="row" gap={1.5} flexWrap="wrap">
        <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => setEditOpen(true)}>
          Edit
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteOutlineOutlinedIcon />}
          onClick={() => setDeleteOpen(true)}
        >
          Delete
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Stack gap={3}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2}>
              <div>
                <Typography variant="h4" gutterBottom>
                  {application.jobTitle}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {application.companyName}
                </Typography>
              </div>
              <Stack direction="row" gap={1} flexWrap="wrap">
                <StatusChip status={application.status} />
                <NextActionChip application={application} />
              </Stack>
            </Stack>

            <Card variant="outlined">
              <CardContent>
                <Stack gap={1.5}>
                  <Typography variant="h6">Next action</Typography>
                  <Typography fontWeight={600}>{nextAction.title}</Typography>
                  <Typography color="text.secondary">{nextAction.description}</Typography>
                  {(nextAction.isNeedsFollowUp || nextAction.isGhostedRisk) ? (
                    <List dense disablePadding>
                      {nextAction.isNeedsFollowUp ? (
                        <ListItem disableGutters>
                          <ListItemText primary="Needs follow-up attention" />
                        </ListItem>
                      ) : null}
                      {nextAction.isGhostedRisk ? (
                        <ListItem disableGutters>
                          <ListItemText primary="Older than 30 days without activity" />
                        </ListItem>
                      ) : null}
                    </List>
                  ) : null}
                </Stack>
              </CardContent>
            </Card>

            <Stack direction={{ xs: "column", md: "row" }} gap={4} flexWrap="wrap">
              <DetailItem label="Location" value={application.location} />
              <DetailItem label="Source" value={application.source} />
              <DetailItem label="Salary range" value={application.salaryRange || "Not specified"} />
              <DetailItem label="Applied date" value={application.appliedDate ?? "Not applied yet"} />
              <DetailItem label="Deadline" value={application.deadline ?? "No deadline"} />
              <DetailItem label="Created" value={application.createdAt.slice(0, 10)} />
              <DetailItem label="Updated" value={application.updatedAt.slice(0, 10)} />
            </Stack>

            <Divider />

            <div>
              <Typography variant="overline" color="text.secondary">
                Job URL
              </Typography>
              <Stack direction="row" alignItems="center" gap={1}>
                <Link href={application.jobUrl} target="_blank" rel="noreferrer" underline="hover">
                  {application.jobUrl}
                </Link>
                <LaunchOutlinedIcon fontSize="small" color="action" />
              </Stack>
            </div>

            <div>
              <Typography variant="overline" color="text.secondary">
                Notes
              </Typography>
              <Typography>{application.notes}</Typography>
            </div>

            <div>
              <Typography variant="overline" color="text.secondary">
                Job Description
              </Typography>
              <Typography>{application.jobDescription}</Typography>
            </div>
          </Stack>
        </CardContent>
      </Card>
      <ApplicationFormDialog
        mode="edit"
        open={editOpen}
        initialValues={toApplicationFormValues(application)}
        onClose={() => setEditOpen(false)}
        onSubmit={handleUpdateApplication}
      />
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete application?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This removes {application.companyName} - {application.jobTitle} from the current local state.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteApplication}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

type DetailItemProps = {
  label: string;
  value: string;
};

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Typography>{value}</Typography>
    </div>
  );
}
