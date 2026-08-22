import { mockApplications } from "../data/mockApplications";
import type { JobApplication } from "../types/application";

const APPLICATIONS_STORAGE_KEY = "jobtracker.applications";

export function loadStoredApplications(): JobApplication[] {
  if (typeof window === "undefined") {
    return mockApplications;
  }

  const storedValue = window.localStorage.getItem(APPLICATIONS_STORAGE_KEY);

  if (!storedValue) {
    return mockApplications;
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (isJobApplicationArray(parsedValue)) {
      return parsedValue;
    }
  } catch {
    return mockApplications;
  }

  return mockApplications;
}

export function saveApplications(applications: JobApplication[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(applications));
}

export function resetStoredApplications(): JobApplication[] {
  const seededApplications = [...mockApplications];

  if (typeof window !== "undefined") {
    window.localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(seededApplications));
  }

  return seededApplications;
}

function isJobApplicationArray(value: unknown): value is JobApplication[] {
  return Array.isArray(value) && value.every(isJobApplication);
}

function isJobApplication(value: unknown): value is JobApplication {
  if (!value || typeof value !== "object") {
    return false;
  }

  const application = value as Record<string, unknown>;

  return (
    typeof application.id === "string" &&
    typeof application.companyName === "string" &&
    typeof application.jobTitle === "string" &&
    typeof application.status === "string" &&
    (typeof application.appliedDate === "string" || application.appliedDate === null) &&
    (typeof application.deadline === "string" || application.deadline === null) &&
    typeof application.location === "string" &&
    typeof application.source === "string" &&
    typeof application.jobUrl === "string" &&
    typeof application.salaryRange === "string" &&
    typeof application.notes === "string" &&
    typeof application.jobDescription === "string" &&
    typeof application.createdAt === "string" &&
    typeof application.updatedAt === "string"
  );
}
