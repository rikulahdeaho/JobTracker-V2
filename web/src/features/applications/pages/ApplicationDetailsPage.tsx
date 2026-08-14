import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import LaunchOutlinedIcon from "@mui/icons-material/LaunchOutlined";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Divider,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { mockApplications } from "../data/mockApplications";
import { StatusChip } from "../components/StatusChip";

export function ApplicationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const application = mockApplications.find((item) => item.id === id);

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
              <StatusChip status={application.status} />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} gap={4} flexWrap="wrap">
              <DetailItem label="Location" value={application.location} />
              <DetailItem label="Source" value={application.source} />
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
