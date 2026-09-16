import type { ChipProps } from "@mui/material";
import type { JobApplication } from "../types/application";
import type { ApplicationEventType, Reminder, ReminderType, TimelineEvent } from "../types/workflow";
import { getLastContact, getStageEvent } from "./applicationActivity";

type ReminderGroupKey = "overdue" | "today" | "upcoming";
export type ReminderGroup = { key: ReminderGroupKey; title: string; description: string; reminders: Reminder[] };
type ReminderPresentation = { label: string; color: ChipProps["color"] };

const eventPresentation: Record<ApplicationEventType, { type: TimelineEvent["type"]; title: string }> = {
  ApplicationCreated: { type: "applicationCreated", title: "Application created" },
  ApplicationSent: { type: "applicationSent", title: "Application sent" },
  StatusChanged: { type: "statusChanged", title: "Status changed" },
  FollowUpSent: { type: "followUpSent", title: "Follow-up sent" },
  InterviewScheduled: { type: "interviewScheduled", title: "Interview scheduled" },
  AssignmentReceived: { type: "assignmentReceived", title: "Assignment received" },
  AssignmentSubmitted: { type: "assignmentSubmitted", title: "Assignment submitted" },
  OfferReceived: { type: "offerReceived", title: "Offer received" },
};

export function getApplicationTimelineEvents(application: JobApplication): TimelineEvent[] {
  return [...application.events]
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt)
      || Date.parse(b.createdAt) - Date.parse(a.createdAt) || a.id.localeCompare(b.id))
    .map(event => ({
      id: event.id, applicationId: application.id, occurredAt: event.occurredAt,
      ...eventPresentation[event.type],
      description: [
        event.type === "StatusChanged" ? `${event.fromStatus} -> ${event.toStatus}` : null,
        event.dueAt ? `Scheduled / due: ${new Date(event.dueAt).toLocaleString()}` : null,
        event.note,
      ].filter(Boolean).join(" | "),
    }));
}

export function getApplicationReminders(application: JobApplication, referenceDate = new Date()): Reminder[] {
  if (["Rejected", "Ghosted", "Withdrawn"].includes(application.status)) return [];
  const reminders: Reminder[] = [];
  if (application.status === "Applied") {
    const contact = getLastContact(application, referenceDate);
    if (contact) reminders.push(createReminder(application, "followUp",
      toDateOnly(new Date(Date.parse(contact.occurredAt) + 14 * 86400000).toISOString()),
      "Follow up", "Follow up 14 days after the last application or follow-up sent."));
  }
  const stage = application.status === "Interviewing" ? getStageEvent(application, ["InterviewScheduled"])
    : application.status === "Assignment" ? getStageEvent(application, ["AssignmentReceived", "AssignmentSubmitted"])
    : application.status === "Offer" ? getStageEvent(application, ["OfferReceived"]) : undefined;
  if (stage?.dueAt && stage.type !== "AssignmentSubmitted") {
    const type = application.status === "Interviewing" ? "prepareInterview"
      : application.status === "Assignment" ? "submitAssignment" : "respondToOffer";
    reminders.push(createReminder(application, type, toDateOnly(stage.dueAt),
      getReminderPresentation(type).label, `Scheduled / due: ${new Date(stage.dueAt).toLocaleString()}`));
  }
  if (application.deadline) reminders.push(createReminder(application, "checkDeadline", application.deadline,
    "Application deadline", "The application deadline recorded on this application."));
  return reminders.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function getAllReminders(applications: JobApplication[], referenceDate = new Date()): Reminder[] {
  return applications.flatMap((application) => getApplicationReminders(application, referenceDate))
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate));
}

export function getGroupedReminders(
  applications: JobApplication[],
  referenceDate = new Date(),
): ReminderGroup[] {
  const reminders = getAllReminders(applications, referenceDate);
  const todayValue = toDateOnly(referenceDate.toISOString());

  return [
    {
      key: "overdue",
      title: "Overdue",
      description: "These reminders are already past due and need attention first.",
      reminders: reminders.filter((reminder) => reminder.dueDate < todayValue),
    },
    {
      key: "today",
      title: "Today",
      description: "These reminders should be handled today.",
      reminders: reminders.filter((reminder) => reminder.dueDate === todayValue),
    },
    {
      key: "upcoming",
      title: "Upcoming",
      description: "These reminders are coming up next in the current pipeline.",
      reminders: reminders.filter((reminder) => reminder.dueDate > todayValue),
    },
  ];
}

export function getUpcomingReminders(applications: JobApplication[], limit = 3): Reminder[] {
  return getGroupedReminders(applications)
    .flatMap((group) => group.reminders)
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
    .slice(0, limit);
}

export function getReminderPresentation(type: ReminderType): ReminderPresentation {
  switch (type) {
    case "followUp":
      return { label: "Follow up", color: "secondary" };
    case "prepareInterview":
      return { label: "Prepare interview", color: "primary" };
    case "submitAssignment":
      return { label: "Submit assignment", color: "warning" };
    case "checkDeadline":
      return { label: "Check deadline", color: "info" };
    case "respondToOffer":
      return { label: "Respond to offer", color: "success" };
  }
}

function createReminder(
  application: JobApplication,
  type: ReminderType,
  dueDate: string,
  title: string,
  description: string,
): Reminder {
  return {
    id: `${application.id}-${type}-${dueDate}`,
    applicationId: application.id,
    type,
    status: "open",
    title,
    description,
    companyName: application.companyName,
    jobTitle: application.jobTitle,
    dueDate,
  };
}

function toDateOnly(value: string): string {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
