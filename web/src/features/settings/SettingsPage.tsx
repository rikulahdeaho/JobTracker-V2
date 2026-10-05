import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Divider, FormControlLabel, Grid, Stack, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import type { ThemeMode } from "../../app/theme";
import { useThemeMode } from "../../app/useThemeMode";
import { PageHeader, PageShell, SectionCard } from "../../components/ui/PageSection";

export function SettingsPage() {
  const { mode, setMode } = useThemeMode();
  return (
    <PageShell>
      <PageHeader title="Settings" description="Make JobTracker comfortable to use." />
      <SectionCard variant="plain" title="Appearance" description="Choose a theme. JobTracker remembers your choice in this browser.">
        <ToggleButtonGroup exclusive value={mode} onChange={(_, nextMode: ThemeMode | null) => { if (nextMode) setMode(nextMode); }}
          aria-label="Theme mode" sx={{ alignSelf: "flex-start", gap: 1.5, "& .MuiToggleButtonGroup-grouped": { border: "1px solid", borderColor: "divider", borderRadius: "8px !important", px: 3, py: 2 }, "& .Mui-selected": { color: "primary.main", bgcolor: "action.selected" } }}>
          <ToggleButton value="light">
            <Stack direction="row" gap={1} alignItems="center">
              <LightModeOutlinedIcon fontSize="small" />Light</Stack>
          </ToggleButton>
          <ToggleButton value="dark">
            <Stack direction="row" gap={1} alignItems="center">
              <DarkModeOutlinedIcon fontSize="small" />Dark</Stack>
          </ToggleButton>
        </ToggleButtonGroup>
      </SectionCard>
      <Divider />
      <Box>
        <Typography component="h2" variant="h6">Your data</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: "65ch" }}>Your applications are saved to your account and stay available after refresh. Search and filters only change the current view.</Typography>
      </Box>
      <Accordion disableGutters elevation={0} slotProps={{ heading: { component: "h2" } }} sx={{ borderTop: 1, borderColor: "divider", bgcolor: "transparent", "&:before": { display: "none" } }}>
        <AccordionSummary expandIcon={<ExpandMoreOutlinedIcon />} id="settings-preview-heading" aria-controls="settings-preview-content" sx={{ px: 0, minHeight: 64 }}>
          <Box>
            <Typography component="span" variant="h6">Future preferences</Typography>
            <Typography variant="body2" color="text.secondary">Preview only · these controls are not available yet</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails id="settings-preview-content" sx={{ px: 0, pt: 2 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard variant="plain" headingComponent="h3" title="Profile preview" description="Example values. Your signed-in account is shown in the navigation.">
                <Stack gap={2}>
                  <TextField disabled label="Display name" defaultValue="Riku" fullWidth />
                  <TextField disabled label="Target role" defaultValue="Frontend Engineer" fullWidth />
                  <TextField disabled label="Preferred location" defaultValue="Helsinki or remote" fullWidth />
                </Stack>
              </SectionCard>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard variant="plain" headingComponent="h3" title="Tracking preferences" description="Preview values do not change your current suggestions.">
                <Stack gap={2}>
                  <TextField disabled label="Default follow-up" defaultValue="14" fullWidth InputProps={{ endAdornment: "days" }} />
                  <TextField disabled label="Status review indicator" defaultValue="30" fullWidth InputProps={{ endAdornment: "days" }} />
                  <FormControlLabel disabled control={<Switch defaultChecked />} label="Highlight applications needing follow-up" />
                  <FormControlLabel disabled control={<Switch defaultChecked />} label="Show deadlines prominently on dashboard cards" />
                  <FormControlLabel disabled control={<Switch />} label="Use compact application cards later" />
                </Stack>
              </SectionCard>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider />
              <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} sx={{ mt: 2 }}>
                <Button disabled variant="outlined" startIcon={<SaveOutlinedIcon />}>Export applications</Button>
                <Button disabled startIcon={<RestartAltOutlinedIcon />}>Demo reset unavailable</Button>
              </Stack>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </PageShell>
  );
}
