import type { CreateApplicationEventRequest } from "../types/workflow";
import { apiClient } from "../../../lib/apiClient";
import type { JobApplication, JobApplicationRequest } from "../types/application";

export async function getApplications(signal?: AbortSignal): Promise<JobApplication[]> {
  const response = await apiClient.get<JobApplication[]>("/api/applications", { signal });
  return response.data;
}

export async function getApplicationById(id: string, signal?: AbortSignal): Promise<JobApplication> {
  const response = await apiClient.get<JobApplication>(`/api/applications/${encodeURIComponent(id)}`, { signal });
  return response.data;
}

export async function createApplication(data: JobApplicationRequest): Promise<JobApplication> {
  const response = await apiClient.post<JobApplication>("/api/applications", data);
  return response.data;
}

export async function updateApplication(id: string, data: JobApplicationRequest): Promise<JobApplication> {
  const response = await apiClient.put<JobApplication>(`/api/applications/${encodeURIComponent(id)}`, data);
  return response.data;
}

export async function deleteApplication(id: string): Promise<void> {
  await apiClient.delete(`/api/applications/${encodeURIComponent(id)}`);
}

export async function createApplicationEvent(id: string, data: CreateApplicationEventRequest): Promise<JobApplication> {
  const response = await apiClient.post<JobApplication>(`/api/applications/${encodeURIComponent(id)}/events`, data);
  return response.data;
}
