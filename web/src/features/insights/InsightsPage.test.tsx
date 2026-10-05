import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import { ApplicationsContext } from "../applications/context/ApplicationsContext";
import type { ApplicationStatus, JobApplication } from "../applications/types/application";
import { applicationFixture } from "../../test/applicationFixture";
import { InsightsPage } from "./InsightsPage";

function renderInsights(applications: JobApplication[]) {
  render(<MemoryRouter><ApplicationsContext.Provider value={{ applications, isPending: false, error: null,
    refetch: vi.fn(), addApplication: vi.fn(), updateApplication: vi.fn(), deleteApplication: vi.fn() }}>
    <InsightsPage />
  </ApplicationsContext.Provider></MemoryRouter>);
}

it("uses current active stages as the denominator while preserving closed and draft distribution", () => {
  const statuses: ApplicationStatus[] = ["Draft", "ToApply", "Applied", "Interviewing", "Assignment", "Offer", "Rejected", "Ghosted", "Withdrawn"];
  renderInsights(statuses.map(status => applicationFixture({ id: status, status })));
  expect(screen.getByText("3 of 4")).toBeInTheDocument();
  expect(screen.getByText(/75% of active hiring processes/)).toBeInTheDocument();
  expect(screen.getByText("3 closed · Rejected, Ghosted or Withdrawn.")).toBeInTheDocument();
  expect(screen.getAllByText("1 of 9")).toHaveLength(9);
});

it("shows no active processes instead of a zero percent response measure", () => {
  renderInsights([applicationFixture({ status: "Rejected" })]);
  expect(screen.getByText(/No active hiring processes\./)).toBeInTheDocument();
  expect(screen.queryByText(/0%/)).not.toBeInTheDocument();
});

it("links actionable drafts directly to Details and presents optional context as saved counts", () => {
  renderInsights([applicationFixture({ id: "draft", status: "Draft", jobUrl: "https://example.com/job", notes: null })]);
  expect(screen.getByRole("link", { name: "Backend Developer · Example Company" })).toHaveAttribute("href", "/applications/draft");
  expect(screen.getByText("Finish application")).toBeInTheDocument();
  expect(screen.getByText("Job URL saved").parentElement).toHaveTextContent("1 of 1");
  expect(screen.getByText("Notes saved").parentElement).toHaveTextContent("0 of 1");
  expect(within(screen.getByText("Saved context").closest("section") ?? document.body).queryByRole("progressbar")).not.toBeInTheDocument();
});
