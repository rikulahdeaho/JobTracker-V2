import { expect, it } from "vitest";
import { applicationFixture, eventFixture } from "../../../test/applicationFixture";
import { getApplicationReminders, getApplicationTimelineEvents, getGroupedReminders } from "./applicationWorkflow";
import { getApplicationNextAction } from "./applicationNextAction";

it("renders only persisted history in occurrence order, independent of current status and edits", () => {
  const application = applicationFixture({ status: "Rejected", events: [
    eventFixture({ id: "sent", type: "ApplicationSent" }),
    eventFixture({ id: "followup", type: "FollowUpSent", occurredAt: "2026-09-15T12:00:00Z" }),
  ] });
  const timeline = getApplicationTimelineEvents(application);
  expect(timeline.map(item => item.id)).toEqual(["followup", "sent"]);
  expect(getApplicationTimelineEvents({ ...application, notes: "Edit", updatedAt: "2026-10-01T12:00:00Z" })).toEqual(timeline);
  expect(getApplicationTimelineEvents({ ...application, events: [] })).toEqual([]);
});

it.each(["Interviewing", "Assignment", "Offer"] as const)("does not guess dates for %s", status => {
  const application = applicationFixture({ status, events: [] });
  expect(getApplicationReminders(application)).toEqual([]);
  expect(getApplicationReminders({ ...application, updatedAt: "2026-09-15T12:00:00Z" })).toEqual([]);
});

it("keeps the application deadline separate from a real assignment deadline", () => {
  const application = applicationFixture({ status: "Assignment", deadline: "2026-09-18", events: [
    eventFixture({ type: "AssignmentReceived", dueAt: "2026-09-25T12:00:00Z" }),
  ] });
  expect(getApplicationReminders(application)).toEqual(expect.arrayContaining([
    expect.objectContaining({ type: "checkDeadline", dueDate: "2026-09-18" }),
    expect.objectContaining({ type: "submitAssignment", dueDate: "2026-09-25" }),
  ]));
  expect(getApplicationReminders({ ...application, events: [...application.events,
    eventFixture({ type: "AssignmentSubmitted", occurredAt: "2026-09-20T12:00:00Z" }),
  ] }).some(item => item.type === "submitAssignment")).toBe(false);
});

it("schedules follow-up from contact and moves it only after another contact", () => {
  const original = applicationFixture();
  const now = new Date("2026-09-16T12:00:00Z");
  expect(getApplicationReminders(original, now)[0].dueDate).toBe("2026-09-15");
  expect(getApplicationReminders({ ...original, updatedAt: now.toISOString() }, now)).toEqual(getApplicationReminders(original, now));
  expect(getApplicationReminders({ ...original, events: [...original.events,
    eventFixture({ type: "FollowUpSent", occurredAt: "2026-09-16T10:00:00Z" }),
  ] }, now)[0].dueDate).toBe("2026-09-30");
});

it("does not reuse an old interview when re-entering Interviewing", () => {
  const application = applicationFixture({ status: "Interviewing", events: [
    eventFixture({ type: "InterviewScheduled", dueAt: "2026-09-10T12:00:00Z" }),
    eventFixture({ type: "StatusChanged", toStatus: "Interviewing", createdAt: "2026-09-15T12:00:00Z" }),
  ] });
  expect(getApplicationReminders(application)).toEqual([]);
  expect(getApplicationNextAction(application).title).toBe("Add interview details");
});

it("closed applications have no automatically derived reminders", () => {
  expect(getApplicationReminders(applicationFixture({ status: "Rejected", deadline: "2026-09-20" }))).toEqual([]);
});

it("groups an explicit timestamp on its local calendar day", () => {
  const interviewAt = new Date(2026, 8, 25, 0, 30).toISOString();
  const application = applicationFixture({ status: "Interviewing", events: [
    eventFixture({ type: "InterviewScheduled", dueAt: interviewAt }),
  ] });
  const groups = getGroupedReminders([application], new Date(2026, 8, 25, 12));
  expect(groups.find(group => group.key === "today")?.reminders).toHaveLength(1);
  expect(groups.find(group => group.key === "overdue")?.reminders).toHaveLength(0);
});
