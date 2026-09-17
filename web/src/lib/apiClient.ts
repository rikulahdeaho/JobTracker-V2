import axios, { CanceledError } from "axios";

type ApiSession = { getToken: () => Promise<string | null>; onUnauthorized: () => void };
let session: ApiSession | undefined;

// Keep only Clerk's token getter in memory, never a stored access token.
export function bindApiSession(binding: ApiSession): () => void {
  session = binding;
  return () => { if (session === binding) session = undefined; };
}

const baseURL = import.meta.env.VITE_API_BASE_URL?.trim();

export const apiClient = axios.create({
  baseURL: baseURL?.replace(/\/+$/, ""),
  timeout: 15000,
  headers: { Accept: "application/json" },
});

apiClient.interceptors.request.use(async (config) => {
  if (!baseURL) {
    throw new Error("Set VITE_API_BASE_URL in web/.env.local and restart the frontend.");
  }
  const requestSession = session;
  if (!requestSession) throw new Error("Sign in to access your applications.");
  let token: string | null;
  try {
    token = await requestSession.getToken();
  } catch {
    throw new Error("Unable to verify your session. Check your connection and try again.");
  }
  if (session !== requestSession) throw new CanceledError("Session changed.");
  if (!token) {
    requestSession.onUnauthorized();
    throw new Error("Your session has expired. Please sign in again.");
  }
  config.headers.set("Authorization", `Bearer ${token}`);
  requestSessions.set(config, requestSession);
  return config;
});

const requestSessions = new WeakMap<object, ApiSession>();
apiClient.interceptors.response.use(response => response, (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401 && error.config) {
    const requestSession = requestSessions.get(error.config);
    if (requestSession && session === requestSession) requestSession.onUnauthorized();
  }
  return Promise.reject(error);
});

export function isNotFoundError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<unknown>(error)) {
    if (error.response?.status === 401) return "Your session has expired. Please sign in again.";
    if (error.response?.status === 403) return "You do not have permission to perform this action.";
    if (!error.response) {
      return "Cannot reach the API. Check that it is running and try again.";
    }
    const data = error.response.data;
    if (data && typeof data === "object" && "errors" in data &&
        data.errors && typeof data.errors === "object") {
      const messages = Object.values(data.errors)
        .flatMap((value: unknown) => Array.isArray(value) ? value : [])
        .filter((value: unknown): value is string => typeof value === "string");
      if (messages.length > 0) return messages.join(" ");
    }
    if (error.response.status === 404) return "This application no longer exists.";
    return "The request failed. Please try again.";
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
