import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { StrictMode, useEffect, type PropsWithChildren } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ThemeModeProvider } from "../../app/ThemeModeContext";
import { Sidebar } from "../../components/layout/Sidebar";
import { apiClient } from "../../lib/apiClient";
import { applicationFixture } from "../../test/applicationFixture";
import { useApplications } from "../applications/context/ApplicationsContext";
import { getAllReminders } from "../applications/utils/applicationWorkflow";
import { emptyApplicationFormValues } from "../applications/utils/applicationForm";
import { AuthenticationBoundary } from "./AuthenticationBoundary";

const clerk = vi.hoisted(() => ({
  isLoaded: true, isSignedIn: true, userId: "user-a" as string | null, sessionId: "session-a" as string | null,
  getToken: vi.fn<() => Promise<string | null>>(), signOut: vi.fn<() => Promise<void>>(),
}));
vi.mock("@clerk/react", () => ({
  useAuth: () => clerk,
  useClerk: () => ({ signOut: clerk.signOut }),
  useUser: () => ({ user: { fullName: "User A", primaryEmailAddress: { emailAddress: "a@example.test" } } }),
  SignInButton: ({ children }: PropsWithChildren) => children,
}));
const originalAdapter = apiClient.defaults.adapter;
const http = vi.fn<AxiosAdapter>();
const clients = new Set<QueryClient>();

function response(config: InternalAxiosRequestConfig, data: unknown, status = 200): AxiosResponse<unknown> {
  return { config, data, status, statusText: String(status), headers: new AxiosHeaders() };
}
function Workspace() {
  const client = useQueryClient();
  useEffect(() => { clients.add(client); }, [client]);
  const { applications, addApplication } = useApplications();
  return <>
    <h1>Workspace</h1>
    <button onClick={() => { void addApplication({ ...emptyApplicationFormValues, companyName: "Late A", jobTitle: "Developer" }); }}>Create</button>
    {applications.map(item => <p key={item.id}>{item.companyName}</p>)}
    {getAllReminders(applications).map(item => <p key={item.id}>Reminder for {item.companyName}</p>)}
  </>;
}
function Tree() {
  return <StrictMode><ThemeModeProvider><AuthenticationBoundary><Workspace /></AuthenticationBoundary></ThemeModeProvider></StrictMode>;
}
beforeEach(() => {
  const storage = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value); },
    removeItem: (key: string) => { storage.delete(key); },
    clear: () => storage.clear(),
  });
  clients.clear();
  Object.assign(clerk, { isLoaded: true, isSignedIn: true, userId: "user-a", sessionId: "session-a" });
  clerk.getToken.mockReset().mockImplementation(async () => `token-${clerk.userId}`);
  clerk.signOut.mockReset().mockResolvedValue();
  http.mockReset().mockImplementation(async config => response(config, [applicationFixture({ companyName: "Private A", deadline: "2030-09-30" })]));
  apiClient.defaults.adapter = http;
});
afterEach(() => { apiClient.defaults.adapter = originalAdapter; vi.unstubAllGlobals(); });

it("does not render the workspace or call the API while loading or signed out", () => {
  clerk.isLoaded = false;
  const view = render(<Tree />);
  expect(screen.getByRole("progressbar", { name: "Loading authentication" })).toBeInTheDocument();
  clerk.isLoaded = true;
  clerk.isSignedIn = false;
  view.rerender(<Tree />);
  expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Workspace" })).not.toBeInTheDocument();
  expect(http).not.toHaveBeenCalled();
});

it("renders authenticated data and gets the current token centrally for every request", async () => {
  render(<Tree />);
  expect(await screen.findByText("Private A")).toBeInTheDocument();
  expect(http.mock.calls[0][0].headers.get("Authorization")).toBe("Bearer token-user-a");
  clerk.getToken.mockResolvedValue("refreshed-token");
  await apiClient.get("/api/applications");
  expect(http.mock.lastCall?.[0].headers.get("Authorization")).toBe("Bearer refreshed-token");
});

it("clears the old cache and derived reminders on sign-out and gives a returning user a fresh cache", async () => {
  const view = render(<Tree />);
  await screen.findAllByText("Reminder for Private A");
  const oldClient = [...clients][0];
  clerk.isSignedIn = false;
  view.rerender(<Tree />);
  expect(screen.queryByText("Private A")).not.toBeInTheDocument();
  expect(screen.queryByText("Reminder for Private A")).not.toBeInTheDocument();
  expect(oldClient.getQueryCache().getAll()).toHaveLength(0);
  expect(oldClient.getMutationCache().getAll()).toHaveLength(0);
  http.mockImplementation(async config => response(config, []));
  clerk.isSignedIn = true;
  view.rerender(<Tree />);
  await waitFor(() => expect(clients.size).toBe(2));
  expect(screen.queryByText("Private A")).not.toBeInTheDocument();
});

it("switches users without displaying cached data even before the next response", async () => {
  const view = render(<Tree />);
  await screen.findByText("Private A");
  const oldClient = [...clients][0];
  http.mockImplementation(async config => response(config, [applicationFixture({ companyName: "Private B" })]));
  Object.assign(clerk, { userId: "user-b", sessionId: "session-b" });
  view.rerender(<Tree />);
  expect(screen.queryByText("Private A")).not.toBeInTheDocument();
  expect(oldClient.getQueryCache().getAll()).toHaveLength(0);
  expect(await screen.findByText("Private B")).toBeInTheDocument();
  expect(http.mock.lastCall?.[0].headers.get("Authorization")).toBe("Bearer token-user-b");
});

it("aborts the previous user's pending read and ignores its late response", async () => {
  let finish!: () => void;
  let oldConfig!: InternalAxiosRequestConfig;
  http.mockImplementationOnce(config => {
    oldConfig = config;
    return new Promise(resolve => { finish = () => resolve(response(config, [applicationFixture({ companyName: "Late A" })])); });
  });
  const view = render(<Tree />);
  await waitFor(() => expect(finish).toBeDefined());
  Object.assign(clerk, { userId: "user-b", sessionId: "session-b" });
  http.mockImplementation(async config => response(config, []));
  view.rerender(<Tree />);
  expect(oldConfig.signal?.aborted).toBe(true);
  await act(async () => finish());
  expect(screen.queryByText("Late A")).not.toBeInTheDocument();
});

it("blocks sending a token that finishes loading after the user changes", async () => {
  let finish!: (token: string) => void;
  clerk.getToken.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const view = render(<Tree />);
  await waitFor(() => expect(finish).toBeDefined());
  clerk.isSignedIn = false;
  view.rerender(<Tree />);
  await act(async () => finish("old-token"));
  expect(http).not.toHaveBeenCalled();
});

it("keeps a late mutation from populating the next user's cache", async () => {
  let finish!: () => void;
  http.mockImplementation(async config => {
    if (config.method === "post") return new Promise(resolve => {
      finish = () => resolve(response(config, applicationFixture({ companyName: "Late A" }), 201));
    });
    return response(config, []);
  });
  const view = render(<Tree />);
  await userEvent.click(await screen.findByRole("button", { name: "Create" }));
  await waitFor(() => expect(finish).toBeDefined());
  Object.assign(clerk, { userId: "user-b", sessionId: "session-b" });
  view.rerender(<Tree />);
  await waitFor(() => expect(clients.size).toBe(2));
  await act(async () => finish());
  expect(screen.queryByText("Late A")).not.toBeInTheDocument();
  await waitFor(() => expect([...clients][1].getQueryData(["applications"])).toEqual([]));
});

it("does not let an old request's 401 expire the new session", async () => {
  const view = render(<Tree />);
  await screen.findByText("Private A");
  let rejectOld!: () => void;
  http.mockImplementationOnce(config => new Promise((_, reject) => {
    rejectOld = () => reject(new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, undefined, response(config, {}, 401)));
  }));
  const oldRequest = apiClient.get("/api/applications").catch(() => undefined);
  await waitFor(() => expect(rejectOld).toBeDefined());
  Object.assign(clerk, { userId: "user-b", sessionId: "session-b" });
  http.mockImplementation(async config => response(config, []));
  view.rerender(<Tree />);
  await act(async () => { rejectOld(); await oldRequest; });
  expect(screen.getByRole("heading", { name: "Workspace" })).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it.each(["null token", "401"])("hides protected data on %s and offers sign out", async failure => {
  if (failure === "null token") clerk.getToken.mockResolvedValue(null);
  else http.mockImplementation(async config => { throw new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, undefined, response(config, {}, 401)); });
  render(<Tree />);
  expect(await screen.findByRole("alert")).toHaveTextContent("session could not be verified");
  expect(screen.queryByRole("heading", { name: "Workspace" })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Sign out" }));
  expect(clerk.signOut).toHaveBeenCalledOnce();
});

it("keeps the sidebar account and theme controls working", async () => {
  render(<ThemeModeProvider><MemoryRouter><Sidebar drawerWidth={260} isDesktop mobileOpen={false} onClose={() => {}} /></MemoryRouter></ThemeModeProvider>);
  expect(screen.getAllByText("User A")[0]).toBeInTheDocument();
  expect(screen.getAllByText("a@example.test")[0]).toBeInTheDocument();
  const toggle = screen.getByRole("button", { name: /Use .* mode/ });
  const previousLabel = toggle.textContent;
  await userEvent.click(toggle);
  expect(toggle.textContent).not.toBe(previousLabel);
  await userEvent.click(screen.getByRole("button", { name: "Sign out" }));
  expect(clerk.signOut).toHaveBeenCalledOnce();
});
