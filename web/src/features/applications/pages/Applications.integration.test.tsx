import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { apiClient } from "../../../lib/apiClient";
import { applicationFixture } from "../../../test/applicationFixture";
import { ApplicationsProvider } from "../context/ApplicationsProvider";
import { ApplicationsPage } from "./ApplicationsPage";
import { ApplicationDetailsPage } from "./ApplicationDetailsPage";

const originalAdapter = apiClient.defaults.adapter;
let queryClient: QueryClient;
const http = vi.fn<AxiosAdapter>();

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
          </Routes>
        </MemoryRouter>
      </ApplicationsProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  http.mockReset();
  http.mockImplementation(async (config) => {
    throw new Error(`Unhandled test HTTP request: ${config.method} ${config.url}`);
  });
  // Replace only the transport: the API module, provider and Query cache remain real.
  apiClient.defaults.adapter = http;
});

afterEach(() => {
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
