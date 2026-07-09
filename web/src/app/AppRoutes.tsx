import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { ApplicationDetailsPage } from "../features/applications/pages/ApplicationDetailsPage";
import { ApplicationsPage } from "../features/applications/pages/ApplicationsPage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route
          path="/applications/:id"
          element={<ApplicationDetailsPage />}
        />
      </Route>
    </Routes>
  );
}
