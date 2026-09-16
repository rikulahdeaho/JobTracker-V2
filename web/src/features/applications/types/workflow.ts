import type { ApplicationStatus } from "./application";

export type ApplicationEventType = "ApplicationCreated" | "ApplicationSent" | "StatusChanged"
  | "FollowUpSent" | "InterviewScheduled" | "AssignmentReceived" | "AssignmentSubmitted" | "OfferReceived";

export type ApplicationEvent = {
  id: string;
  applicationId: string;
  type: ApplicationEventType;
  occurredAt: string;
  dueAt: string | null;
  note: string | null;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus | null;
  createdAt: string;
};

export type CreateApplicationEventRequest = {
  type: Exclude<ApplicationEventType, "ApplicationCreated" | "StatusChanged">;
  occurredAt: string;
  dueAt: string | null;
  note: string | null;
};

export type TimelineEventType =
  | "applicationCreated"
  | "applicationSent"
  | "statusChanged"
  | "followUpSent"
  | "assignmentSubmitted"
  | "interviewScheduled"
  | "assignmentReceived"
  | "offerReceived"
  | "rejected";

export type TimelineEvent = {
  id: string;
  applicationId: string;
  type: TimelineEventType;
  title: string;
  description: string;
  occurredAt: string;
};

export type ReminderType =
  | "followUp"
  | "prepareInterview"
  | "submitAssignment"
  | "checkDeadline"
  | "respondToOffer";

export type ReminderStatus = "open";

export type Reminder = {
  id: string;
  applicationId: string;
  type: ReminderType;
  status: ReminderStatus;
  title: string;
  description: string;
  companyName: string;
  jobTitle: string;
  dueDate: string;
};
