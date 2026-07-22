import type { JobApplication } from "../types/application";
import { getStatusValue } from "./applicationStatus";

type NextActionResult = {
  label: string;
  needsFollowUp: boolean;
};

function daysBetween(from: Date, to: Date) {
  const diffMs = to.getTime() - from.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function parseDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getNextAction(application: JobApplication): NextActionResult {
  const status = getStatusValue(application.status);
  const now = new Date();
  const updatedAt = parseDate(application.updatedAt);
  const appliedDate = parseDate(application.appliedDate);
  const referenceDate = updatedAt ?? appliedDate;

  switch (status) {
    case "Draft":
      return { label: "Finish application", needsFollowUp: false };
    case "ToApply":
      return { label: "Apply", needsFollowUp: false };
    case "Applied": {
      if (referenceDate && daysBetween(referenceDate, now) >= 14) {
        return { label: "Follow up", needsFollowUp: true };
      }

      return { label: "Wait for response", needsFollowUp: false };
    }
    case "Interviewing":
      return { label: "Prepare interview", needsFollowUp: false };
    case "Assignment":
      return { label: "Submit assignment", needsFollowUp: false };
    case "Offer":
      return { label: "Respond to offer", needsFollowUp: false };
    case "Rejected":
      return { label: "No action", needsFollowUp: false };
    case "Ghosted":
      return { label: "No action", needsFollowUp: false };
    case "Withdrawn":
      return { label: "No action", needsFollowUp: false };
    default:
      return { label: "Review application", needsFollowUp: false };
  }
}
