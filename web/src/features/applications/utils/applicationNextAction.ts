import type { ChipProps } from "@mui/material";
import type { JobApplication } from "../types/application";

type NextActionKind =
  | "draft"
  | "toApply"
  | "followUp"
  | "ghostedRisk"
  | "interview"
  | "assignment"
  | "offer"
  | "none";

export type ApplicationNextAction = {
  title: string;
  description: string;
  kind: NextActionKind;
  color: ChipProps["color"];
  isNeedsFollowUp: boolean;
  isGhostedRisk: boolean;
};

const TODAY_ISO = "2026-08-14T00:00:00Z";
const FOLLOW_UP_THRESHOLD_DAYS = 14;
const GHOSTED_THRESHOLD_DAYS = 30;

export function getApplicationNextAction(
  application: JobApplication,
  referenceDate = new Date(TODAY_ISO),
): ApplicationNextAction {
  switch (application.status) {
    case "Draft":
      return {
        title: "Finish application",
        description: "Complete the draft and prepare it for submission.",
        kind: "draft",
        color: "warning",
        isNeedsFollowUp: false,
        isGhostedRisk: false,
      };
    case "ToApply":
      return {
        title: "Apply",
        description: application.deadline
          ? `Submit before ${formatDisplayDate(application.deadline)}.`
          : "Submit the application when your materials are ready.",
        kind: "toApply",
        color: "info",
        isNeedsFollowUp: false,
        isGhostedRisk: false,
      };
    case "Applied": {
      const lastActivityDate = getLastActivityDate(application);
      const daysSinceActivity = getDaysBetween(lastActivityDate, referenceDate);

      if (daysSinceActivity >= GHOSTED_THRESHOLD_DAYS) {
        return {
          title: "Consider ghosted",
          description: `No activity since ${formatDisplayDate(lastActivityDate.toISOString())}. Consider one final follow-up or marking this as ghosted.`,
          kind: "ghostedRisk",
          color: "warning",
          isNeedsFollowUp: true,
          isGhostedRisk: true,
        };
      }

      if (daysSinceActivity >= FOLLOW_UP_THRESHOLD_DAYS) {
        return {
          title: "Follow up",
          description: `No activity since ${formatDisplayDate(lastActivityDate.toISOString())}. Send a polite follow-up.`,
          kind: "followUp",
          color: "secondary",
          isNeedsFollowUp: true,
          isGhostedRisk: false,
        };
      }

      return {
        title: "Wait for response",
        description: `Recent activity was ${formatDisplayDate(lastActivityDate.toISOString())}. Monitor for a reply before following up.`,
        kind: "followUp",
        color: "primary",
        isNeedsFollowUp: false,
        isGhostedRisk: false,
      };
    }
    case "Interviewing":
      return {
        title: "Prepare interview",
        description: "Review the company, role, and your strongest examples before the next conversation.",
        kind: "interview",
        color: "secondary",
        isNeedsFollowUp: false,
        isGhostedRisk: false,
      };
    case "Assignment":
      return {
        title: "Submit assignment",
        description: application.deadline
          ? `Assignment work is due by ${formatDisplayDate(application.deadline)}.`
          : "Finish and submit the assignment.",
        kind: "assignment",
        color: "warning",
        isNeedsFollowUp: false,
        isGhostedRisk: false,
      };
    case "Offer":
      return {
        title: "Respond to offer",
        description: application.deadline
          ? `Offer decision needed by ${formatDisplayDate(application.deadline)}.`
          : "Review the offer and prepare your response.",
        kind: "offer",
        color: "success",
        isNeedsFollowUp: false,
        isGhostedRisk: false,
      };
    case "Rejected":
      return {
        title: "No action",
        description: "This process is closed.",
        kind: "none",
        color: "default",
        isNeedsFollowUp: false,
        isGhostedRisk: false,
      };
    case "Ghosted":
      return {
        title: "No action",
        description: "This application is already marked as ghosted.",
        kind: "none",
        color: "default",
        isNeedsFollowUp: false,
        isGhostedRisk: false,
      };
    case "Withdrawn":
      return {
        title: "No action",
        description: "You have already withdrawn from this process.",
        kind: "none",
        color: "default",
        isNeedsFollowUp: false,
        isGhostedRisk: false,
      };
  }
}

export function getApplicationsNeedingFollowUp(applications: JobApplication[]): JobApplication[] {
  return applications.filter((application) => getApplicationNextAction(application).isNeedsFollowUp);
}

export function getGhostedRiskApplications(applications: JobApplication[]): JobApplication[] {
  return applications.filter((application) => getApplicationNextAction(application).isGhostedRisk);
}

function getLastActivityDate(application: JobApplication): Date {
  const referenceValue = application.updatedAt || application.appliedDate || application.createdAt;
  return new Date(referenceValue);
}

function getDaysBetween(olderDate: Date, newerDate: Date): number {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((newerDate.getTime() - olderDate.getTime()) / millisecondsPerDay);
}

function formatDisplayDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
