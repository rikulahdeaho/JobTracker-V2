import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";

function getPageTitle(pathname: string) {
  if (pathname.startsWith("/applications/")) {
    return "Application Details";
  }

  if (pathname.startsWith("/applications")) {
    return "Applications";
  }

  return "Dashboard";
}

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar title={getPageTitle(location.pathname)} />
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
