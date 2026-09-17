import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import { useClerk, useUser } from "@clerk/react";
import { useState } from "react";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import {
  Avatar,
  Alert,
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { NavLink } from "react-router-dom";
import { getSidebarColors } from "../../app/theme";
import { useThemeMode } from "../../app/useThemeMode";

type SidebarProps = {
  drawerWidth: number;
  isDesktop: boolean;
  mobileOpen: boolean;
  onClose: () => void;
};

const navigationItems = [
  { label: "Dashboard", to: "/dashboard", icon: <DashboardOutlinedIcon /> },
  { label: "Applications", to: "/applications", icon: <WorkOutlineOutlinedIcon /> },
  { label: "Schedule", to: "/schedule", icon: <TodayOutlinedIcon /> },
  { label: "Insights", to: "/insights", icon: <InsightsOutlinedIcon /> },
  { label: "Settings", to: "/settings", icon: <SettingsOutlinedIcon /> },
];

export function Sidebar({
  drawerWidth,
  isDesktop,
  mobileOpen,
  onClose,
}: SidebarProps) {
  const theme = useTheme();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [signOutError, setSignOutError] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const displayName = user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress || "Your account";
  const { mode, toggleMode } = useThemeMode();
  const sidebarColors = getSidebarColors(theme.palette.mode);
  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: sidebarColors.background,
        color: sidebarColors.text,
        borderRight: 1,
        borderColor: sidebarColors.border,
      }}
    >
      <Box sx={{ px: 3, pt: 3.5, pb: 2.5 }}>
        <Box>
          <Typography variant="h5" sx={{ color: sidebarColors.eyebrow, lineHeight: 1.05 }}>
            JobTracker
          </Typography>
          <Typography variant="body2" sx={{ color: sidebarColors.text, mt: 0.5 }}>
            Career Co-pilot
          </Typography>
        </Box>
      </Box>
      <List sx={{ px: 1.5, pt: 3 }}>
        <Typography
          variant="overline"
          sx={{ display: "block", color: sidebarColors.muted, px: 1.5, mb: 1 }}
        >
          Workspace
        </Typography>
        {navigationItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            onClick={onClose}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              minHeight: 48,
              px: 1.5,
              color: sidebarColors.text,
              "&.active": {
                bgcolor: sidebarColors.activeBackground,
                color: sidebarColors.activeText,
                borderRight: 3,
                borderColor: "primary.main",
              },
              "&:hover": {
                bgcolor: sidebarColors.hoverBackground,
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 38 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ variant: "body2", fontWeight: 700 }}
            />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ mt: "auto", p: 2.5, borderTop: 1, borderColor: sidebarColors.border }}>
        <Stack gap={2}>
          <Stack direction="row" gap={1.25} alignItems="center">
            <Avatar
              src={user?.imageUrl}
              alt={displayName}
              sx={{
                width: 34,
                height: 34,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontSize: "0.8125rem",
                fontWeight: 800,
              }}
            >
              {displayName.slice(0, 1).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ color: sidebarColors.text, fontWeight: 700 }}>
                {displayName}
              </Typography>
              <Typography variant="caption" sx={{ display: "block", color: sidebarColors.muted, mt: 0.25 }}>
                {user?.primaryEmailAddress?.emailAddress}
              </Typography>
            </Box>
          </Stack>
          {signOutError && <Alert severity="error">Sign out failed. Please try again.</Alert>}
          <Button size="small" disabled={signingOut} onClick={() => {
            setSigningOut(true);
            setSignOutError(false);
            void signOut().catch(() => { setSignOutError(true); setSigningOut(false); });
          }}>Sign out</Button>
          <Divider sx={{ borderColor: sidebarColors.border }} />
          <Stack direction="row" gap={0.75} alignItems="flex-start">
            <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "success.main", flexShrink: 0, mt: 0.75 }} />
            <Box>
              <Typography variant="body2" sx={{ color: sidebarColors.text, fontWeight: 700 }}>
                Application storage
              </Typography>
              <Typography variant="caption" sx={{ display: "block", color: sidebarColors.muted, mt: 0.25 }}>
                Saved to your tracker
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            startIcon={mode === "dark" ? <WbSunnyOutlinedIcon /> : <DarkModeOutlinedIcon />}
            onClick={toggleMode}
            sx={{
              justifyContent: "flex-start",
              color: sidebarColors.text,
              borderColor: sidebarColors.border,
              bgcolor: sidebarColors.workspaceBackground,
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: sidebarColors.hoverBackground,
              },
            }}
          >
            {mode === "dark" ? "Use light mode" : "Use dark mode"}
          </Button>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={!isDesktop && mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth, border: 0 },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        open={isDesktop}
        sx={{
          display: { xs: "none", lg: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            border: 0,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
