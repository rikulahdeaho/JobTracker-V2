import { apiClient } from "../../../lib/apiClient";
import { getStatusCode } from "../utils/applicationStatus";
import type {
  CreateJobApplicationInput,
  JobApplication,
  UpdateJobApplicationInput,
} from "../types/application";

function toApiPayload(input: CreateJobApplicationInput | UpdateJobApplicationInput) {
  return {
    ...input,
    status: getStatusCode(input.status),
  };
}

export async function getApplications() {
  const response = await apiClient.get<JobApplication[]>("/api/applications");
  return response.data;
}

export async function getApplicationById(id: number) {
  const response = await apiClient.get<JobApplication>(`/api/applications/${id}`);
  return response.data;
}

export async function createApplication(input: CreateJobApplicationInput) {
  const response = await apiClient.post<JobApplication>(
    "/api/applications",
    toApiPayload(input),
  );
  return response.data;
}

export async function deleteApplication(id: number) {
  await apiClient.delete(`/api/applications/${id}`);
}

export async function updateApplication(
  id: number,
  input: UpdateJobApplicationInput,
) {
  await apiClient.put(`/api/applications/${id}`, toApiPayload(input));
}
