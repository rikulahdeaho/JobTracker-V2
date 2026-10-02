import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { apiClient, bindApiSession } from "../../../lib/apiClient";
import { applicationFixture, eventFixture } from "../../../test/applicationFixture";
import { ApplicationsProvider } from "../context/ApplicationsProvider";
import { ApplicationsPage } from "./ApplicationsPage";
import { ApplicationDetailsPage } from "./ApplicationDetailsPage";
import { SchedulePage } from "../../schedule/SchedulePage";

const originalAdapter = apiClient.defaults.adapter;
let queryClient: QueryClient;
let unbindSession: () => void;
const http = vi.fn<AxiosAdapter>();

it("keeps review active without a write, then manually marks Ghosted through the normal update", async () => {
  const user = userEvent.setup();
  let application = applicationFixture({ events: [eventFixture({ occurredAt: "2020-01-01T00:00:00Z" })] });
  http.mockImplementation(async config => {
    if (config.method === "put") {
      expect(JSON.parse(String(config.data))).toMatchObject({ status: "Ghosted", applicationMethod: "Unknown", followUpMode: "Unknown" });
      application = { ...application, status: "Ghosted" };
      return response(config, application);
    }
    return response(config, config.url === "/api/applications" ? [application] : application);
  });
  renderPage(`/applications/${application.id}`);
  await user.click(await screen.findByRole("button", { name: "Keep active" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Review status remains available");
  expect(screen.getByRole("heading", { name: "Review status" })).toBeInTheDocument();
  expect(http.mock.calls.some(([config]) => config.method !== "get")).toBe(false);
  await user.click(screen.getByRole("button", { name: "Mark as ghosted" }));
  expect(await screen.findByRole("heading", { name: "No action" })).toBeInTheDocument();
  expect(queryClient.getQueryData(["applications"])).toEqual([application]);
});

it("edits contact information and validates the direct channel before saving", async () => {
  const user = userEvent.setup();
  let application = applicationFixture();
  http.mockImplementation(async config => {
    if (config.method === "put") {
      expect(JSON.parse(String(config.data))).toMatchObject({ applicationMethod: "CompanyPortal", followUpMode: "Possible", contactPerson: "Recruiter", contactEmail: "recruiter@example.com" });
      application = { ...application, applicationMethod: "CompanyPortal", followUpMode: "Possible", contactPerson: "Recruiter", contactEmail: "recruiter@example.com" };
      return response(config, application);
    }
    return response(config, config.url === "/api/applications" ? [application] : application);
  });
  renderPage(`/applications/${application.id}`);
  await user.click(await screen.findByRole("button", { name: "Edit" }));
  const dialog = within(screen.getByRole("dialog"));
  await user.click(dialog.getByRole("combobox", { name: "Application method" }));
  await user.click(screen.getByRole("option", { name: "Company portal" }));
  await user.click(dialog.getByRole("combobox", { name: "Follow-up preference" }));
  await user.click(screen.getByRole("option", { name: "Possible with a direct contact" }));
  await user.type(dialog.getByRole("textbox", { name: "Contact person" }), "Recruiter");
  await user.type(dialog.getByRole("textbox", { name: "Contact email" }), "invalid");
  await user.click(dialog.getByRole("button", { name: "Save changes" }));
  expect(dialog.getByText(/Enter a valid contact email/)).toBeInTheDocument();
  expect(http.mock.calls.some(([config]) => config.method === "put")).toBe(false);
  await user.clear(dialog.getByRole("textbox", { name: "Contact email" }));
  await user.type(dialog.getByRole("textbox", { name: "Contact email" }), "recruiter@example.com");
  await user.click(dialog.getByRole("button", { name: "Save changes" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(screen.getByText("recruiter@example.com")).toBeInTheDocument();
  expect(queryClient.getQueryData(["applications", application.id])).toEqual(application);
});

it("records a recruiter reply with an explicit timestamp and resets the visible next action", async () => {
  const user = userEvent.setup();
  let application = applicationFixture({ events: [eventFixture({ occurredAt: "2020-01-01T00:00:00Z" })] });
  http.mockImplementation(async config => {
    if (config.method === "post") {
      const body = JSON.parse(String(config.data)) as { type: string; occurredAt: string; dueAt: string | null };
      expect(body).toMatchObject({ type: "ContactReceived", dueAt: null });
      expect(Number.isFinite(Date.parse(body.occurredAt))).toBe(true);
      application = { ...application, events: [...application.events,
        eventFixture({ id: "reply", type: "ContactReceived", occurredAt: body.occurredAt }),
      ] };
      return response(config, application, 201);
    }
    return response(config, config.url === "/api/applications" ? [application] : application);
  });
  renderPage(`/applications/${application.id}`);
  await user.click(await screen.findByRole("button", { name: "Record activity" }));
  const dialog = within(screen.getByRole("dialog"));
  await user.click(dialog.getByRole("combobox", { name: "Activity" }));
  await user.click(screen.getByRole("option", { name: "Recruiter reply received" }));
  expect(dialog.getByLabelText(/Activity occurred at/)).toBeInTheDocument();
  await user.click(dialog.getByRole("button", { name: "Save activity" }));
  expect(await screen.findByRole("heading", { name: "Wait for response" })).toBeInTheDocument();
  expect(screen.getByText("Recruiter reply received")).toBeInTheDocument();
  expect(queryClient.getQueryData(["applications"])).toEqual([application]);
});

it("shows hard commitments and suggested attention separately with application links", async () => {
  const application = applicationFixture({ applicationMethod: "CompanyPortal", events: [eventFixture({ occurredAt: "2020-01-01T00:00:00Z" })] });
  const draft = applicationFixture({ id: "draft", companyName: "Draft company", status: "ToApply", deadline: "2030-10-20" });
  http.mockImplementation(async config => response(config, [application, draft]));
  renderPage("/schedule");
  expect(await screen.findByText("Suggested attention")).toBeInTheDocument();
  expect(screen.getByText("Upcoming commitments")).toBeInTheDocument();
  expect(screen.getByText(/Suggested attention from/)).toBeInTheDocument();
  expect(screen.getByText(/Scheduled for/)).toBeInTheDocument();
  expect(screen.queryByText("Follow up")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Example Company - Backend Developer" })).toHaveAttribute("href", `/applications/${application.id}`);
});

function response(config: InternalAxiosRequestConfig, data: unknown, status = 200): AxiosResponse<unknown> {
  return { config, data, status, statusText: String(status), headers: new AxiosHeaders() };
}

function renderPage(path = "/applications") {
  return render(
    <QueryClientProvider client={queryClient}>
      <ApplicationsProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/applications/:id" element={<ApplicationDetailsPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
          </Routes>
        </MemoryRouter>
      </ApplicationsProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  unbindSession = bindApiSession({ getToken: async () => "test-token", onUnauthorized: vi.fn() });
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  http.mockReset();
  http.mockImplementation(async (config) => {
    throw new Error(`Unhandled test HTTP request: ${config.method} ${config.url}`);
  });
  // Replace only the transport: the API module, provider and Query cache remain real.
  apiClient.defaults.adapter = http;
});

afterEach(() => {
  unbindSession();
  queryClient.clear();
  apiClient.defaults.adapter = originalAdapter;
});

it("shows loading until the API responds, then an empty state with Add available", async () => {
  let resolveRequest!: (value: AxiosResponse<unknown>) => void;
  let requestConfig!: InternalAxiosRequestConfig;
  http.mockImplementation(config => {
    requestConfig = config;
    return new Promise(resolve => { resolveRequest = resolve; });
  });
  renderPage();
  expect(screen.getByRole("progressbar", { name: "Loading applications" })).toBeInTheDocument();
  expect(screen.queryByText("No applications yet")).not.toBeInTheDocument();
  await waitFor(() => expect(http).toHaveBeenCalledOnce());
  resolveRequest(response(requestConfig, []));
  expect(await screen.findByText("No applications yet")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Add your first application" })).toBeEnabled();
});

it("shows an API failure without mock fallback and Retry can recover", async () => {
  const user = userEvent.setup();
  http.mockRejectedValueOnce(new AxiosError("Network Error", "ERR_NETWORK"));
  http.mockImplementation(async config => response(config, [applicationFixture()]));
  renderPage();
  expect(await screen.findByRole("alert")).toHaveTextContent("Cannot reach the API");
  expect(screen.queryByText("No applications yet")).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /Open details/ })).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Retry" }));
  expect(await screen.findByRole("heading", { name: "Backend Developer" })).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("renders API records with nullable fields and searches the returned list", async () => {
  const user = userEvent.setup();
  http.mockImplementation(async config => response(config, [applicationFixture()]));
  renderPage();
  expect(await screen.findByRole("link", { name: /Open details/ })).toHaveAttribute("href", "/applications/11111111-1111-1111-1111-111111111111");
  expect(screen.getByText("Location not specified")).toBeInTheDocument();
  await user.type(screen.getByRole("textbox", { name: "Search applications" }), "unmatched");
  expect(screen.getByText("No matching applications")).toBeInTheDocument();
});

it("creates through POST and refreshes the shared list without reloading", async () => {
  const user = userEvent.setup();
  let created = false;
  http.mockImplementation(async config => {
    if (config.method === "post" && config.url === "/api/applications") {
      const body: unknown = JSON.parse(String(config.data));
      expect(body).toMatchObject({ companyName: "Example Company", jobTitle: "Backend Developer", deadline: null });
      created = true;
      return response(config, applicationFixture(), 201);
    }
    if (config.method === "get" && config.url === "/api/applications") {
      return response(config, created ? [applicationFixture()] : []);
    }
    throw new Error("Unexpected HTTP request");
  });
  renderPage();
  await user.click(await screen.findByRole("button", { name: "Add your first application" }));
  const dialog = within(screen.getByRole("dialog"));
  await user.type(dialog.getByRole("textbox", { name: /^Company/ }), "Example Company");
  await user.type(dialog.getByRole("textbox", { name: /^Job title/ }), "Backend Developer");
  await user.click(dialog.getByRole("button", { name: "Add application" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(screen.getByRole("heading", { name: "Backend Developer" })).toBeInTheDocument();
  expect(http.mock.calls.filter(([config]) => config.method === "get")).toHaveLength(2);
});

it("keeps entered values and the dialog open when creation fails", async () => {
  const user = userEvent.setup();
  http.mockImplementation(async config => {
    if (config.method === "post") throw new AxiosError("Network Error", "ERR_NETWORK");
    return response(config, []);
  });
  renderPage();
  await user.click(await screen.findByRole("button", { name: "Add your first application" }));
  const dialog = within(screen.getByRole("dialog"));
  await user.type(dialog.getByRole("textbox", { name: /^Company/ }), "Keep this company");
  await user.type(dialog.getByRole("textbox", { name: /^Job title/ }), "Keep this title");
  await user.click(dialog.getByRole("button", { name: "Add application" }));
  expect(await dialog.findByRole("alert")).toHaveTextContent("Cannot reach the API");
  expect(dialog.getByRole("textbox", { name: /^Company/ })).toHaveValue("Keep this company");
  expect(dialog.getByRole("textbox", { name: /^Job title/ })).toHaveValue("Keep this title");
  expect(dialog.getByRole("button", { name: "Add application" })).toBeEnabled();
});

it("edits an application and updates both list and detail caches", async () => {
  const user = userEvent.setup();
  let application = applicationFixture();
  http.mockImplementation(async config => {
    if (config.method === "put") {
      expect(JSON.parse(String(config.data))).toMatchObject({ companyName: "Updated company" });
      application = { ...application, companyName: "Updated company" };
      return response(config, application);
    }
    return response(config, config.url === "/api/applications" ? [application] : application);
  });
  renderPage(`/applications/${application.id}`);
  await user.click(await screen.findByRole("button", { name: "Edit" }));
  const dialog = within(screen.getByRole("dialog"));
  await user.clear(dialog.getByRole("textbox", { name: /^Company/ }));
  await user.type(dialog.getByRole("textbox", { name: /^Company/ }), "Updated company");
  await user.click(dialog.getByRole("button", { name: "Save changes" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(screen.getByRole("heading", { name: "Backend Developer at Updated company" })).toBeInTheDocument();
  expect(queryClient.getQueryData(["applications"])).toEqual([application]);
  expect(queryClient.getQueryData(["applications", application.id])).toEqual(application);
});

it("keeps edited values after a failed update", async () => {
  const user = userEvent.setup();
  const application = applicationFixture();
  http.mockImplementation(async config => {
    if (config.method === "put") throw new AxiosError("Network Error", "ERR_NETWORK");
    return response(config, config.url === "/api/applications" ? [application] : application);
  });
  renderPage(`/applications/${application.id}`);
  await user.click(await screen.findByRole("button", { name: "Edit" }));
  const dialog = within(screen.getByRole("dialog"));
  await user.clear(dialog.getByRole("textbox", { name: /^Company/ }));
  await user.type(dialog.getByRole("textbox", { name: /^Company/ }), "Unsaved change");
  await user.click(dialog.getByRole("button", { name: "Save changes" }));
  expect(await dialog.findByRole("alert")).toHaveTextContent("Cannot reach the API");
  expect(dialog.getByRole("textbox", { name: /^Company/ })).toHaveValue("Unsaved change");
  expect(queryClient.getQueryData(["applications", application.id])).toEqual(application);
});

it("keeps a failed deletion open, then retries and returns to the empty list", async () => {
  const user = userEvent.setup();
  const application = applicationFixture();
  let attempts = 0;
  let deleted = false;
  http.mockImplementation(async config => {
    if (config.method === "delete") {
      if (++attempts === 1) throw new AxiosError("Network Error", "ERR_NETWORK");
      deleted = true;
      return response(config, undefined, 204);
    }
    if (config.url === "/api/applications") return response(config, deleted ? [] : [application]);
    if (deleted) throw new AxiosError("Not found", "ERR_BAD_REQUEST", config, undefined, response(config, {}, 404));
    return response(config, application);
  });
  renderPage(`/applications/${application.id}`);
  await user.click(await screen.findByRole("button", { name: "Delete" }));
  const dialog = within(screen.getByRole("dialog"));
  await user.click(dialog.getByRole("button", { name: "Delete" }));
  expect(await dialog.findByRole("alert")).toHaveTextContent("Cannot reach the API");
  expect(queryClient.getQueryData(["applications"])).toEqual([application]);
  await user.click(dialog.getByRole("button", { name: "Delete" }));
  expect(await screen.findByText("No applications yet")).toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(queryClient.getQueryData(["applications"])).toEqual([]);
  expect(queryClient.getQueryData(["applications", application.id])).toBeUndefined();
});

it("handles a detail 404 separately from a connection error with a link back", async () => {
  http.mockImplementation(async config => {
    if (config.url === "/api/applications") return response(config, []);
    throw new AxiosError("Not found", "ERR_BAD_REQUEST", config, undefined, response(config, {}, 404));
  });
  renderPage("/applications/missing");
  expect(await screen.findByRole("alert")).toHaveTextContent("Application not found");
  expect(screen.getByRole("link", { name: "Back to applications" })).toHaveAttribute("href", "/applications");
  expect(http.mock.calls.some(([config]) => config.url === "/api/applications/missing")).toBe(true);
});

it("records follow-up, refreshes list/detail caches, and keeps persisted history visible", async () => {
  const user = userEvent.setup();
  let application = applicationFixture();
  http.mockImplementation(async config => {
    if (config.method === "post" && config.url === `/api/applications/${application.id}/events`) {
      expect(JSON.parse(String(config.data))).toMatchObject({ type: "FollowUpSent", note: "Sent a polite follow-up", dueAt: null });
      application = { ...application, events: [...application.events, eventFixture({
        id: "new-followup", type: "FollowUpSent", occurredAt: new Date().toISOString(), note: "Sent a polite follow-up",
      })] };
      return response(config, application, 201);
    }
    if (config.method === "get") return response(config, config.url === "/api/applications" ? [application] : application);
    throw new Error("Unexpected HTTP request");
  });
  renderPage(`/applications/${application.id}`);
  await user.click(await screen.findByRole("button", { name: "Record activity" }));
  const dialog = within(screen.getByRole("dialog"));
  await user.type(dialog.getByRole("textbox", { name: "Activity note" }), "Sent a polite follow-up");
  await user.click(dialog.getByRole("button", { name: "Save activity" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(screen.getByText("Follow-up sent")).toBeInTheDocument();
  expect(screen.getByText("Application sent")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Wait for response" })).toBeInTheDocument();
  expect(queryClient.getQueryData(["applications"])).toEqual([application]);
  expect(queryClient.getQueryData(["applications", application.id])).toEqual(application);
});

it("keeps an activity note available after a failed event save", async () => {
  const user = userEvent.setup();
  const application = applicationFixture();
  http.mockImplementation(async config => {
    if (config.method === "post") throw new AxiosError("Network Error", "ERR_NETWORK");
    return response(config, config.url === "/api/applications" ? [application] : application);
  });
  renderPage(`/applications/${application.id}`);
  await user.click(await screen.findByRole("button", { name: "Record activity" }));
  const dialog = within(screen.getByRole("dialog"));
  await user.type(dialog.getByRole("textbox", { name: "Activity note" }), "Keep this activity");
  await user.click(dialog.getByRole("button", { name: "Save activity" }));
  expect(await dialog.findByText(/Cannot reach the API/)).toBeInTheDocument();
  expect(dialog.getByRole("textbox", { name: "Activity note" })).toHaveValue("Keep this activity");
});

it.each([
  ["Interview scheduled", "InterviewScheduled", "Interviewing", "Interview date and time"],
  ["Assignment received", "AssignmentReceived", "Assignment", "Response / assignment deadline"],
  ["Offer received", "OfferReceived", "Offer", "Response / assignment deadline"],
] as const)("submits an explicit local date for %s as UTC", async (label, type, status, dateLabel) => {
  const user = userEvent.setup();
  let application = applicationFixture();
  const localDate = "2030-09-25T14:30";
  let posted = false;
  http.mockImplementation(async config => {
    if (config.method === "post") {
      expect(JSON.parse(String(config.data))).toMatchObject({ type, dueAt: new Date(localDate).toISOString() });
      posted = true;
      application = { ...application, status, events: [...application.events,
        eventFixture({ id: "scheduled", type, dueAt: new Date(localDate).toISOString() }),
      ] };
      return response(config, application, 201);
    }
    return response(config, config.url === "/api/applications" ? [application] : application);
  });
  renderPage(`/applications/${application.id}`);
  await user.click(await screen.findByRole("button", { name: "Record activity" }));
  const dialog = within(screen.getByRole("dialog"));
  await user.click(dialog.getByRole("combobox", { name: /Activity/ }));
  await user.click(screen.getByRole("option", { name: label }));
  fireEvent.change(dialog.getByLabelText(new RegExp(dateLabel)), { target: { value: localDate } });
  await user.click(dialog.getByRole("button", { name: "Save activity" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(posted).toBe(true);
  expect(queryClient.getQueryData(["applications"])).toEqual([application]);
});
