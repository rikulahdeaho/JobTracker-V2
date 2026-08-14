import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { ApplicationDetailsPage } from "../features/applications/pages/ApplicationDetailsPage";
import { ApplicationsPage } from "../features/applications/pages/ApplicationsPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { InsightsPage } from "../features/insights/InsightsPage";
import { SchedulePage } from "../features/schedule/SchedulePage";
import { SettingsPage } from "../features/settings/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "applications",
        element: <ApplicationsPage />,
      },
      {
        path: "applications/:id",
        element: <ApplicationDetailsPage />,
      },
      {
        path: "schedule",
        element: <SchedulePage />,
      },
      {
        path: "insights",
        element: <InsightsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);
