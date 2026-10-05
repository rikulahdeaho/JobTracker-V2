import MenuIcon from "@mui/icons-material/Menu";
import { Box, IconButton, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

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
      <Sidebar
        drawerWidth={drawerWidth}
        isDesktop={isDesktop}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, bgcolor: "background.paper" }}>
        <Box sx={{ px: { xs: 2, md: 3, xl: 4 }, py: { xs: 2, md: 3.5 } }}>
          {!isDesktop ? (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1.5 }}>
              <Tooltip title="Open navigation">
                <IconButton
                  color="inherit"
                  aria-label="Open navigation"
                  onClick={toggleDrawer}
                  sx={{ border: 1, borderColor: "divider" }}
                >
                  <MenuIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ) : null}
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
