import type { ApplicationMethod, FollowUpMode, JobApplication } from "../types/application";

export const applicationMethodLabels: Record<ApplicationMethod, string> = {
  Unknown: "Unknown", CompanyPortal: "Company portal", Email: "Email",
  RecruiterDirect: "Recruiter direct", LinkedInEasyApply: "LinkedIn Easy Apply", Other: "Other",
};

export const followUpModeLabels: Record<FollowUpMode, string> = {
  Unknown: "Unknown", Possible: "Possible with a direct contact",
  NotAvailable: "Not available", NotNeeded: "Not needed",
};

export function isValidContactEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function canFollowUp(application: JobApplication): boolean {
  return application.followUpMode !== "NotAvailable" && application.followUpMode !== "NotNeeded"
    && isValidContactEmail(application.contactEmail ?? "");
}
