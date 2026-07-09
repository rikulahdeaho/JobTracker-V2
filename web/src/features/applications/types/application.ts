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
  id: number;
  userId: string;
  companyName: string;
  jobTitle: string;
  jobUrl?: string | null;
  location?: string | null;
  source?: string | null;
  status: ApplicationStatus | number;
  appliedDate?: string | null;
  deadline?: string | null;
  salaryRange?: string | null;
  notes?: string | null;
  jobDescription?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateJobApplicationInput = {
  companyName: string;
  jobTitle: string;
  jobUrl?: string | null;
  location?: string | null;
  source?: string | null;
  status: ApplicationStatus;
  salaryRange?: string | null;
  notes?: string | null;
  jobDescription?: string | null;
};

export type UpdateJobApplicationInput = CreateJobApplicationInput;
