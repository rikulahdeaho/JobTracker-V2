import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import { AppBar, Avatar, Box, IconButton, InputBase, Toolbar, Tooltip, Typography } from "@mui/material";
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
            Track your pipeline with mock application data.
          </Typography>
        </Box>
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.75,
            borderRadius: 999,
            bgcolor: (theme) => alpha(theme.palette.primary.main, isDark ? 0.16 : 0.08),
            border: 1,
            borderColor: "divider",
            minWidth: 220,
            color: "text.secondary",
          }}
        >
          <SearchOutlinedIcon fontSize="small" color="action" />
          <InputBase placeholder="Search later" sx={{ fontSize: 14, width: "100%" }} />
        </Box>
        <IconButton color="inherit" sx={{ border: 1, borderColor: "divider" }}>
          <NotificationsNoneOutlinedIcon />
        </IconButton>
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
