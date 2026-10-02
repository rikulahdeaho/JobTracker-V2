import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { alpha } from "@mui/material/styles";
import { Chip, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import { PageHeader, PageShell, SectionCard } from "../../components/ui/PageSection";
import { useApplications } from "../applications/context/ApplicationsContext";
import { ApplicationDataState } from "../applications/components/ApplicationDataState";
import { getApplicationsNeedingAttention } from "../applications/utils/applicationNextAction";
import { applicationStatusLabel } from "../applications/utils/applicationStatus";
import type { ApplicationStatus } from "../applications/types/application";

export function InsightsPage() {
  const { applications, isPending, error, refetch } = useApplications();

  if (isPending || error) {
    return (
      <PageShell>
        <PageHeader title="Insights" description="A summary of your application progress, pipeline, and data coverage." />
        <ApplicationDataState isPending={isPending} error={error} onRetry={refetch} />
      </PageShell>
    );
  }
  const followUps = getApplicationsNeedingAttention(applications);
  const activeApplications = applications.filter((application) =>
    ["Applied", "Interviewing", "Assignment", "Offer"].includes(application.status),
  );
  const responseStageApplications = applications.filter((application) =>
    ["Interviewing", "Assignment", "Offer"].includes(application.status),
  );
  const statusCounts = (Object.keys(applicationStatusLabel) as ApplicationStatus[])
    .map((status) => ({
      status,
      label: applicationStatusLabel[status],
      count: applications.filter((application) => application.status === status).length,
    }))
    .filter((item) => item.count > 0);

  const responseRate = activeApplications.length > 0
    ? Math.round((responseStageApplications.length / activeApplications.length) * 100)
    : 0;
  const dataCoverage = [
    {
      label: "Job URL included",
      count: applications.filter((application) => application.jobUrl).length,
    },
    {
      label: "Notes included",
      count: applications.filter((application) => application.notes).length,
    },
    {
      label: "Deadline included",
      count: applications.filter((application) => application.deadline).length,
    },
  ];

  return (
    <PageShell>
      <PageHeader
        title="Insights"
        description="A summary of your application progress, pipeline, and data coverage."
      />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard title="Response momentum" description="A quick signal for how many active processes are moving.">
            <Stack gap={2}>
              <Stack direction="row" gap={1.5} alignItems="center">
                <TrendingUpOutlinedIcon color="primary" />
                <Typography variant="h4">{responseRate}%</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={responseRate} sx={{ height: 10, borderRadius: 999 }} />
              <Typography color="text.secondary">
                {responseStageApplications.length} of {activeApplications.length || 0} active applications have moved beyond the initial applied stage.
              </Typography>
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard title="Pipeline pressure" description="Where your attention is most likely needed next.">
            <Stack gap={1.5}>
              <Chip label={`${followUps.length} need attention`} color="secondary" variant="outlined" sx={{ width: "fit-content" }} />
              <Typography color="text.secondary">
                {followUps.length > 0
                  ? "Your pipeline has items that likely need a check-in or next step soon."
                  : "Your current pipeline is relatively calm right now."}
              </Typography>
              <Typography color="text.secondary">
                {applications.filter((application) => application.status === "Offer").length} offer stage item(s) and{" "}
                {applications.filter((application) => application.status === "Interviewing").length} interview stage item(s) are currently active.
              </Typography>
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard title="Data coverage" description="A simple summary of the context saved with your applications.">
            <Stack gap={2}>
              {dataCoverage.map((item) => {
                const percentage = applications.length > 0
                  ? Math.round((item.count / applications.length) * 100)
                  : 0;

                return (
                  <Stack key={item.label} gap={0.75}>
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline" gap={2}>
                      <Typography fontWeight={700}>{item.label}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                        {item.count} of {applications.length} · {percentage}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      aria-label={`${item.label}: ${percentage}%`}
                      sx={{ height: 8, borderRadius: 999 }}
                    />
                  </Stack>
                );
              })}
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard title="Status breakdown" description="Current distribution of applications across your pipeline.">
            <Grid container spacing={2}>
              {statusCounts.map((item) => {
                const percentage = applications.length > 0 ? Math.round((item.count / applications.length) * 100) : 0;

                return (
                  <Grid key={item.status} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Stack
                      gap={1.25}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: (theme) =>
                          theme.palette.mode === "dark"
                            ? alpha(theme.palette.common.white, 0.03)
                            : alpha(theme.palette.primary.main, 0.04),
                        border: 1,
                        borderColor: "divider",
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography fontWeight={600}>{item.label}</Typography>
                        <Chip label={item.count} size="small" />
                      </Stack>
                      <LinearProgress variant="determinate" value={percentage} sx={{ height: 8, borderRadius: 999 }} />
                      <Typography color="text.secondary">{percentage}% of current applications</Typography>
                    </Stack>
                  </Grid>
                );
              })}
            </Grid>
          </SectionCard>
        </Grid>
      </Grid>
    </PageShell>
  );
}
