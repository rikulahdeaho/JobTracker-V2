import type { ChipProps } from "@mui/material";
import type { JobApplication } from "../types/application";
import { getLastContact, getStageEvent } from "./applicationActivity";

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

const FOLLOW_UP_THRESHOLD_DAYS = 14;
const GHOSTED_THRESHOLD_DAYS = 30;

export function getApplicationNextAction(
  application: JobApplication,
  referenceDate = new Date(),
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
      const contact = getLastContact(application, referenceDate);
      if (!contact) return {
        title: "Add application sent date", description: "Record when you sent the application to start follow-up timing.",
        kind: "followUp", color: "info", isNeedsFollowUp: false, isGhostedRisk: false,
      };
      const lastActivityDate = new Date(contact.occurredAt);
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
    case "Interviewing": {
      const interview = getStageEvent(application, ["InterviewScheduled"]);
      return {
        title: interview?.dueAt ? "Prepare interview" : "Add interview details",
        description: interview?.dueAt
          ? `Interview: ${new Date(interview.dueAt).toLocaleString()}.`
          : "Record the actual interview date and time.",
        kind: "interview", color: "secondary", isNeedsFollowUp: false, isGhostedRisk: false,
      };
    }
    case "Assignment": {
      const assignment = getStageEvent(application, ["AssignmentReceived", "AssignmentSubmitted"]);
      const submitted = assignment?.type === "AssignmentSubmitted";
      return {
        title: submitted ? "Wait for assignment feedback" : assignment?.dueAt ? "Submit assignment" : "Add assignment deadline",
        description: submitted ? "The assignment was submitted. Wait for feedback."
          : assignment?.dueAt ? `Assignment due ${new Date(assignment.dueAt).toLocaleString()}.` : "Record the actual assignment deadline.",
        kind: "assignment", color: "warning", isNeedsFollowUp: false, isGhostedRisk: false,
      };
    }
    case "Offer": {
      const offer = getStageEvent(application, ["OfferReceived"]);
      return {
        title: offer?.dueAt ? "Respond to offer" : "Review offer",
        description: offer?.dueAt ? `Respond by ${new Date(offer.dueAt).toLocaleString()}.` : "Review the offer and record a response deadline if one is agreed.",
        kind: "offer", color: "success", isNeedsFollowUp: false, isGhostedRisk: false,
      };
    }
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
