import { describe, expect, it } from "vitest";
import { applicationFixture, eventFixture } from "../../../test/applicationFixture";
import type { ApplicationStatus } from "../types/application";
import { getApplicationNextAction } from "./applicationNextAction";

describe("Next Action", () => {
  it.each<[ApplicationStatus, string]>([
    ["Draft", "Finish application"], ["ToApply", "Apply"],
    ["Interviewing", "Add interview details"], ["Assignment", "Add assignment deadline"],
    ["Offer", "Review offer"], ["Rejected", "No action"],
    ["Ghosted", "No action"], ["Withdrawn", "No action"],
  ])("suggests the appropriate action for %s", (status, title) => {
    expect(getApplicationNextAction(applicationFixture({ status }))).toMatchObject({
      title, isNeedsFollowUp: false, isGhostedRisk: false,
    });
  });

  it.each([
    [13, "Wait for response", false, false],
    [14, "Follow up", true, false],
    [29, "Follow up", true, false],
    [30, "Consider ghosted", true, true],
  ])("handles %i full days without activity", (days, title, followUp, ghosted) => {
    const application = applicationFixture();
    const reference = new Date(Date.parse(application.events[0].occurredAt) + days * 86400000);
    expect(getApplicationNextAction(application, reference)).toMatchObject({
      title, isNeedsFollowUp: followUp, isGhostedRisk: ghosted,
    });
  });

  it("ignores technical edits and preserves status", () => {
    const original = applicationFixture();
    const edited = { ...original, notes: "Changed", salaryRange: "5000", updatedAt: "2026-10-10T12:00:00Z" };
    const now = new Date("2026-10-02T12:00:00Z");
    expect(getApplicationNextAction(edited, now)).toEqual(getApplicationNextAction(original, now));
    expect(getApplicationNextAction(edited, now).isGhostedRisk).toBe(true);
    expect(edited.status).toBe("Applied");
  });

  it("uses the latest contact in unsorted history, not status changes", () => {
    const application = applicationFixture({ events: [
      eventFixture({ type: "FollowUpSent", occurredAt: "2026-09-15T12:00:00Z" }),
      eventFixture(),
      eventFixture({ type: "StatusChanged", occurredAt: "2026-09-16T12:00:00Z" }),
    ] });
    expect(getApplicationNextAction(application, new Date("2026-09-16T12:00:00Z")).title).toBe("Wait for response");
    expect(getApplicationNextAction(application, new Date("2026-09-29T12:00:00Z")).title).toBe("Follow up");
    expect(getApplicationNextAction(application, new Date("2026-10-15T12:00:00Z")).title).toBe("Consider ghosted");
  });

  it("does not invent contact from metadata or missing history", () => {
    const application = applicationFixture({ events: [] });
    expect(getApplicationNextAction(application).title).toBe("Add application sent date");
    expect(getApplicationNextAction(application).isGhostedRisk).toBe(false);
  });

  it.each([
    ["Interviewing", "InterviewScheduled", "Prepare interview"],
    ["Assignment", "AssignmentReceived", "Submit assignment"],
    ["Offer", "OfferReceived", "Respond to offer"],
  ] as const)("uses explicit dates for %s", (status, type, title) => {
    const application = applicationFixture({ status, deadline: "2026-09-01", events: [
      eventFixture({ type, dueAt: "2026-09-25T12:00:00Z" }),
    ] });
    expect(getApplicationNextAction(application).title).toBe(title);
  });

  it("stops asking for submission after assignment submitted", () => {
    const application = applicationFixture({ status: "Assignment", events: [
      eventFixture({ type: "AssignmentReceived", dueAt: "2026-09-25T12:00:00Z" }),
      eventFixture({ type: "AssignmentSubmitted", occurredAt: "2026-09-20T12:00:00Z" }),
    ] });
    expect(getApplicationNextAction(application).title).toBe("Wait for assignment feedback");
  });
});
