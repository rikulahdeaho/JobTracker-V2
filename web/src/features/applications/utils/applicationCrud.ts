import type { JobApplication, JobApplicationFormValues } from "../types/application";

export function createApplicationFromValues(values: JobApplicationFormValues): JobApplication {
  const timestamp = new Date().toISOString();

  return {
    id: createApplicationId(values),
    companyName: values.companyName.trim(),
    jobTitle: values.jobTitle.trim(),
    jobUrl: values.jobUrl.trim(),
    status: values.status,
    appliedDate: normalizeDate(values.appliedDate),
    deadline: normalizeDate(values.deadline),
    location: values.location.trim(),
    source: values.source.trim(),
    salaryRange: values.salaryRange.trim(),
    notes: values.notes.trim(),
    jobDescription: values.jobDescription.trim(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function updateApplicationFromValues(
  application: JobApplication,
  values: JobApplicationFormValues,
): JobApplication {
  return {
    ...application,
    companyName: values.companyName.trim(),
    jobTitle: values.jobTitle.trim(),
    jobUrl: values.jobUrl.trim(),
    status: values.status,
    appliedDate: normalizeDate(values.appliedDate),
    deadline: normalizeDate(values.deadline),
    location: values.location.trim(),
    source: values.source.trim(),
    salaryRange: values.salaryRange.trim(),
    notes: values.notes.trim(),
    jobDescription: values.jobDescription.trim(),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeDate(value: string): string | null {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function createApplicationId(values: JobApplicationFormValues): string {
  const slugBase = `${values.companyName}-${values.jobTitle}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${slugBase || "application"}-${suffix}`;
}
