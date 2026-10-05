import { Box, Grid, Link, List, ListItem, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PageHeader, PageShell, SectionCard } from "../../components/ui/PageSection";
import { useApplications } from "../applications/context/ApplicationsContext";
import { ApplicationDataState } from "../applications/components/ApplicationDataState";
import { StatusChip } from "../applications/components/StatusChip";
import { getApplicationNextAction, getApplicationsNeedingAttention } from "../applications/utils/applicationNextAction";
import { applicationStatusLabel } from "../applications/utils/applicationStatus";
import type { ApplicationStatus } from "../applications/types/application";

export function InsightsPage() {
  const { applications, isPending, error, refetch } = useApplications();
  if (isPending || error) return <PageShell>
    <PageHeader title="Insights" description="Your current hiring stages and saved application context." />
    <ApplicationDataState isPending={isPending} error={error} onRetry={refetch} />
  </PageShell>;
  const attention = getApplicationsNeedingAttention(applications);
  const activeCount = applications.filter(application => ["Applied", "Interviewing", "Assignment", "Offer"].includes(application.status)).length;
  const laterStageCount = applications.filter(application => ["Interviewing", "Assignment", "Offer"].includes(application.status)).length;
  const closedCount = applications.filter(application => ["Rejected", "Ghosted", "Withdrawn"].includes(application.status)).length;
  const statusCounts = (Object.keys(applicationStatusLabel) as ApplicationStatus[]).map(status => ({
    status, count: applications.filter(application => application.status === status).length,
  })).filter(item => item.count > 0);
  const savedContext = [
    { label: "Job URL saved", count: applications.filter(application => application.jobUrl).length },
    { label: "Notes saved", count: applications.filter(application => application.notes).length },
    { label: "Application due date saved", count: applications.filter(application => application.deadline).length },
  ];
  return <PageShell>
    <PageHeader title="Insights" description="Your current hiring stages and saved application context." />
    <Grid container spacing={{ xs: 4, md: 5 }}>
      <Grid size={{ xs: 12, md: 7 }}><Stack gap={4}>
        <SectionCard variant="plain" title="Current hiring stages" description="A snapshot of your saved statuses.">
          {activeCount > 0 ? <>
            <Typography sx={{ fontVariantNumeric: "tabular-nums" }}><Box component="span" fontWeight={600}>{laterStageCount} of {activeCount}</Box> active hiring processes are currently in Interviewing, Assignment or Offer.</Typography>
            <Typography variant="body2" color="text.secondary">{Math.round(laterStageCount / activeCount * 100)}% of active hiring processes · current stages, not a historical response rate.</Typography>
          </> : <Typography color="text.secondary">No active hiring processes. Applied, Interviewing, Assignment and Offer applications will appear in this summary.</Typography>}
          <Typography variant="body2" color="text.secondary">{closedCount} closed · Rejected, Ghosted or Withdrawn.</Typography>
        </SectionCard>
        <SectionCard variant="plain" title="Status breakdown" description="Your saved stages, including drafts and closed applications.">
          {statusCounts.length === 0 ? <Typography color="text.secondary">No applications saved yet.</Typography> : null}
          <Box component="dl" sx={{ m: 0 }}>{statusCounts.map(item => <Stack key={item.status} direction="row" justifyContent="space-between" alignItems="center" gap={2} sx={{ py: 1.5, borderBottom: 1, borderColor: "divider" }}>
            <Box component="dt"><StatusChip status={item.status} /></Box>
            <Typography component="dd" sx={{ m: 0, fontVariantNumeric: "tabular-nums" }}>{item.count} of {applications.length}</Typography>
          </Stack>)}</Box>
        </SectionCard>
      </Stack></Grid>
      <Grid size={{ xs: 12, md: 5 }}><Stack gap={4}>
        <SectionCard variant="plain" title="Suggested next steps" description="Actions suggested from your applications and recorded activity.">
          <Typography sx={{ fontVariantNumeric: "tabular-nums" }}>{attention.length} application{attention.length === 1 ? "" : "s"} with a suggested action</Typography>
          {attention.length > 0 ? <List disablePadding>{attention.map(application => <ListItem key={application.id} disableGutters sx={{ py: 1.5, borderBottom: 1, borderColor: "divider" }}>
            <Stack gap={0.75} sx={{ minWidth: 0 }}>
              <Link component={RouterLink} to={`/applications/${application.id}`} fontWeight={600}>{application.jobTitle} · {application.companyName}</Link>
              <Typography variant="body2" color="text.secondary">{getApplicationNextAction(application).title}</Typography>
            </Stack>
          </ListItem>)}</List> : <Typography color="text.secondary">No actions suggested right now. Waiting for a response is a valid next step.</Typography>}
        </SectionCard>
        <SectionCard variant="plain" title="Saved context" description="Optional information you have saved for reference.">
          <Box component="dl" sx={{ m: 0 }}>{savedContext.map(item => <Stack key={item.label} direction="row" justifyContent="space-between" alignItems="baseline" gap={2} sx={{ py: 1.5, borderBottom: 1, borderColor: "divider" }}>
            <Typography component="dt">{item.label}</Typography>
            <Typography component="dd" color="text.secondary" sx={{ m: 0, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{item.count} of {applications.length}</Typography>
          </Stack>)}</Box>
          <Typography variant="body2" color="text.secondary">Save what is useful to you. These fields are optional.</Typography>
        </SectionCard>
      </Stack></Grid>
    </Grid>
  </PageShell>;
}
