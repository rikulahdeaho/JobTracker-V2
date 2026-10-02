import type { JobApplication, JobApplicationFormValues, JobApplicationRequest } from "../types/application";

export const emptyApplicationFormValues: JobApplicationFormValues = {
  applicationMethod: "Unknown",
  followUpMode: "Unknown",
  contactPerson: "",
  contactEmail: "",
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
    applicationMethod: application.applicationMethod ?? "Unknown",
    followUpMode: application.followUpMode ?? "Unknown",
    contactPerson: application.contactPerson ?? "",
    contactEmail: application.contactEmail ?? "",
    companyName: application.companyName,
    jobTitle: application.jobTitle,
    jobUrl: application.jobUrl ?? "",
    status: application.status,
    appliedDate: application.appliedDate ?? "",
    deadline: application.deadline ?? "",
    location: application.location ?? "",
    source: application.source ?? "",
    salaryRange: application.salaryRange ?? "",
    notes: application.notes ?? "",
    jobDescription: application.jobDescription ?? "",
  };
}

export function toApplicationRequest(values: JobApplicationFormValues): JobApplicationRequest {
  return {
    applicationMethod: values.applicationMethod,
    followUpMode: values.followUpMode,
    contactPerson: values.contactPerson.trim() || null,
    contactEmail: values.contactEmail.trim() || null,
    companyName: values.companyName.trim(),
    jobTitle: values.jobTitle.trim(),
    status: values.status,
    jobUrl: values.jobUrl.trim() || null,
    location: values.location.trim() || null,
    source: values.source.trim() || null,
    salaryRange: values.salaryRange.trim() || null,
    notes: values.notes.trim() || null,
    jobDescription: values.jobDescription.trim() || null,
    appliedDate: values.appliedDate || null,
    deadline: values.deadline || null,
  };
}
