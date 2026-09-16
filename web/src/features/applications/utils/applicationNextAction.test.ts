import { describe, expect, it } from "vitest";
import { applicationFixture } from "../../../test/applicationFixture";
import type { ApplicationStatus } from "../types/application";
import { getApplicationNextAction } from "./applicationNextAction";

describe("Next Action", () => {
  it.each<[ApplicationStatus, string]>([
    ["Draft", "Finish application"], ["ToApply", "Apply"],
    ["Interviewing", "Prepare interview"], ["Assignment", "Submit assignment"],
    ["Offer", "Respond to offer"], ["Rejected", "No action"],
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
    const reference = new Date(Date.parse(application.updatedAt) + days * 86400000);
    expect(getApplicationNextAction(application, reference)).toMatchObject({
      title, isNeedsFollowUp: followUp, isGhostedRisk: ghosted,
    });
  });

  it("uses recent activity instead of an old applied date and does not change status", () => {
    const application = applicationFixture({ updatedAt: "2026-09-15T12:00:00Z" });
    expect(getApplicationNextAction(application, new Date("2026-09-16T12:00:00Z")).isNeedsFollowUp).toBe(false);
    expect(application.status).toBe("Applied");
  });
});
