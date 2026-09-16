import { expect, it } from "vitest";
import { applicationFixture } from "../../../test/applicationFixture";
import { toApplicationFormValues, toApplicationRequest } from "./applicationForm";

it("converts nullable API fields to editable empty inputs and back to null", () => {
  const form = toApplicationFormValues(applicationFixture());
  expect(form.notes).toBe("");
  expect(form.deadline).toBe("");
  expect(toApplicationRequest(form)).toMatchObject({ notes: null, deadline: null, jobUrl: null });
});

it("preserves date-only values and excludes server-owned fields from writes", () => {
  const form = toApplicationFormValues(applicationFixture({ deadline: "2026-09-30" }));
  const request = toApplicationRequest({ ...form, companyName: " Example " });
  expect(request).toMatchObject({ companyName: "Example", appliedDate: "2026-08-01", deadline: "2026-09-30" });
  expect(request).not.toHaveProperty("id");
  expect(request).not.toHaveProperty("createdAt");
  expect(request).not.toHaveProperty("updatedAt");
});
