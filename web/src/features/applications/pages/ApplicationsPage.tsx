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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { PageHeader, PageShell } from "../../../components/ui/PageSection";
import { ApplicationList } from "../components/ApplicationList";
import { ApplicationFormDialog } from "../components/ApplicationFormDialog";
import { ApplicationDataState } from "../components/ApplicationDataState";
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
  const { applications, addApplication, isPending, error, refetch } = useApplications();
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

  const handleAddApplication = async (values: JobApplicationFormValues) => {
    await addApplication(values);
    clearFilters();
    setDialogOpen(false);
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
        description="Review your pipeline, track progress, and open any application for full details."
        actions={
          <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setDialogOpen(true)}>
            Add Application
          </Button>
        }
      />

      <ApplicationDataState isPending={isPending} error={error} onRetry={refetch} />

      {!isPending && !error && applications.length > 0 ? (
        <Card>
          <CardContent>
            <Stack gap={2.5}>
              <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" gap={2}>
                <ToggleButtonGroup
                  exclusive
                  value={listFilter}
                  onChange={(_, nextFilter: ApplicationListFilter | null) => {
                    if (nextFilter) {
                      setListFilter(nextFilter);
                    }
                  }}
                  aria-label="Application view filter"
                  size="small"
                  sx={{
                    flexWrap: "wrap",
                    gap: 1,
                    "& .MuiToggleButtonGroup-grouped": {
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 999,
                      px: 2,
                      py: 0.75,
                    },
                  }}
                >
                  <ToggleButton value="all">All</ToggleButton>
                  <ToggleButton value="active">Active</ToggleButton>
                  <ToggleButton value="archived">Archived</ToggleButton>
                  <ToggleButton value="needsAttention">Needs attention</ToggleButton>
                </ToggleButtonGroup>
                <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
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
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} gap={2}>
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
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} gap={1.5} justifyContent="space-between">
                <Stack direction="row" gap={1} flexWrap="wrap">
                  <Chip label={`${visibleApplications.length} result${visibleApplications.length === 1 ? "" : "s"}`} />
                  <Chip label={`Sorted by ${getApplicationSortLabel(sortOption)}`} variant="outlined" />
                  {statusFilter !== "all" ? (
                    <Chip label={`Status: ${applicationStatusLabel[statusFilter]}`} variant="outlined" />
                  ) : null}
                  {listFilter === "needsAttention" ? (
                    <Chip label="Needs attention only" color="secondary" variant="outlined" />
                  ) : null}
                  {listFilter === "active" ? (
                    <Chip label="Active pipeline" color="primary" variant="outlined" />
                  ) : null}
                  {listFilter === "archived" ? (
                    <Chip label="Archived outcomes" variant="outlined" />
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

      {isPending || error ? null : applications.length === 0 ? (
        <Card>
          <CardContent>
            <Stack gap={2}>
              <Typography variant="h6">No applications yet</Typography>
              <Typography color="text.secondary">
                Start by adding your first application. Your saved applications will stay here after refresh.
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
                Search matches company names and job titles. Active includes drafts and all open statuses. Needs attention shows actions you can take now.
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
      {dialogOpen ? (
        <ApplicationFormDialog
          mode="add"
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleAddApplication}
        />
      ) : null}
    </PageShell>
  );
}
