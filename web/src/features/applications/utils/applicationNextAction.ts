import type { ChipProps } from "@mui/material";
import type { JobApplication } from "../types/application";
import { getLastContact, getStageEvent } from "./applicationActivity";
import { canFollowUp } from "./applicationContact";

type NextActionKind =
  | "draft"
  | "toApply"
  | "followUp"
  | "statusReview"
  | "interview"
  | "assignment"
  | "offer"
  | "none";

export type ApplicationNextAction = {
  title: string;
  description: string;
  kind: NextActionKind;
  color: ChipProps["color"];
  needsAttention: boolean;
  needsStatusReview: boolean;
};

const FOLLOW_UP_THRESHOLD_DAYS = 14;
const REVIEW_THRESHOLD_DAYS = 30;

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
        needsAttention: true,
        needsStatusReview: false,
      };
    case "ToApply":
      return {
        title: "Apply",
        description: application.deadline
          ? `Submit before ${formatDisplayDate(application.deadline)}.`
          : "Submit the application when your materials are ready.",
        kind: "toApply",
        color: "info",
        needsAttention: true,
        needsStatusReview: false,
      };
    case "Applied": {
      const contact = getLastContact(application, referenceDate);
      if (!contact) return {
        title: "Add application activity/details", description: "Record when you sent the application or received a reply to start response timing.",
        kind: "followUp", color: "info", needsAttention: true, needsStatusReview: false,
      };
      const lastActivityDate = new Date(contact.occurredAt);
      const daysSinceActivity = getDaysBetween(lastActivityDate, referenceDate);

      if (daysSinceActivity >= REVIEW_THRESHOLD_DAYS) {
        return {
          title: "Review status",
          description: `No response activity since ${formatDisplayDate(lastActivityDate.toISOString())}. Keep the process active or manually mark it as ghosted.`,
          kind: "statusReview",
          color: "warning",
          needsAttention: true,
          needsStatusReview: true,
        };
      }

      if (daysSinceActivity >= FOLLOW_UP_THRESHOLD_DAYS && canFollowUp(application)) {
        return {
          title: "Follow up",
          description: `No activity since ${formatDisplayDate(lastActivityDate.toISOString())}. Send a polite follow-up.`,
          kind: "followUp",
          color: "secondary",
          needsAttention: true,
          needsStatusReview: false,
        };
      }

      return {
        title: "Wait for response",
        description: `Recent activity was ${formatDisplayDate(lastActivityDate.toISOString())}. Monitor for a reply before following up.`,
        kind: "followUp",
        color: "primary",
        needsAttention: false,
        needsStatusReview: false,
      };
    }
    case "Interviewing": {
      const interview = getStageEvent(application, ["InterviewScheduled"]);
      const past = !!interview?.dueAt && Date.parse(interview.dueAt) <= referenceDate.getTime();
      const reply = getLastContact(application, referenceDate);
      const resolved = past && reply?.type === "ContactReceived"
        && Date.parse(reply.occurredAt) >= Date.parse(interview!.dueAt!);
      return {
        title: resolved ? "Review recruiter reply" : past ? "Wait for interview feedback"
          : interview?.dueAt ? "Prepare interview" : "Add interview details",
        description: resolved ? "Review the reply and record the next agreed step."
          : past ? "The interview has passed. Wait for feedback or record the reply."
          : interview?.dueAt ? `Interview: ${new Date(interview.dueAt).toLocaleString()}.`
          : "Record the actual interview date and time.",
        kind: "interview", color: "secondary", needsAttention: !past || !!resolved, needsStatusReview: false,
      };
    }
    case "Assignment": {
      const assignment = getStageEvent(application, ["AssignmentReceived", "AssignmentSubmitted"]);
      const submitted = assignment?.type === "AssignmentSubmitted";
      return {
        title: submitted ? "Wait for assignment feedback" : assignment?.dueAt ? "Submit assignment" : "Add assignment deadline",
        description: submitted ? "The assignment was submitted. Wait for feedback."
          : assignment?.dueAt ? `Assignment due ${new Date(assignment.dueAt).toLocaleString()}.` : "Record the actual assignment deadline.",
        kind: "assignment", color: "warning", needsAttention: !submitted, needsStatusReview: false,
      };
    }
    case "Offer": {
      const offer = getStageEvent(application, ["OfferReceived"]);
      return {
        title: offer?.dueAt ? "Respond to offer" : "Review offer",
        description: offer?.dueAt ? `Respond by ${new Date(offer.dueAt).toLocaleString()}.` : "Review the offer and record a response deadline if one is agreed.",
        kind: "offer", color: "success", needsAttention: true, needsStatusReview: false,
      };
    }
    case "Rejected":
      return {
        title: "No action",
        description: "This process is closed.",
        kind: "none",
        color: "default",
        needsAttention: false,
        needsStatusReview: false,
      };
    case "Ghosted":
      return {
        title: "No action",
        description: "This application is already marked as ghosted.",
        kind: "none",
        color: "default",
        needsAttention: false,
        needsStatusReview: false,
      };
    case "Withdrawn":
      return {
        title: "No action",
        description: "You have already withdrawn from this process.",
        kind: "none",
        color: "default",
        needsAttention: false,
        needsStatusReview: false,
      };
  }
}

export function getApplicationsNeedingAttention(applications: JobApplication[]): JobApplication[] {
  return applications.filter((application) => getApplicationNextAction(application).needsAttention);
}

export function getStatusReviewApplications(applications: JobApplication[]): JobApplication[] {
  return applications.filter((application) => getApplicationNextAction(application).needsStatusReview);
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
