import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import {
  Button,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { PageHeader, PageShell, SectionCard } from "../../components/ui/PageSection";

export function SettingsPage() {
  return (
    <PageShell maxWidth={1120}>
      <PageHeader
        title="Settings"
        description="A simple prototype settings screen to show how profile, preferences, and local data controls could be organized later."
      />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard
            title="Profile placeholder"
            description="No authentication is implemented yet, but this shows the shape of a future personal settings area."
            action={<Chip icon={<CheckCircleOutlineOutlinedIcon />} label="Mock only" color="primary" variant="outlined" />}
          >
            <Stack gap={2}>
              <TextField label="Display name" defaultValue="Riku" fullWidth />
              <TextField label="Target role" defaultValue="Frontend Engineer" fullWidth />
              <TextField label="Preferred location" defaultValue="Helsinki or remote" fullWidth />
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard
            title="Preferences placeholder"
            description="Prototype toggles for how the app could behave during the local-first phase."
            action={<TuneOutlinedIcon color="action" />}
          >
            <Stack gap={1}>
              <FormControlLabel control={<Switch defaultChecked />} label="Highlight applications needing follow-up" />
              <FormControlLabel control={<Switch defaultChecked />} label="Show deadlines prominently on dashboard cards" />
              <FormControlLabel control={<Switch />} label="Compact application cards" />
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <SectionCard
            title="Local data management"
            description="The current prototype persists applications in localStorage only."
            action={
              <Button variant="outlined" startIcon={<SaveOutlinedIcon />}>
                Export later
              </Button>
            }
          >
            <Stack gap={2}>
              <Typography color="text.secondary">
                Your application list, edits, deletes, search state, and refinement work remain local to this browser until backend work begins.
              </Typography>
              <Divider />
              <Stack direction={{ xs: "column", md: "row" }} gap={1.5}>
                <Chip label="No API connected" variant="outlined" />
                <Chip label="No account required" variant="outlined" />
                <Chip label="Local storage enabled" color="secondary" variant="outlined" />
              </Stack>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </PageShell>
  );
}
