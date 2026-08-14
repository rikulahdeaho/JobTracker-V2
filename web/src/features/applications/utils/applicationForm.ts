import type { JobApplication, JobApplicationFormValues } from "../types/application";

export const emptyApplicationFormValues: JobApplicationFormValues = {
  companyName: "",
  jobTitle: "",
  jobUrl: "",
  status: "Draft",
  appliedDate: "",
  deadline: "",
  location: "",
  source: "",
  salaryRange: "",
  notes: "",
  jobDescription: "",
};

export function toApplicationFormValues(application: JobApplication): JobApplicationFormValues {
  return {
    companyName: application.companyName,
    jobTitle: application.jobTitle,
    jobUrl: application.jobUrl,
    status: application.status,
    appliedDate: application.appliedDate ?? "",
    deadline: application.deadline ?? "",
    location: application.location,
    source: application.source,
    salaryRange: application.salaryRange,
    notes: application.notes,
    jobDescription: application.jobDescription,
  };
}
