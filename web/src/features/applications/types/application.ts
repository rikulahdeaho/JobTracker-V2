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
  location: string | null;
  source: string | null;
  jobUrl: string | null;
  salaryRange: string | null;
  notes: string | null;
  jobDescription: string | null;
  createdAt: string;
  updatedAt: string;
};

export type JobApplicationRequest = Omit<JobApplication, "id" | "createdAt" | "updatedAt">;

export type JobApplicationFormValues = {
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
