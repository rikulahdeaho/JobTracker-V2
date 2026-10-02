import type { ApplicationEvent } from "./workflow";

export type ApplicationStatus =
  | "Draft"
  | "ToApply"
  | "Applied"
  | "Interviewing"
  | "Assignment"
  | "Offer"
  | "Rejected"
  | "Ghosted"
  | "Withdrawn";

export type JobApplication = {
  applicationMethod: ApplicationMethod;
  followUpMode: FollowUpMode;
  contactPerson: string | null;
  contactEmail: string | null;
  id: string;
  companyName: string;
  jobTitle: string;
  status: ApplicationStatus;
  appliedDate: string | null;
  deadline: string | null;
  location: string | null;
  source: string | null;
  jobUrl: string | null;
  salaryRange: string | null;
  notes: string | null;
  jobDescription: string | null;
  createdAt: string;
  updatedAt: string;
  events: ApplicationEvent[];
};

export type JobApplicationRequest = Omit<JobApplication, "id" | "createdAt" | "updatedAt" | "events">;

export type JobApplicationFormValues = {
  applicationMethod: ApplicationMethod;
  followUpMode: FollowUpMode;
  contactPerson: string;
  contactEmail: string;
  companyName: string;
  jobTitle: string;
  jobUrl: string;
  status: ApplicationStatus;
  appliedDate: string;
  deadline: string;
  location: string;
  source: string;
  salaryRange: string;
  notes: string;
  jobDescription: string;
};

export type ApplicationMethod = "Unknown" | "CompanyPortal" | "Email" | "RecruiterDirect" | "LinkedInEasyApply" | "Other";
export type FollowUpMode = "Unknown" | "Possible" | "NotAvailable" | "NotNeeded";
