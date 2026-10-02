import { expect, it } from "vitest";
import { applicationFixture, eventFixture } from "../../../test/applicationFixture";
import type { ApplicationMethod, FollowUpMode } from "../types/application";
import { getApplicationNextAction } from "./applicationNextAction";
import { getApplicationReminders, getGroupedReminders } from "./applicationWorkflow";

const anchor = Date.parse("2026-09-01T12:00:00Z");
const atDay = (day: number) => new Date(anchor + day * 86400000);

it.each<ApplicationMethod>(["CompanyPortal", "LinkedInEasyApply", "Email", "RecruiterDirect", "Other", "Unknown"])(
  "%s alone never implies contactability", applicationMethod => {
    const application = applicationFixture({ applicationMethod, contactPerson: "Recruiter", followUpMode: "Possible" });
    expect(getApplicationNextAction(application, atDay(14))).toMatchObject({ title: "Wait for response", needsAttention: false });
    expect(getApplicationReminders(application, atDay(14))).toEqual([
      expect.objectContaining({ type: "reviewStatus", category: "suggestedAttention", dueDate: "2026-10-01" }),
    ]);
    expect(getApplicationNextAction(application, atDay(30))).toMatchObject({ title: "Review status", needsAttention: true });
    expect(application.status).toBe("Applied");
  },
);

it.each<[FollowUpMode, string]>([
  ["Unknown", "Follow up"], ["Possible", "Follow up"],
  ["NotAvailable", "Wait for response"], ["NotNeeded", "Wait for response"],
])("respects %s with a valid direct contact", (followUpMode, title) => {
  const application = applicationFixture({ applicationMethod: "CompanyPortal", contactEmail: "recruiter@example.com", followUpMode });
  expect(getApplicationNextAction(application, new Date(atDay(14).getTime() - 1)).title).toBe("Wait for response");
  expect(getApplicationNextAction(application, atDay(14)).title).toBe(title);
  expect(getApplicationNextAction(application, new Date(atDay(30).getTime() - 1)).title).toBe(title);
  expect(getApplicationNextAction(application, atDay(30)).title).toBe("Review status");
  expect(getApplicationReminders(application, atDay(30))).toEqual([
    expect.objectContaining({ type: "reviewStatus", category: "suggestedAttention" }),
  ]);
});

it.each([null, "invalid", "a@b", "a b@example.com"])("keeps legacy or invalid contact %s conservative", contactEmail => {
  const application = applicationFixture({ contactEmail });
  expect(getApplicationNextAction(application, atDay(14)).needsAttention).toBe(false);
  expect(getApplicationReminders(application, atDay(14)).some(item => item.type === "followUp")).toBe(false);
});

it.each(["FollowUpSent", "ContactReceived"] as const)("%s resets both clocks without duplicating suggestions", type => {
  const application = applicationFixture({ contactEmail: "recruiter@example.com", events: [eventFixture(),
    eventFixture({ id: "reply", type, occurredAt: atDay(29).toISOString() }),
  ] });
  expect(getApplicationNextAction(application, atDay(30)).title).toBe("Wait for response");
  expect(getApplicationReminders(application, atDay(30))).toEqual([
    expect.objectContaining({ type: "followUp", dueDate: "2026-10-14" }),
  ]);
  expect(getApplicationNextAction(application, atDay(59)).title).toBe("Review status");
});

it("does not schedule attention without an activity timestamp", () => {
  const application = applicationFixture({ events: [] });
  expect(getApplicationNextAction(application, atDay(30))).toMatchObject({ title: "Add application activity/details", needsAttention: true });
  expect(getApplicationReminders(application, atDay(30))).toEqual([]);
});

it("distinguishes future, past, resolved and missing interviews", () => {
  const application = applicationFixture({ status: "Interviewing", events: [
    eventFixture({ type: "InterviewScheduled", dueAt: atDay(10).toISOString() }),
  ] });
  expect(getApplicationNextAction(application, atDay(9)).title).toBe("Prepare interview");
  expect(getApplicationReminders(application, atDay(9))[0].category).toBe("hardDate");
  expect(getApplicationNextAction(application, atDay(10))).toMatchObject({ title: "Wait for interview feedback", needsAttention: false });
  expect(getApplicationReminders(application, atDay(10))).toEqual([]);
  expect(getApplicationNextAction({ ...application, events: [...application.events,
    eventFixture({ type: "ContactReceived", occurredAt: atDay(11).toISOString() }),
  ] }, atDay(12)).title).toBe("Review recruiter reply");
  expect(getApplicationNextAction({ ...application, events: [] }, atDay(12)).title).toBe("Add interview details");
});

it("uses the latest interview and replaces old assignment dates", () => {
  const events = [eventFixture({ type: "InterviewScheduled", dueAt: atDay(10).toISOString() }),
    eventFixture({ type: "InterviewScheduled", occurredAt: atDay(11).toISOString(), dueAt: atDay(20).toISOString() })];
  const application = applicationFixture({ status: "Interviewing", events });
  expect(getApplicationNextAction(application, atDay(12)).title).toBe("Prepare interview");
  expect(getApplicationReminders(application, atDay(12))).toEqual([expect.objectContaining({ dueDate: "2026-09-21" })]);
  const assignment = applicationFixture({ status: "Assignment", events: [
    eventFixture({ type: "AssignmentReceived", dueAt: atDay(10).toISOString() }),
    eventFixture({ type: "AssignmentSubmitted", occurredAt: atDay(9).toISOString() }),
    eventFixture({ type: "AssignmentReceived", occurredAt: atDay(11).toISOString(), dueAt: atDay(20).toISOString() }),
  ] });
  expect(getApplicationReminders(assignment, atDay(12))).toEqual([expect.objectContaining({ type: "submitAssignment", dueDate: "2026-09-21" })]);
});

it("separates hard dates and suggested attention and retires submitted application deadlines", () => {
  const draft = applicationFixture({ status: "ToApply", deadline: "2026-09-15" });
  const applied = applicationFixture({ contactEmail: "a@example.com", deadline: "2026-09-15" });
  expect(getApplicationReminders(draft, atDay(14))).toEqual([expect.objectContaining({ category: "hardDate", type: "checkDeadline" })]);
  expect(getApplicationReminders(applied, atDay(14))).toEqual([expect.objectContaining({ category: "suggestedAttention", type: "followUp" })]);
  expect(getGroupedReminders([draft, applied], atDay(14), "hardDate").flatMap(group => group.reminders)).toHaveLength(1);
  const offer = applicationFixture({ status: "Offer", events: [eventFixture({ type: "OfferReceived", dueAt: atDay(20).toISOString() })] });
  expect(getApplicationReminders(offer, atDay(14))).toEqual([expect.objectContaining({ category: "hardDate", type: "respondToOffer" })]);
});

it.each(["Rejected", "Ghosted", "Withdrawn"] as const)("%s has no attention or hard commitments", status => {
  const application = applicationFixture({ status, deadline: "2026-10-30", contactEmail: "a@example.com" });
  expect(getApplicationNextAction(application, atDay(30))).toMatchObject({ title: "No action", needsAttention: false });
  expect(getApplicationReminders(application, atDay(30))).toEqual([]);
});
