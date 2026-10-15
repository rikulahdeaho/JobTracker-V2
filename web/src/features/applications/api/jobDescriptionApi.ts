import { apiClient } from "../../../lib/apiClient";
import type { ParseJobDescriptionResponse } from "../types/jobDescription";

export async function parseJobDescription(text: string): Promise<ParseJobDescriptionResponse> {
  const now = new Date();
  const referenceDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const response = await apiClient.post<ParseJobDescriptionResponse>("/api/job-description/parse", { text, referenceDate });
  return response.data;
}
