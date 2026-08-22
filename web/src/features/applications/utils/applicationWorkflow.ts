import type { ChipProps } from "@mui/material";
import type { JobApplication } from "../types/application";
import type { Reminder, ReminderType, TimelineEvent, TimelineEventType } from "../types/workflow";
import { getApplicationNextAction } from "./applicationNextAction";

type ReminderGroupKey = "overdue" | "today" | "upcoming";

export type ReminderGroup = {
  key: ReminderGroupKey;
  title: string;
  description: string;
  reminders: Reminder[];
};

type ReminderPresentation = {
  label: string;
  color: ChipProps["color"];
};

export function getApplicationTimelineEvents(application: JobApplication): TimelineEvent[] {
  const events: TimelineEvent[] = [
    createTimelineEvent(application, "applicationCreated", application.createdAt, "Application created", "Added to your tracker and ready for the next step."),
  ];

  if (application.appliedDate) {
    events.push(
      createTimelineEvent(
        application,
        "applicationSent",
        toIsoDate(application.appliedDate),
        "Application sent",
        `Application submitted to ${application.companyName}.`,
      ),
    );
  }

  for (const statusEvent of getStatusTimelineEvents(application)) {
    events.push(statusEvent);
  }

  const nextAction = getApplicationNextAction(application);

  if (nextAction.isNeedsFollowUp) {
    events.push(
      createTimelineEvent(
        application,
        "followUpPlanned",
        application.updatedAt,
        "Follow-up planned",
        nextAction.description,
      ),
    );
  }

  return events.sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
}

export function getApplicationReminders(application: JobApplication): Reminder[] {
  const reminders: Reminder[] = [];
  const nextAction = getApplicationNextAction(application);

  if (nextAction.isNeedsFollowUp) {
    reminders.push(
      createReminder(
        application,
        "followUp",
        toDateOnly(addDays(application.updatedAt, 14)),
        "Follow up",
        nextAction.description,
      ),
    );
  }

  switch (application.status) {
    case "Interviewing":
      reminders.push(
        createReminder(
          application,
          "prepareInterview",
          application.deadline ?? toDateOnly(addDays(application.updatedAt, 2)),
          "Prepare interview",
          "Review the company, role, and examples before the next interview step.",
        ),
      );
      break;
    case "Assignment":
      reminders.push(
        createReminder(
          application,
          "submitAssignment",
          application.deadline ?? toDateOnly(addDays(application.updatedAt, 3)),
          "Submit assignment",
          "Wrap up the take-home work, check details, and submit on time.",
        ),
      );
      break;
    case "Offer":
      reminders.push(
        createReminder(
          application,
          "respondToOffer",
          application.deadline ?? toDateOnly(addDays(application.updatedAt, 2)),
          "Respond to offer",
          "Review the package and send your decision or negotiation response.",
        ),
      );
      break;
  }

  if (application.deadline) {
    reminders.push(
      createReminder(
        application,
        "checkDeadline",
        application.deadline,
        "Check deadline",
        `Keep the ${application.companyName} deadline in view and plan your next step before it passes.`,
      ),
    );
  }

  return dedupeReminders(reminders).sort((left, right) => left.dueDate.localeCompare(right.dueDate));
}

export function getAllReminders(applications: JobApplication[]): Reminder[] {
  return applications.flatMap((application) => getApplicationReminders(application));
}

export function getGroupedReminders(
  applications: JobApplication[],
  referenceDate = new Date(),
): ReminderGroup[] {
  const reminders = getAllReminders(applications);
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

function getStatusTimelineEvents(application: JobApplication): TimelineEvent[] {
  switch (application.status) {
    case "Interviewing":
      return [
        createTimelineEvent(
          application,
          "interviewScheduled",
          application.updatedAt,
          "Interview scheduled",
          "The process moved into an interview stage and now needs preparation.",
        ),
      ];
    case "Assignment":
      return [
        createTimelineEvent(
          application,
          "assignmentReceived",
          application.updatedAt,
          "Assignment received",
          "The team shared an assignment or take-home step for this application.",
        ),
      ];
    case "Offer":
      return [
        createTimelineEvent(
          application,
          "offerReceived",
          application.updatedAt,
          "Offer received",
          "The process reached the offer stage and now needs a response.",
        ),
      ];
    case "Rejected":
      return [
        createTimelineEvent(
          application,
          "rejected",
          application.updatedAt,
          "Rejected",
          "This application is marked as closed.",
        ),
      ];
    case "Ghosted":
    case "Withdrawn":
      return [
        createTimelineEvent(
          application,
          "statusChanged",
          application.updatedAt,
          `Status changed to ${application.status}`,
          `This application is currently marked as ${application.status.toLowerCase()}.`,
        ),
      ];
    case "Draft":
    case "ToApply":
    case "Applied":
      return application.updatedAt !== application.createdAt
        ? [
            createTimelineEvent(
              application,
              "statusChanged",
              application.updatedAt,
              `Status updated to ${application.status === "ToApply" ? "To Apply" : application.status}`,
              `The application is currently in the ${application.status === "ToApply" ? "To Apply" : application.status} stage.`,
            ),
          ]
        : [];
  }
}

function createTimelineEvent(
  application: JobApplication,
  type: TimelineEventType,
  occurredAt: string,
  title: string,
  description: string,
): TimelineEvent {
  return {
    id: `${application.id}-${type}-${occurredAt}`,
    applicationId: application.id,
    type,
    title,
    description,
    occurredAt,
  };
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

function dedupeReminders(reminders: Reminder[]): Reminder[] {
  const seenReminderIds = new Set<string>();

  return reminders.filter((reminder) => {
    if (seenReminderIds.has(reminder.id)) {
      return false;
    }

    seenReminderIds.add(reminder.id);
    return true;
  });
}

function addDays(value: string, days: number): string {
  const nextDate = new Date(value);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString();
}

function toDateOnly(value: string): string {
  return value.slice(0, 10);
}

function toIsoDate(value: string): string {
  return `${value}T09:00:00Z`;
}
