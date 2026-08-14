import MenuIcon from "@mui/icons-material/Menu";
import { Box, IconButton, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const drawerWidth = 260;

export function AppLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = () => {
    setMobileOpen((open) => !open);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Topbar>
        {!isDesktop ? (
          <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
        ) : null}
      </Topbar>
      <Sidebar
        drawerWidth={drawerWidth}
        isDesktop={isDesktop}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        <Toolbar />
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
