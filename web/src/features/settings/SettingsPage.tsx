import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import type { ThemeMode } from "../../app/theme";
import { useThemeMode } from "../../app/useThemeMode";
import { PageHeader, PageShell, SectionCard } from "../../components/ui/PageSection";
import { useApplications } from "../applications/context/ApplicationsContext";

export function SettingsPage() {
  const { mode, setMode } = useThemeMode();
  const { resetApplications } = useApplications();
  const isDark = mode === "dark";

  return (
    <PageShell maxWidth={1120}>
      <PageHeader
        title="Settings"
        description="A simple prototype settings screen to show how profile, preferences, and local data controls could be organized later."
      />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard
            title="Appearance"
            description="Choose the prototype theme. The selection is saved locally and survives refreshes."
            action={isDark ? <DarkModeOutlinedIcon color="action" /> : <LightModeOutlinedIcon color="action" />}
          >
            <Stack gap={2.25}>
              <ToggleButtonGroup
                exclusive
                value={mode}
                onChange={(_, nextMode: ThemeMode | null) => {
                  if (nextMode) {
                    setMode(nextMode);
                  }
                }}
                aria-label="Theme mode"
                size="small"
                sx={{
                  width: "fit-content",
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 0.5,
                  "& .MuiToggleButtonGroup-grouped": {
                    border: 0,
                    borderRadius: 1.5,
                    px: 2.5,
                  },
                }}
              >
                <ToggleButton value="light">
                  <Stack direction="row" gap={1} alignItems="center">
                    <LightModeOutlinedIcon fontSize="small" />
                    Light
                  </Stack>
                </ToggleButton>
                <ToggleButton value="dark">
                  <Stack direction="row" gap={1} alignItems="center">
                    <DarkModeOutlinedIcon fontSize="small" />
                    Dark
                  </Stack>
                </ToggleButton>
              </ToggleButtonGroup>
              <Chip
                icon={<TuneOutlinedIcon />}
                label="Theme mode is saved locally"
                color="secondary"
                variant="outlined"
                sx={{ alignSelf: "flex-start" }}
              />
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard
            title="Profile placeholder"
            description="No authentication is implemented yet, but this shows the future account area without adding Clerk."
            action={<Chip icon={<CheckCircleOutlineOutlinedIcon />} label="Mock only" color="primary" variant="outlined" />}
          >
            <Stack gap={2}>
              <TextField label="Display name" defaultValue="Riku" fullWidth />
              <TextField label="Target role" defaultValue="Frontend Engineer" fullWidth />
              <TextField label="Preferred location" defaultValue="Helsinki or remote" fullWidth />
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard
            title="Tracking preferences"
            description="Prototype-only defaults for how the local next-action logic should feel later."
          >
            <Stack gap={2.25}>
              <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
                <TextField label="Default follow-up" defaultValue="14" fullWidth InputProps={{ endAdornment: "days" }} />
                <TextField label="Ghosted risk indicator" defaultValue="30" fullWidth InputProps={{ endAdornment: "days" }} />
              </Stack>
              <Divider />
              <FormControlLabel control={<Switch defaultChecked />} label="Highlight applications needing follow-up" />
              <FormControlLabel control={<Switch defaultChecked />} label="Show deadlines prominently on dashboard cards" />
              <FormControlLabel control={<Switch />} label="Use compact application cards later" />
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard
            title="Data management"
            description="The current MVP stores application data in this browser only."
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
              <Button
                variant="outlined"
                color="error"
                startIcon={<RestartAltOutlinedIcon />}
                onClick={resetApplications}
                sx={{ alignSelf: "flex-start" }}
              >
                Reset demo data
              </Button>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </PageShell>
  );
}
