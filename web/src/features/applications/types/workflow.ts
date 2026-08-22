export type TimelineEventType =
  | "applicationCreated"
  | "applicationSent"
  | "statusChanged"
  | "followUpPlanned"
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
