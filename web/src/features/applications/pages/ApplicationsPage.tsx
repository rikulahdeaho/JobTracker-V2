import * as React from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
  type ApplicationListFilter,
  type ApplicationSortOption,
} from "../utils/applicationList";
import { applicationStatusLabel } from "../utils/applicationStatus";

export function ApplicationsPage() {
  const { applications, addApplication, isPending, error, refetch } = useApplications();
  const [filtersOpen, setFiltersOpen] = React.useState(false);
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
        description="Keep your applications together and find your next step."
        actions={
          <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setDialogOpen(true)}>
            Add Application
          </Button>
        }
      />

      <ApplicationDataState isPending={isPending} error={error} onRetry={refetch} />

      {!isPending && !error && applications.length > 0 ? (
        <Stack gap={1.5} sx={{ pb: 1, borderBottom: 1, borderColor: "divider" }}>
          <Stack direction={{ xs: "column", sm: "row" }} gap={1} alignItems="stretch">
            <TextField
              label="Search applications" placeholder="Company or job title" value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)} fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" />
                </InputAdornment>
              }}
            />
            <Button variant="outlined" startIcon={<TuneOutlinedIcon />} aria-expanded={filtersOpen} aria-controls="application-filters"
              onClick={() => setFiltersOpen(open => !open)} sx={{ display: { xs: "inline-flex", md: "none" }, flexShrink: 0, alignSelf: { xs: "flex-end", sm: "stretch" } }}>
              Filters{statusFilter !== "all" || sortOption !== "updatedDesc" ? " · On" : ""}
            </Button>
          </Stack>
          <Stack direction={{ xs: "column", md: "row" }} gap={2} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }}>
            <ToggleButtonGroup exclusive value={listFilter} onChange={(_, nextFilter: ApplicationListFilter | null) => {
              if (nextFilter) setListFilter(nextFilter);
            }} aria-label="Application view filter" size="small" sx={{
              flexWrap: "wrap", gap: 0.5,
              "& .MuiToggleButtonGroup-grouped": { border: 0, borderRadius: "8px !important", px: { xs: 1, sm: 1.5 }, fontWeight: 500 },
              "& .Mui-selected": { color: "primary.main" }
            }}>
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="active">Active</ToggleButton>
              <ToggleButton value="archived">Archived</ToggleButton>
              <ToggleButton value="needsAttention">Needs attention</ToggleButton>
            </ToggleButtonGroup>
            <Box id="application-filters" sx={{ display: { xs: filtersOpen ? "block" : "none", md: "block" } }}>
              <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
                <TextField select label="Status" value={statusFilter} onChange={event => setStatusFilter(event.target.value as "all" | ApplicationStatus)} sx={{ minWidth: { xs: "100%", sm: 160 } }}>
                  <MenuItem value="all">All statuses</MenuItem>
                  {(Object.keys(applicationStatusLabel) as ApplicationStatus[]).map(status => <MenuItem key={status} value={status}>{applicationStatusLabel[status]}</MenuItem>)}
                </TextField>
                <TextField select label="Sort by" value={sortOption} onChange={event => setSortOption(event.target.value as ApplicationSortOption)} sx={{ minWidth: { xs: "100%", sm: 180 } }}>
                  <MenuItem value="updatedDesc">Recently updated</MenuItem>
                  <MenuItem value="appliedDesc">Applied date</MenuItem>
                  <MenuItem value="deadlineAsc">Deadline</MenuItem>
                </TextField>
              </Stack>
            </Box>
          </Stack>
          <Stack direction="row" gap={1} alignItems="center" justifyContent="space-between" flexWrap="wrap">
            <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
              <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: "tabular-nums" }}>{visibleApplications.length} result{visibleApplications.length === 1 ? "" : "s"}</Typography>
              {statusFilter !== "all" ? <Chip label={applicationStatusLabel[statusFilter]} size="small" variant="outlined" onDelete={() => setStatusFilter("all")} /> : null}
            </Stack>
            {hasActiveFilters ? <Button startIcon={<CloseOutlinedIcon />} onClick={clearFilters}>Clear filters</Button> : null}
          </Stack>
        </Stack>
      ) : null}
      {isPending || error ? null : applications.length === 0 ? (
        <Card sx={{ border: 0, bgcolor: "transparent" }}>
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            <Stack gap={2}>
              <Typography component="h2" variant="h6">No applications yet</Typography>
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
        <Card sx={{ border: 0, bgcolor: "transparent" }}>
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            <Stack gap={2}>
              <div>
                <Typography component="h2" variant="h6" gutterBottom>
                  No matching applications
                </Typography>
                <Typography color="text.secondary">
                  Try a different search, reset filters, or add a new application to expand the list.
                </Typography>
              </div>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: "75ch" }}>
                Search matches company names and job titles. Active includes drafts and all open statuses. Needs attention shows actions you can take now.
              </Typography>
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
