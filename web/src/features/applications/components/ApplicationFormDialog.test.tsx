import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import type { ApplicationStatus, JobApplicationFormValues } from "../types/application";
import { emptyApplicationFormValues, toApplicationFormValues, toApplicationRequest } from "../utils/applicationForm";
import { applicationFixture } from "../../../test/applicationFixture";
import { ApplicationFormDialog } from "./ApplicationFormDialog";

function renderForm(mode: "add" | "edit" = "add", values: Partial<JobApplicationFormValues> = {}) {
  const submit = vi.fn<(values: JobApplicationFormValues) => Promise<void>>().mockResolvedValue();
  render(<ApplicationFormDialog mode={mode} open onClose={vi.fn()} onSubmit={submit}
    initialValues={{ ...emptyApplicationFormValues, companyName: "Example", jobTitle: "Developer", ...values }} />);
  return { user: userEvent.setup(), submit };
}

it.each([
  ["Company", "companyName", "Company name is required."],
  ["Job title", "jobTitle", "Job title is required."],
] as const)("requires a non-blank %s", async (label, field, error) => {
  const { user, submit } = renderForm("add", { [field]: "   " });
  expect(screen.getByRole("textbox", { name: label })).toBeRequired();
  await user.click(screen.getByRole("button", { name: "Add application" }));
  expect(screen.getByText(error)).toBeInTheDocument();
  expect(submit).not.toHaveBeenCalled();
});

it.each([
  ["Application method", "Not specified", "applicationMethod", "Unknown"],
  ["Application method", "Company portal", "applicationMethod", "CompanyPortal"],
  ["Application method", "Email", "applicationMethod", "Email"],
  ["Application method", "Direct recruiter contact", "applicationMethod", "RecruiterDirect"],
  ["Application method", "LinkedIn Easy Apply", "applicationMethod", "LinkedInEasyApply"],
  ["Application method", "Other", "applicationMethod", "Other"],
  ["Follow-up preference", "Default", "followUpMode", "Unknown"],
  ["Follow-up preference", "Follow-up possible", "followUpMode", "Possible"],
  ["Follow-up preference", "No direct follow-up channel", "followUpMode", "NotAvailable"],
  ["Follow-up preference", "Do not suggest follow-up", "followUpMode", "NotNeeded"],
] as const)("maps %s label %s to its API value", async (fieldLabel, option, field, value) => {
  const { user, submit } = renderForm();
  if (field === "followUpMode") await user.click(screen.getByRole("button", { name: "Contact" }));
  await user.click(screen.getByRole("combobox", { name: fieldLabel }));
  await user.click(screen.getByRole("option", { name: option }));
  await user.click(screen.getByRole("button", { name: "Add application" }));
  await waitFor(() => expect(submit).toHaveBeenCalledOnce());
  expect(toApplicationRequest(submit.mock.calls[0][0])[field]).toBe(value);
});

it.each<ApplicationStatus>(["Draft", "ToApply", "Applied", "Interviewing", "Assignment", "Offer", "Rejected", "Ghosted", "Withdrawn"])(
  "shows an empty Applied date only when relevant to %s", status => {
    renderForm("add", { status });
    if (status === "Draft" || status === "ToApply") expect(screen.queryByLabelText("Applied date")).not.toBeInTheDocument();
    else expect(screen.getByLabelText("Applied date")).toHaveValue("");
  },
);

it.each(["add", "edit"] as const)("preserves an entered date when changing status in %s", async mode => {
  const { user, submit } = renderForm(mode, { status: "Applied", appliedDate: "2026-09-18" });
  await user.click(screen.getByRole("combobox", { name: "Status" }));
  await user.click(screen.getByRole("option", { name: "Draft" }));
  expect(screen.getByLabelText("Applied date")).toHaveValue("2026-09-18");
  await user.click(screen.getByRole("button", { name: mode === "add" ? "Add application" : "Save changes" }));
  expect(toApplicationRequest(submit.mock.calls[0][0])).toMatchObject({ status: "Draft", appliedDate: "2026-09-18" });
});

it.each(["Draft", "ToApply"] as const)("Edit hides an empty date for %s and reveals it without inventing a value", async status => {
  const { user, submit } = renderForm("edit", { status });
  expect(screen.queryByLabelText("Applied date")).not.toBeInTheDocument();
  await user.click(screen.getByRole("combobox", { name: "Status" }));
  await user.click(screen.getByRole("option", { name: "Applied" }));
  expect(screen.getByLabelText("Applied date")).toHaveValue("");
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  expect(toApplicationRequest(submit.mock.calls[0][0]).appliedDate).toBeNull();
});

it("Edit populates and preserves all saved values, including a date on a Draft", async () => {
  const original = toApplicationFormValues(applicationFixture({ status: "Draft", jobUrl: "https://example.com/job",
    location: "Helsinki", source: "Referral", salaryRange: "4000–5000", deadline: "2026-10-20",
    applicationMethod: "RecruiterDirect", followUpMode: "NotNeeded", contactPerson: "Recruiter",
    contactEmail: "recruiter@example.com", jobDescription: "Full advert\n\n- Requirements", notes: "My observations" }));
  const { user, submit } = renderForm("edit", original);
  for (const [label, value] of [
    ["Company", original.companyName], ["Job title", original.jobTitle], ["Job URL", original.jobUrl],
    ["Location", original.location], ["Source", original.source], ["Salary range", original.salaryRange],
    ["Applied date", original.appliedDate], ["Application deadline", original.deadline],
    ["Contact person", original.contactPerson], ["Contact email", original.contactEmail],
    ["Job description", original.jobDescription], ["Notes", original.notes],
  ]) expect(screen.getByLabelText(label, { exact: false })).toHaveValue(value);
  expect(screen.getByRole("combobox", { name: "Application method" })).toHaveTextContent("Direct recruiter contact");
  expect(screen.getByRole("combobox", { name: "Follow-up preference" })).toHaveTextContent("Do not suggest follow-up");
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  expect(submit).toHaveBeenCalledWith(original);
});

it("validates contact email but does not require one for Follow-up possible", async () => {
  const { user, submit } = renderForm("add", { followUpMode: "Possible", contactEmail: "invalid" });
  await user.click(screen.getByRole("button", { name: "Add application" }));
  expect(screen.getByText(/Enter a valid contact email address/)).toBeInTheDocument();
  expect(submit).not.toHaveBeenCalled();
  await user.clear(screen.getByRole("textbox", { name: "Contact email" }));
  await user.click(screen.getByRole("button", { name: "Add application" }));
  expect(toApplicationRequest(submit.mock.calls[0][0])).toMatchObject({ followUpMode: "Possible", contactEmail: null });
});

it("cleans only Job description on request and can undo before saving", async () => {
  const original = "Advert  \r\n\r\n\r\n  - Requirement \r\n";
  const { user, submit } = renderForm("edit", { jobDescription: original, notes: "My notes  " });
  await user.click(screen.getByRole("button", { name: "Clean formatting" }));
  expect(screen.getByRole("textbox", { name: "Job description" })).toHaveValue("Advert\n\n  - Requirement");
  expect(screen.getByRole("textbox", { name: "Notes" })).toHaveValue("My notes  ");
  expect(submit).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Undo formatting" }));
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  expect(submit.mock.calls[0][0].jobDescription).toBe(original);
});

it("keeps Job description editable after cleanup without a stale undo overwriting new text", async () => {
  const { user } = renderForm("add", { jobDescription: "Advert  " });
  await user.click(screen.getByRole("button", { name: "Clean formatting" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Job description" }), { target: { value: "Revised advert" } });
  expect(screen.queryByRole("button", { name: "Undo formatting" })).not.toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "Job description" })).toHaveValue("Revised advert");
});

it("Add saves with only Company and Job title while optional sections stay collapsed", async () => {
  const { user, submit } = renderForm();
  expect(screen.getByRole("button", { name: "Contact" })).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByRole("button", { name: "More details" })).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByRole("textbox", { name: "Contact email" })).not.toBeInTheDocument();
  expect(screen.queryByRole("textbox", { name: "Notes" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Add application" }));
  expect(toApplicationRequest(submit.mock.calls[0][0])).toEqual({
    companyName: "Example", jobTitle: "Developer", status: "Draft", applicationMethod: "Unknown",
    followUpMode: "Unknown", contactPerson: null, contactEmail: null, jobUrl: null, location: null,
    source: null, salaryRange: null, notes: null, jobDescription: null, appliedDate: null, deadline: null,
  });
});

it.each(["add", "edit"] as const)("retains optional values after collapsing and reopening sections in %s", async mode => {
  const { user, submit } = renderForm(mode);
  await user.click(screen.getByRole("button", { name: "Contact" }));
  await user.type(screen.getByRole("textbox", { name: "Contact person" }), "Recruiter");
  await user.type(screen.getByRole("textbox", { name: "Contact email" }), "recruiter@example.com");
  await user.click(screen.getByRole("combobox", { name: "Follow-up preference" }));
  await user.click(screen.getByRole("option", { name: "Do not suggest follow-up" }));
  await user.click(screen.getByRole("button", { name: "More details" }));
  await user.type(screen.getByRole("textbox", { name: "Salary range" }), "4000–5000");
  await user.type(screen.getByRole("textbox", { name: "Notes" }), "My observations");
  await user.click(screen.getByRole("button", { name: "Contact" }));
  await user.click(screen.getByRole("button", { name: "More details" }));
  await user.click(screen.getByRole("button", { name: "Contact" }));
  expect(screen.getByRole("textbox", { name: "Contact email" })).toHaveValue("recruiter@example.com");
  await user.click(screen.getByRole("button", { name: "Contact" }));
  await user.click(screen.getByRole("button", { name: mode === "add" ? "Add application" : "Save changes" }));
  expect(toApplicationRequest(submit.mock.calls[0][0])).toMatchObject({
    contactPerson: "Recruiter", contactEmail: "recruiter@example.com", followUpMode: "NotNeeded",
    salaryRange: "4000–5000", notes: "My observations",
  });
});

it.each(["Possible", "NotAvailable", "NotNeeded"] as const)("Edit exposes a stored %s preference even without contact details", mode => {
  renderForm("edit", { followUpMode: mode });
  expect(screen.getByRole("button", { name: "Contact" })).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("combobox", { name: "Follow-up preference" })).toBeInTheDocument();
});

it("Edit preserves saved dates and optional values even when their sections are collapsed before saving", async () => {
  const original = { ...emptyApplicationFormValues, companyName: "Example", jobTitle: "Developer",
    status: "Draft" as const, appliedDate: "2026-09-18", contactPerson: "Recruiter",
    contactEmail: "recruiter@example.com", followUpMode: "Possible" as const,
    salaryRange: "4000–5000", notes: "My observations" };
  const { user, submit } = renderForm("edit", original);
  expect(screen.getByRole("button", { name: "Contact" })).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("button", { name: "More details" })).toHaveAttribute("aria-expanded", "true");
  await user.click(screen.getByRole("button", { name: "Contact" }));
  await user.click(screen.getByRole("button", { name: "More details" }));
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  expect(submit).toHaveBeenCalledWith(original);
});

it("reopens Contact to show validation errors when invalid values were collapsed", async () => {
  const { user, submit } = renderForm("edit", { contactEmail: "invalid" });
  await user.click(screen.getByRole("button", { name: "Contact" }));
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  expect(screen.getByRole("button", { name: "Contact" })).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByText(/Enter a valid contact email address/)).toBeInTheDocument();
  expect(submit).not.toHaveBeenCalled();
});
