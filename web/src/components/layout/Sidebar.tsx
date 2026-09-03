import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { NavLink } from "react-router-dom";
import { getSidebarColors } from "../../app/theme";

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
      <Toolbar sx={{ px: 3, minHeight: { xs: 64, md: 72 } }}>
        <Box>
          <Typography variant="h5" sx={{ color: sidebarColors.eyebrow, lineHeight: 1.05 }}>
            JobTracker
          </Typography>
          <Typography variant="body2" sx={{ color: sidebarColors.text, mt: 0.5 }}>
            Career Co-pilot
          </Typography>
        </Box>
      </Toolbar>
      <List sx={{ px: 1.5, pt: 4 }}>
        {navigationItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            onClick={onClose}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: sidebarColors.text,
              "&.active": {
                bgcolor: sidebarColors.activeBackground,
                color: sidebarColors.activeText,
                borderRight: 3,
                borderColor: "primary.main",
              },
              "&:hover": {
                bgcolor: sidebarColors.activeBackground,
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ mt: "auto", p: 3 }}>
        <Typography variant="caption" sx={{ color: sidebarColors.muted, fontWeight: 700 }}>
          Local mock workspace
        </Typography>
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
