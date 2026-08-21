import * as React from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PageHeader, PageShell } from "../../../components/ui/PageSection";
import { ApplicationList } from "../components/ApplicationList";
import { ApplicationFormDialog } from "../components/ApplicationFormDialog";
import { useApplications } from "../context/ApplicationsContext";
import type { ApplicationStatus, JobApplicationFormValues } from "../types/application";
import {
  filterAndSortApplications,
  getApplicationSortLabel,
  type ApplicationListFilter,
  type ApplicationSortOption,
} from "../utils/applicationList";
import { applicationStatusLabel } from "../utils/applicationStatus";

export function ApplicationsPage() {
  const navigate = useNavigate();
  const { applications, addApplication } = useApplications();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | ApplicationStatus>("all");
  const [listFilter, setListFilter] = React.useState<ApplicationListFilter>("all");
  const [sortOption, setSortOption] = React.useState<ApplicationSortOption>("updatedDesc");

  const visibleApplications = React.useMemo(
    () =>
      filterAndSortApplications(applications, {
        searchTerm,
        status: statusFilter,
        filter: listFilter,
        sort: sortOption,
      }),
    [applications, listFilter, searchTerm, sortOption, statusFilter],
  );

  const hasActiveFilters =
    searchTerm.trim().length > 0 || statusFilter !== "all" || listFilter !== "all" || sortOption !== "updatedDesc";

  const handleAddApplication = (values: JobApplicationFormValues) => {
    const createdApplication = addApplication(values);
    setDialogOpen(false);
    navigate(`/applications/${createdApplication.id}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setListFilter("all");
    setSortOption("updatedDesc");
  };

  return (
    <PageShell>
      <PageHeader
        title="Applications"
        description="Review the current pipeline, track local changes across refreshes, and open any application for full details."
        actions={
          <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setDialogOpen(true)}>
            Add Application
          </Button>
        }
      />

      {applications.length > 0 ? (
        <Card>
          <CardContent>
            <Stack gap={2.5}>
              <Stack direction={{ xs: "column", xl: "row" }} gap={2}>
                <TextField
                  label="Search applications"
                  placeholder="Search company or job title"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  select
                  label="Status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as "all" | ApplicationStatus)}
                  sx={{ minWidth: { xs: "100%", sm: 180 } }}
                >
                  <MenuItem value="all">All statuses</MenuItem>
                  {(Object.keys(applicationStatusLabel) as ApplicationStatus[]).map((status) => (
                    <MenuItem key={status} value={status}>
                      {applicationStatusLabel[status]}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="View"
                  value={listFilter}
                  onChange={(event) => setListFilter(event.target.value as ApplicationListFilter)}
                  sx={{ minWidth: { xs: "100%", sm: 220 } }}
                >
                  <MenuItem value="all">All applications</MenuItem>
                  <MenuItem value="needsFollowUp">Needs follow-up</MenuItem>
                </TextField>
                <TextField
                  select
                  label="Sort by"
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value as ApplicationSortOption)}
                  sx={{ minWidth: { xs: "100%", sm: 200 } }}
                >
                  <MenuItem value="updatedDesc">Recently updated</MenuItem>
                  <MenuItem value="appliedDesc">Applied date</MenuItem>
                  <MenuItem value="deadlineAsc">Deadline</MenuItem>
                </TextField>
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} gap={1.5} justifyContent="space-between">
                <Stack direction="row" gap={1} flexWrap="wrap">
                  <Chip label={`${visibleApplications.length} result${visibleApplications.length === 1 ? "" : "s"}`} />
                  <Chip label={`Sorted by ${getApplicationSortLabel(sortOption)}`} variant="outlined" />
                  {statusFilter !== "all" ? (
                    <Chip label={`Status: ${applicationStatusLabel[statusFilter]}`} variant="outlined" />
                  ) : null}
                  {listFilter === "needsFollowUp" ? (
                    <Chip label="Needs follow-up only" color="secondary" variant="outlined" />
                  ) : null}
                </Stack>
                {hasActiveFilters ? (
                  <Button variant="text" startIcon={<CloseOutlinedIcon />} onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : null}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      {applications.length === 0 ? (
        <Card>
          <CardContent>
            <Stack gap={2}>
              <Typography variant="h6">No applications yet</Typography>
              <Typography color="text.secondary">
                Start by adding your first application. It will be saved in local storage and stay here after refresh.
              </Typography>
              <Box>
                <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setDialogOpen(true)}>
                  Add your first application
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ) : visibleApplications.length > 0 ? (
        <ApplicationList applications={visibleApplications} />
      ) : (
        <Card>
          <CardContent>
            <Stack gap={2}>
              <div>
                <Typography variant="h6" gutterBottom>
                  No matching applications
                </Typography>
                <Typography color="text.secondary">
                  Try a different search, reset filters, or add a new application to expand the list.
                </Typography>
              </div>
              <Divider />
              <Alert severity="info">
                Search matches company names and job titles. Filters can narrow by status or follow-up needs.
              </Alert>
              <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
                <Button variant="outlined" onClick={clearFilters}>
                  Reset search and filters
                </Button>
                <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setDialogOpen(true)}>
                  Add Application
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}
      <ApplicationFormDialog
        mode="add"
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleAddApplication}
      />
    </PageShell>
  );
}
