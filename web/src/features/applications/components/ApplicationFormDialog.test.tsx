import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import type { ApplicationStatus, JobApplicationFormValues } from "../types/application";
import { emptyApplicationFormValues, toApplicationFormValues, toApplicationRequest } from "../utils/applicationForm";
import { applicationFixture } from "../../../test/applicationFixture";
import { ApplicationFormDialog } from "./ApplicationFormDialog";
import { parseJobDescription } from "../api/jobDescriptionApi";

vi.mock("../api/jobDescriptionApi", () => ({ parseJobDescription: vi.fn() }));

function renderForm(mode: "add" | "edit" = "add", values: Partial<JobApplicationFormValues> = {}) {
  const submit = vi.fn<(values: JobApplicationFormValues) => Promise<void>>().mockResolvedValue();
  const close = vi.fn();
  render(<ApplicationFormDialog mode={mode} open onClose={close} onSubmit={submit}
    initialValues={{ ...emptyApplicationFormValues, companyName: "Example", jobTitle: "Developer", ...values }} />);
  return { user: userEvent.setup(), submit, close };
}

const parsed = {
  suggestions: [
    { field: "companyName" as const, value: "Parsed Oy", evidence: "Company: Parsed Oy", confidence: "high" as const },
    { field: "jobTitle" as const, value: "Engineer", evidence: "Job title: Engineer", confidence: "high" as const },
    { field: "location" as const, value: "Espoo", evidence: "Location: Espoo", confidence: "high" as const },
    { field: "deadline" as const, value: "2026-11-05", evidence: "Apply by 2026-11-05", confidence: "high" as const },
  ],
  detected: [{ category: "technology" as const, value: "React", evidence: "React wanted" }],
};

const additionalSuggestions = [
  { field: "contactEmail" as const, value: "mikko@example.com", evidence: "Contact Mikko Kivipelto: mikko@example.com", confidence: "high" as const },
  { field: "contactPerson" as const, value: "Mikko Kivipelto", evidence: "Contact Mikko Kivipelto: mikko@example.com", confidence: "medium" as const },
  { field: "source" as const, value: "Duunitori", evidence: "Source: Duunitori", confidence: "high" as const },
  { field: "salaryRange" as const, value: "4000–5500 €/kk", evidence: "Salary: 4000–5500 €/kk", confidence: "high" as const },
];

it.each(["add", "edit"] as const)("applies new description fields selectively in %s", async mode => {
  vi.mocked(parseJobDescription).mockResolvedValue({ suggestions: additionalSuggestions, detected: [] });
  const { user, submit } = renderForm(mode, { jobDescription: "Original description", source: "Referral", notes: "My notes" });
  await user.click(screen.getByRole("button", { name: "Analyze description" }));
  const review = await screen.findByRole("dialog", { name: "Review description suggestions" });
  expect(within(review).getByRole("checkbox", { name: "Source: Duunitori" })).not.toBeChecked();
  for (const label of ["Contact email: mikko@example.com", "Contact person: Mikko Kivipelto", "Salary range: 4000–5500 €/kk"])
    expect(within(review).getByRole("checkbox", { name: label })).toBeChecked();
  await user.click(within(review).getByRole("checkbox", { name: "Contact person: Mikko Kivipelto" }));
  await user.click(within(review).getByRole("button", { name: "Apply selected" }));
  if (!screen.queryByRole("textbox", { name: "Contact email" })) await user.click(screen.getByRole("button", { name: "Contact" }));
  if (!screen.queryByRole("textbox", { name: "Salary range" })) await user.click(screen.getByRole("button", { name: "More details" }));
  expect(screen.getByRole("textbox", { name: "Contact email" })).toHaveValue("mikko@example.com");
  expect(screen.getByRole("textbox", { name: "Contact person" })).toHaveValue("");
  expect(screen.getByRole("textbox", { name: "Source" })).toHaveValue("Referral");
  expect(screen.getByRole("textbox", { name: "Salary range" })).toHaveValue("4000–5500 €/kk");
  expect(screen.getByRole("textbox", { name: "Notes" })).toHaveValue("My notes");
  expect(screen.getByRole("textbox", { name: "Job description" })).toHaveValue("Original description");
  expect(submit).not.toHaveBeenCalled();
});

it("protects existing contact and salary values until replacement is selected", async () => {
  vi.mocked(parseJobDescription).mockResolvedValue({ suggestions: additionalSuggestions, detected: [] });
  const { user, submit } = renderForm("edit", { jobDescription: "Original description", contactPerson: "Old Person", contactEmail: "old@example.com", source: "Referral", salaryRange: "3000 €/kk" });
  await user.click(screen.getByRole("button", { name: "Analyze description" }));
  let review = await screen.findByRole("dialog", { name: "Review description suggestions" });
  for (const checkbox of within(review).getAllByRole("checkbox")) expect(checkbox).not.toBeChecked();
  await user.click(within(review).getByRole("button", { name: "Cancel" }));
  expect(screen.getByRole("textbox", { name: "Contact person" })).toHaveValue("Old Person");
  expect(screen.getByRole("textbox", { name: "Contact email" })).toHaveValue("old@example.com");
  await user.click(screen.getByRole("button", { name: "Analyze description" }));
  review = await screen.findByRole("dialog", { name: "Review description suggestions" });
  await user.click(within(review).getByRole("checkbox", { name: "Contact person: Mikko Kivipelto" }));
  await user.click(within(review).getByRole("checkbox", { name: "Source: Duunitori" }));
  await user.click(within(review).getByRole("button", { name: "Apply selected" }));
  expect(screen.getByRole("textbox", { name: "Contact person" })).toHaveValue("Mikko Kivipelto");
  expect(screen.getByRole("textbox", { name: "Contact email" })).toHaveValue("old@example.com");
  expect(screen.getByRole("textbox", { name: "Source" })).toHaveValue("Duunitori");
  expect(screen.getByRole("textbox", { name: "Salary range" })).toHaveValue("3000 €/kk");
  expect(submit).not.toHaveBeenCalled();
});

it.each(["add", "edit"] as const)("reviews and applies selected suggestions in %s without saving", async mode => {
  vi.mocked(parseJobDescription).mockResolvedValue(parsed);
  const description = "Company: Parsed Oy\nJob title: Engineer\nApply by 2026-11-05\nReact wanted";
  const { user, submit } = renderForm(mode, { jobDescription: description, notes: "Keep notes" });
  await user.click(screen.getByRole("button", { name: "Analyze description" }));
  expect(await screen.findByRole("dialog", { name: "Review description suggestions" })).toBeInTheDocument();
  expect(parseJobDescription).toHaveBeenCalledWith(description);
  expect(screen.getByRole("checkbox", { name: /Company: Parsed Oy/ })).not.toBeChecked();
  expect(screen.getByRole("checkbox", { name: /Job title: Engineer/ })).not.toBeChecked();
  expect(screen.getByRole("checkbox", { name: /Location: Espoo/ })).toBeChecked();
  expect(screen.getByRole("checkbox", { name: /Application due date: 2026-11-05/ })).toBeChecked();
  expect(screen.getByText("React")).toBeInTheDocument();
  await user.click(screen.getByRole("checkbox", { name: /Company: Parsed Oy/ }));
  await user.click(screen.getByRole("button", { name: "Apply selected" }));
  expect(screen.getByRole("textbox", { name: "Company" })).toHaveValue("Parsed Oy");
  expect(screen.getByRole("textbox", { name: "Job title" })).toHaveValue("Developer");
  expect(screen.getByRole("textbox", { name: "Location" })).toHaveValue("Espoo");
  expect(screen.getByLabelText("Application due date")).toHaveValue("2026-11-05");
  expect(screen.getByRole("textbox", { name: "Job description" })).toHaveValue(description);
  if (mode === "add") await user.click(screen.getByRole("button", { name: "More details" }));
  expect(screen.getByRole("textbox", { name: "Notes" })).toHaveValue("Keep notes");
  expect(submit).not.toHaveBeenCalled();
});

it("cancels review without changing the form", async () => {
  vi.mocked(parseJobDescription).mockResolvedValue(parsed);
  const { user, submit } = renderForm("add", { jobDescription: "Company: Parsed Oy" });
  await user.click(screen.getByRole("button", { name: "Analyze description" }));
  const review = await screen.findByRole("dialog", { name: "Review description suggestions" });
  await user.click(within(review).getByRole("button", { name: "Cancel" }));
  expect(screen.getByRole("textbox", { name: "Company" })).toHaveValue("Example");
  expect(submit).not.toHaveBeenCalled();
});

it("ignores a response for a description changed during analysis", async () => {
  let resolve: (value: typeof parsed) => void = () => {};
  vi.mocked(parseJobDescription).mockImplementation(() => new Promise(value => { resolve = value; }));
  const { user } = renderForm("add", { jobDescription: "Company: Parsed Oy" });
  await user.click(screen.getByRole("button", { name: "Analyze description" }));
  await user.type(screen.getByRole("textbox", { name: "Job description" }), " updated");
  resolve(parsed);
  await waitFor(() => expect(screen.getByRole("button", { name: "Analyze description" })).toBeEnabled());
  expect(screen.queryByRole("dialog", { name: "Review description suggestions" })).not.toBeInTheDocument();
});

it("shows no-match and failure states without losing unsaved text", async () => {
  vi.mocked(parseJobDescription).mockResolvedValueOnce({ suggestions: [], detected: [] })
    .mockRejectedValueOnce(new Error("Network failed"));
  const { user } = renderForm("add", { jobDescription: "Plain text" });
  await user.click(screen.getByRole("button", { name: "Analyze description" }));
  expect(await screen.findByText(/No clear matches found/)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Analyze description" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Network failed");
  expect(screen.getByRole("textbox", { name: "Job description" })).toHaveValue("Plain text");
});

it("shows yearless and relative listing dates for review without applying a due date", async () => {
  vi.mocked(parseJobDescription).mockResolvedValue({ suggestions: [], detected: [
    { category: "date", value: "Published 7.10. (year not stated)", evidence: "Published 7.10. (3 days left)" },
    { category: "date", value: "3 days left (reference date unknown)", evidence: "Published 7.10. (3 days left)" },
  ] });
  const { user, submit } = renderForm("add", { jobDescription: "Published 7.10. (3 days left)" });
  await user.click(screen.getByRole("button", { name: "Analyze description" }));
  const review = await screen.findByRole("dialog", { name: "Review description suggestions" });
  expect(within(review).getByText("Published 7.10. (year not stated)")).toBeInTheDocument();
  expect(within(review).getByText("3 days left (reference date unknown)")).toBeInTheDocument();
  expect(within(review).getByRole("button", { name: "Apply selected" })).toBeDisabled();
  await user.click(within(review).getByRole("button", { name: "Cancel" }));
  expect(screen.getByLabelText("Application due date")).toHaveValue("");
  expect(submit).not.toHaveBeenCalled();
});

it("offers an inferred listing end as an explicitly reviewed due date", async () => {
  vi.mocked(parseJobDescription).mockResolvedValue({
    suggestions: [{ field: "deadline", value: "2027-04-12", evidence: "Published 12.10. (Ends 12.4.)", confidence: "medium" }],
    detected: [{ category: "date", value: "Listing ends 12.4. (year not stated)", evidence: "Published 12.10. (Ends 12.4.)" }],
  });
  const { user, submit } = renderForm("add", { jobDescription: "Published 12.10. (Ends 12.4.)" });
  await user.click(screen.getByRole("button", { name: "Analyze description" }));
  const review = await screen.findByRole("dialog", { name: "Review description suggestions" });
  expect(within(review).getByRole("checkbox", { name: /Application due date: 2027-04-12/ })).toBeChecked();
  expect(within(review).getByText(/The year was inferred/)).toBeInTheDocument();
  await user.click(within(review).getByRole("button", { name: "Apply selected" }));
  expect(screen.getByLabelText("Application due date")).toHaveValue("2027-04-12");
  expect(submit).not.toHaveBeenCalled();
});

it("disables analysis for blank text and rejects overlong input before sending", async () => {
  const { user } = renderForm("add");
  expect(screen.getByRole("button", { name: "Analyze description" })).toBeDisabled();
  fireEvent.change(screen.getByRole("textbox", { name: "Job description" }),
    { target: { value: "a".repeat(20001) } });
  await user.click(screen.getByRole("button", { name: "Analyze description" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Analyze up to 20,000 characters");
  expect(parseJobDescription).not.toHaveBeenCalled();
});

it.each(["add", "edit"] as const)("closes unchanged %s values directly", async mode => {
  const { user, close } = renderForm(mode);
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(close).toHaveBeenCalledOnce();
  expect(screen.queryByText("Discard changes?")).not.toBeInTheDocument();
});

it.each(["Cancel", "Escape", "backdrop"])("protects changed values when closing with %s", async method => {
  const { user, close } = renderForm();
  await user.type(screen.getByRole("textbox", { name: "Company" }), " changed");
  if (method === "Cancel") await user.click(screen.getByRole("button", { name: "Cancel" }));
  else if (method === "Escape") await user.keyboard("{Escape}");
  else {
    const backdrop = document.querySelector(".MuiDialog-container")!;
    fireEvent.mouseDown(backdrop);
    fireEvent.click(backdrop);
  }
  expect(screen.getByText("Discard changes?")).toBeInTheDocument();
  expect(close).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Keep editing" }));
  expect(await screen.findByRole("textbox", { name: "Company" })).toHaveValue("Example changed");
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  await user.click(screen.getByRole("button", { name: /^Discard$/ }));
  expect(close).toHaveBeenCalledOnce();
});

it("returns to clean after undoing formatting", async () => {
  const { user, close } = renderForm("edit", { jobDescription: "Advert  " });
  await user.click(screen.getByRole("button", { name: "Clean formatting" }));
  await user.click(screen.getByRole("button", { name: "Undo formatting" }));
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(close).toHaveBeenCalledOnce();
  expect(screen.queryByText("Discard changes?")).not.toBeInTheDocument();
});

it("blocks closing while saving and retains values after a failure", async () => {
  const { user, submit, close } = renderForm();
  let rejectSave: (reason: Error) => void = () => {};
  submit.mockImplementation(() => new Promise<void>((_, reject) => { rejectSave = reject; }));
  await user.type(screen.getByRole("textbox", { name: "Company" }), " changed");
  await user.click(screen.getByRole("button", { name: "Add application" }));
  expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  await user.keyboard("{Escape}");
  expect(close).not.toHaveBeenCalled();
  rejectSave(new Error("Save failed"));
  await waitFor(() => expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled());
  expect(screen.getByRole("textbox", { name: "Company" })).toHaveValue("Example changed");
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.getByText("Discard changes?")).toBeInTheDocument();
  expect(close).not.toHaveBeenCalled();
});

it.each([
  ["Company", "companyName", "Company name is required."],
  ["Job title", "jobTitle", "Job title is required."],
] as const)("requires a non-blank %s", async (label, field, error) => {
  const { user, submit } = renderForm("add", { [field]: "   " });
  expect(screen.getByRole("textbox", { name: label })).toBeRequired();
  await user.click(screen.getByRole("button", { name: "Add application" }));
  expect(screen.getByText(error)).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: label })).toHaveFocus();
  expect(submit).not.toHaveBeenCalled();
});

it("submits from a single-line field with Enter", async () => {
  const { user, submit } = renderForm();
  await user.click(screen.getByRole("textbox", { name: "Company" }));
  await user.keyboard("{Enter}");
  await waitFor(() => expect(submit).toHaveBeenCalledOnce());
});

it("preserves multiline Enter and focuses an invalid collapsed contact field", async () => {
  const { user, submit } = renderForm("add", { contactEmail: "invalid" });
  await user.click(screen.getByRole("textbox", { name: "Job description" }));
  await user.type(screen.getByRole("textbox", { name: "Job description" }), "First line{Enter}Second line");
  expect(submit).not.toHaveBeenCalled();
  expect(screen.getByRole("textbox", { name: "Job description" })).toHaveValue("First line\nSecond line");
  await user.click(screen.getByRole("button", { name: "Add application" }));
  await waitFor(() => expect(screen.getByRole("textbox", { name: "Contact email" })).toHaveFocus());
  expect(submit).not.toHaveBeenCalled();
});

it("does not move focus to another error while correcting a field", async () => {
  const { user } = renderForm("add", { companyName: "", jobTitle: "" });
  await user.click(screen.getByRole("button", { name: "Add application" }));
  await user.keyboard("Example");
  expect(screen.getByRole("textbox", { name: "Company" })).toHaveValue("Example");
  expect(screen.getByRole("textbox", { name: "Company" })).toHaveFocus();
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
    ["Applied date", original.appliedDate], ["Application due date", original.deadline],
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

it("formats a pasted role list through the Clean formatting button", async () => {
  const original = "\\\n**Roolisi meillä**\n\n\n* Työsi vaikuttaa palveluihin.\n• Kehität **AWS**-ympäristöä.\n\n\n\n";
  const { user, submit } = renderForm("add", { jobDescription: original });
  await user.click(screen.getByRole("button", { name: "Clean formatting" }));
  expect(screen.getByRole("textbox", { name: "Job description" })).toHaveValue("Roolisi meillä\n\n- Työsi vaikuttaa palveluihin.\n- Kehität AWS-ympäristöä.");
  expect(submit).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Undo formatting" }));
  expect(screen.getByRole("textbox", { name: "Job description" })).toHaveValue(original);
});

it("restores web list bullets on direct paste before Clean formatting", async () => {
  const { user, submit } = renderForm("add", { jobDescription: "Existing heading\n" });
  const field = screen.getByRole("textbox", { name: "Job description" }) as HTMLTextAreaElement;
  field.setSelectionRange(field.value.length, field.value.length);
  fireEvent.paste(field, { clipboardData: {
    getData: (format: string) => format === "text/plain" ? "Considered as an advantage:\n\nFirst item\nSecond item"
      : format === "text/html" ? "<p>Considered as an advantage:</p><ul><li>First item</li><li>Second item</li></ul>" : "",
  } });
  expect(field).toHaveValue("Existing heading\nConsidered as an advantage:\n\n- First item\n- Second item");
  await user.click(screen.getByRole("button", { name: "Clean formatting" }));
  expect(field).toHaveValue("Existing heading\n\nConsidered as an advantage:\n\n- First item\n- Second item");
  expect(submit).not.toHaveBeenCalled();
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
