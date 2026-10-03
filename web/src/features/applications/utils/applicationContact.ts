import type { ApplicationMethod, FollowUpMode, JobApplication } from "../types/application";

export const applicationMethodLabels: Record<ApplicationMethod, string> = {
  Unknown: "Not specified", CompanyPortal: "Company portal", Email: "Email",
  RecruiterDirect: "Direct recruiter contact", LinkedInEasyApply: "LinkedIn Easy Apply", Other: "Other",
};

export const followUpModeLabels: Record<FollowUpMode, string> = {
  Unknown: "Default", Possible: "Follow-up possible",
  NotAvailable: "No direct follow-up channel", NotNeeded: "Do not suggest follow-up",
};

export function isValidContactEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function canFollowUp(application: JobApplication): boolean {
  return application.followUpMode !== "NotAvailable" && application.followUpMode !== "NotNeeded"
    && isValidContactEmail(application.contactEmail ?? "");
}
