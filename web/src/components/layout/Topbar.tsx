import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { AppBar, Avatar, Box, IconButton, InputBase, Toolbar, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { PropsWithChildren } from "react";
import { useLocation } from "react-router-dom";

const titleByPath: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/applications": "Applications",
  "/schedule": "Schedule",
  "/insights": "Insights",
  "/settings": "Settings",
};

export function Topbar({ children }: PropsWithChildren) {
  const location = useLocation();
  const title = location.pathname.startsWith("/applications/")
    ? "Application Details"
    : titleByPath[location.pathname] ?? "JobTracker";

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        width: { lg: "calc(100% - 260px)" },
        ml: { lg: "260px" },
        bgcolor: "rgba(245, 247, 251, 0.94)",
        borderBottom: 1,
        borderColor: "divider",
        backdropFilter: "blur(10px)",
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        {children}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
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
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            minWidth: 220,
          }}
        >
          <SearchOutlinedIcon fontSize="small" color="action" />
          <InputBase placeholder="Search later" sx={{ fontSize: 14, width: "100%" }} />
        </Box>
        <IconButton color="inherit">
          <NotificationsNoneOutlinedIcon />
        </IconButton>
        <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main" }}>JT</Avatar>
      </Toolbar>
    </AppBar>
  );
}
