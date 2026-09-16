import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL?.trim();

export const apiClient = axios.create({
  baseURL: baseURL?.replace(/\/+$/, ""),
  timeout: 15000,
  headers: { Accept: "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (!baseURL) {
    throw new Error("Set VITE_API_BASE_URL in web/.env.local and restart the frontend.");
  }
  return config;
});

export function isNotFoundError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<unknown>(error)) {
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
