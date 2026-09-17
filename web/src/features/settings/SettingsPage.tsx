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

export function SettingsPage() {
  const { mode, setMode } = useThemeMode();
  const isDark = mode === "dark";

  return (
    <PageShell>
      <PageHeader
        title="Settings"
        description="Manage appearance and preview future profile and tracking preferences."
      />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard
            title="Appearance"
            description="Choose your theme. The selection is saved locally and survives refreshes."
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
            description="A preview of future profile preferences. Your signed-in account is shown in the sidebar."
            action={<Chip icon={<CheckCircleOutlineOutlinedIcon />} label="Preview only" color="primary" variant="outlined" />}
          >
            <Stack gap={2}>
              <TextField label="Display name" defaultValue="Riku" fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Target role" defaultValue="Frontend Engineer" fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Preferred location" defaultValue="Helsinki or remote" fullWidth InputProps={{ readOnly: true }} />
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard
            title="Tracking preferences"
            description="A preview of future controls. These values do not affect the current local next-action logic."
            action={<Chip label="Prototype only" size="small" variant="outlined" />}
          >
            <Stack gap={2.25}>
              <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
                <TextField disabled label="Default follow-up" defaultValue="14" fullWidth InputProps={{ endAdornment: "days" }} />
                <TextField disabled label="Ghosted risk indicator" defaultValue="30" fullWidth InputProps={{ endAdornment: "days" }} />
              </Stack>
              <Divider />
              <FormControlLabel disabled control={<Switch defaultChecked />} label="Highlight applications needing follow-up" />
              <FormControlLabel disabled control={<Switch defaultChecked />} label="Show deadlines prominently on dashboard cards" />
              <FormControlLabel disabled control={<Switch />} label="Use compact application cards later" />
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard
            title="Data management"
            description="Applications are saved through the API. Appearance preferences stay in this browser."
            action={
              <Button disabled variant="outlined" startIcon={<SaveOutlinedIcon />}>
                Export later
              </Button>
            }
          >
            <Stack gap={2}>
              <Typography color="text.secondary">
                Saved applications persist after refresh. Search and filters affect only your current view.
              </Typography>
              <Divider />
              <Stack direction="row" gap={1.5} flexWrap="wrap">
                <Chip label="API persistence" variant="outlined" />
                <Chip label="Private to your account" variant="outlined" />
                <Chip label="Theme saved locally" color="secondary" variant="outlined" />
              </Stack>
              <Button
                variant="outlined"
                color="error"
                startIcon={<RestartAltOutlinedIcon />}
                disabled
                sx={{ alignSelf: "flex-start" }}
              >
                Demo reset unavailable with API data
              </Button>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </PageShell>
  );
}
