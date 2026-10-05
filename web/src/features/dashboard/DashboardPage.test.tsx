import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import { ApplicationsContext } from "../applications/context/ApplicationsContext";
import type { ApplicationStatus, JobApplication } from "../applications/types/application";
import { applicationFixture, eventFixture } from "../../test/applicationFixture";
import { DashboardPage } from "./DashboardPage";

function renderDashboard(applications: JobApplication[]) {
  render(<MemoryRouter>
    <ApplicationsContext.Provider value={{ applications, isPending: false, error: null,
      refetch: vi.fn(), addApplication: vi.fn(), updateApplication: vi.fn(), deleteApplication: vi.fn() }}>
      <DashboardPage />
    </ApplicationsContext.Provider>
  </MemoryRouter>);
}

it("preserves active-process counts without the removed pipeline panel", () => {
  const statuses: ApplicationStatus[] = ["Draft", "ToApply", "Applied", "Interviewing", "Assignment", "Offer", "Rejected", "Ghosted", "Withdrawn"];
  renderDashboard(statuses.map(status => applicationFixture({ id: status, status })));
  expect(screen.getByText("Active hiring processes").parentElement).toHaveTextContent("Active hiring processes4");
  expect(screen.queryByText("Pipeline snapshot")).not.toBeInTheDocument();
});

it("does not mark a fresh application waiting for a reply as needing attention", () => {
  renderDashboard([applicationFixture({ events: [eventFixture({ occurredAt: new Date().toISOString() })] })]);
  expect(screen.getByRole("heading", { name: /Wait for response/ })).toBeInTheDocument();
  expect(screen.queryByText("High priority")).not.toBeInTheDocument();
  expect(screen.getAllByText("Needs attention")).toHaveLength(1);
});

it("shows a clear state when every application is closed", () => {
  renderDashboard([applicationFixture({ status: "Rejected" })]);
  expect(screen.getByText("No next actions for your current applications.")).toBeInTheDocument();
  expect(screen.queryByText("High priority")).not.toBeInTheDocument();
  expect(screen.queryByText(/Add applications to surface/)).not.toBeInTheDocument();
});
