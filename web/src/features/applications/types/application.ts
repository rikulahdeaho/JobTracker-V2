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
  id: string;
  companyName: string;
  jobTitle: string;
  status: ApplicationStatus;
  appliedDate: string | null;
  deadline: string | null;
  location: string;
  source: string;
  jobUrl: string;
  notes: string;
  jobDescription: string;
  createdAt: string;
  updatedAt: string;
};
