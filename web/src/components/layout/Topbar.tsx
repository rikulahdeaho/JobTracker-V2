import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import { AppBar, Avatar, Box, IconButton, Toolbar, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { PropsWithChildren } from "react";
import { useLocation } from "react-router-dom";
import { useThemeMode } from "../../app/useThemeMode";

const titleByPath: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/applications": "Applications",
  "/schedule": "Schedule",
  "/insights": "Insights",
  "/settings": "Settings",
};

export function Topbar({ children }: PropsWithChildren) {
  const location = useLocation();
  const { mode, toggleMode } = useThemeMode();
  const title = location.pathname.startsWith("/applications/")
    ? "Application Details"
    : titleByPath[location.pathname] ?? "JobTracker";
  const isDark = mode === "dark";
  const helperText = location.pathname === "/applications"
    ? "Search and filters are available in the application workspace below."
    : "Career Co-pilot workspace powered by local mock data.";

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        width: { lg: "calc(100% - 260px)" },
        ml: { lg: "260px" },
        bgcolor: (theme) =>
          alpha(theme.palette.background.default, isDark ? 0.92 : 0.94),
        borderBottom: 1,
        borderColor: "divider",
        backdropFilter: "blur(10px)",
      }}
    >
      <Toolbar sx={{ gap: { xs: 1.25, md: 2 }, minHeight: { xs: 64, md: 72 } }}>
        {children}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ lineHeight: 1.25 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
            {helperText}
          </Typography>
        </Box>
        <Tooltip title="Notifications are not enabled in this prototype">
          <IconButton
            color="inherit"
            aria-label="Notifications are not enabled"
            sx={{ border: 1, borderColor: "divider" }}
          >
            <NotificationsNoneOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={`Switch to ${isDark ? "light" : "dark"} mode`}>
          <IconButton color="inherit" onClick={toggleMode} aria-label="Toggle color mode" sx={{ border: 1, borderColor: "divider" }}>
            {isDark ? <WbSunnyOutlinedIcon /> : <DarkModeOutlinedIcon />}
          </IconButton>
        </Tooltip>
        <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main" }}>JT</Avatar>
      </Toolbar>
    </AppBar>
  );
}
