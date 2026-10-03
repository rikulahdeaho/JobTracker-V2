# Current Feature

## Feature Name

Application Form UX Refinement

## Status

Implemented; automated checks pass. Native date entry and the full manual
workflow matrix remain to be verified in the browser.

### Implementation and verification (2026-10-02)

- Add and Edit share the four sections below, updated labels and contact helper text.
- Applied date is visible for submitted statuses or whenever a value exists;
  changing status never clears or invents the date.
- Job description starts at eight rows and grows with content; Notes starts at three.
- Clean formatting normalizes line endings, trims trailing spaces and reduces extra
  blank lines. It preserves words, paragraphs, bullets and indentation. Undo restores
  the original text; further manual description edits dismiss that undo action.
- Added 35 frontend tests for required fields, enum mappings, date visibility and
  preservation, Edit values, contact validation, formatting and Undo.
- `npm run test`: 123 tests passed across nine files.
- `npm run build` and `npm run lint`: passed. Vite retains its bundle-size warning.
- Signed-in browser checks covered minimal Draft creation, Edit/save/reload,
  Applied date appearing on status change, portal without contact details, valid
  and invalid contact email, description cleanup/Undo, and responsive stacking at
  390px with visible footer actions.
- Native date entry/persistence and the complete workflow matrix below were not
  repeated in the browser. Date preservation and eligibility have automated coverage.
- One browser QA record, `Form UX QA / Draft verification`, was retained locally.
- Backend, API contracts and workflow rules were unchanged; backend checks were not
  rerun for this frontend-only feature. Application Documents remains separate.

## Scope

Improve the existing Add Application and Edit Application forms.

Work mainly inside:

- `web/`
- `docs/`

Minimal API changes are allowed only if a clear integration issue is discovered.

Do not modify the current application workflow rules or persistence model unless required to fix a bug.

Do not implement CV/file uploads or Cover Letter persistence during this feature.

---

## Goal

Make Add Application and Edit Application easier to scan, faster to use and clearer about what each field represents.

The current application model and workflow are already functional.

This feature should improve:

- information hierarchy
- section organization
- field labels
- conditional field visibility
- helper text
- Job Description usability
- Add vs Edit usability

without redesigning the whole application.

---

## Existing Behavior to Preserve

The form currently supports:

- Company
- Job title
- Job URL
- Location
- Status
- Applied date
- Application deadline
- Source
- Salary range
- Application method
- Follow-up preference
- Contact person
- Contact email
- Notes
- Job description

Application method values currently are:

```text
Unknown
CompanyPortal
Email
RecruiterDirect
LinkedInEasyApply
Other
```

Follow-up mode values currently are:

```text
Unknown
Possible
NotAvailable
NotNeeded
```

The stored enum/API values must remain compatible with the existing backend.

Do not change workflow behavior simply to improve labels.

---

## Form Structure

Organize the form into these sections:

```text
Basic Info
Tracking
Application & Contact
Details
```

A future `Documents` section may be added later, but it is not part of this feature.

---

## Basic Info

Fields:

```text
Company *
Job title *
Job URL
Location
```

Requirements:

- Company remains required.
- Job title remains required.
- Keep Job URL optional.
- Keep Location optional.
- Preserve existing validation.
- Keep two-column layout on desktop where practical.
- Stack cleanly on smaller screens.

---

## Tracking

Fields:

```text
Status
Applied date
Application deadline
Source
Salary range
```

### Deadline Label

Rename the user-facing label:

```text
Deadline
```

to:

```text
Application deadline
```

Do not rename the backend/database field.

The purpose is to distinguish the application deadline from:

- interview time
- assignment deadline
- offer response deadline

which already belong to workflow events.

### Applied Date

Make Applied date context-aware.

For Add Application:

- hide or de-emphasize Applied date while status is `Draft` or `ToApply`
- show it when the selected status represents an application that has already been submitted or progressed further

Relevant statuses include:

```text
Applied
Interviewing
Assignment
Offer
Rejected
Ghosted
Withdrawn
```

For Edit Application:

- show Applied date when it already contains a value
- also show it when the current status implies the application has been submitted

Important:

- never silently clear an existing Applied date because the field becomes hidden
- do not invent an Applied date
- preserve current API behavior around ApplicationSent events

---

## Application & Contact

Fields:

```text
Application method
Follow-up preference
Contact person
Contact email
```

Keep the existing stored enum values.

Improve only the user-facing labels.

### Application Method Labels

Suggested UI labels:

```text
Unknown             -> Not specified
CompanyPortal       -> Company portal
Email               -> Email
RecruiterDirect     -> Direct recruiter contact
LinkedInEasyApply   -> LinkedIn Easy Apply
Other               -> Other
```

The API values must remain unchanged.

### Follow-Up Preference Labels

Suggested UI labels:

```text
Unknown       -> Default
Possible      -> Follow-up possible
NotAvailable  -> No direct follow-up channel
NotNeeded     -> Do not suggest follow-up
```

These are display labels only.

Do not rename the persisted enum values during this feature.

### Helper Text

Make the relationship between follow-up preference and contact email easier to understand.

For example:

```text
Follow-up suggestions require a valid contact email.
```

If a user selects a follow-up option that requires direct contact but no valid email is available, preserve the existing validation/business rules and explain the situation clearly.

Do not imply that:

```text
Company portal
LinkedIn Easy Apply
Contact person name
```

alone provide a direct follow-up channel.

---

## Details

Organize the Details section so Job Description and Notes have visibly different purposes.

Preferred order:

```text
Job description
Notes
```

### Job Description

Job Description should be the larger field.

The field may contain a full copied job advertisement, so give it noticeably more vertical space than Notes.

Suggested helper text:

```text
Paste the relevant job advertisement text here for later reference.
```

Do not impose a small fixed visual height that makes long job descriptions difficult to edit.

### Notes

Notes should remain a smaller field intended for the user's own observations.

Suggested helper text:

```text
Your own notes about the application, company or hiring process.
```

Do not mix Notes and Job Description content.

---

## Job Description Formatting

Add a small deterministic formatting utility if it can be implemented cleanly without adding dependencies.

Suggested action:

```text
Clean formatting
```

This action may:

- normalize line endings
- trim leading/trailing whitespace
- reduce excessive blank lines
- remove trailing spaces
- preserve meaningful paragraph breaks
- preserve bullet-style lines where possible

It must not:

- rewrite content
- summarize the job advertisement
- invent missing information
- use AI
- remove meaningful text

The cleanup should be reversible before saving through normal form editing, because it only changes the textarea value.

If a safe implementation would require significant complexity, leave the button out and only improve the textarea UX.

---

## Add Application Behavior

Add Application should feel fast.

Required information remains only:

```text
Company
Job title
```

Do not make optional fields required.

Avoid overwhelming the user with unnecessary explanatory text.

The form should still support entering all available information before saving.

Do not add a separate multi-step wizard.

---

## Edit Application Behavior

Edit Application should use the same underlying form and field structure where practical.

Existing saved values must populate correctly.

Editing must preserve:

- application method
- follow-up preference
- contact information
- dates
- status
- job description
- notes
- source
- salary
- URL
- location

Do not reset optional fields when opening Edit.

---

## Add vs Edit Consistency

Prefer shared field components/form logic rather than maintaining two divergent forms.

Differences between Add and Edit should be limited to things such as:

```text
dialog title
submit button text
existing field values
context-aware Applied date visibility
```

Avoid duplicated business logic.

---

## Layout

Keep the current MUI visual direction.

Requirements:

- clear section headings
- consistent spacing
- readable helper text
- two-column layout where useful
- full-width long-text fields
- responsive stacking
- footer actions remain easy to reach

Do not make the dialog unnecessarily wider.

If the form exceeds the available viewport height:

- allow the content area to scroll
- keep actions usable
- avoid making the whole browser page scroll behind the dialog

---

## Documents

Do not implement Documents during this feature.

A future feature may add:

```text
Saved CVs
CV versions
CV selection per application
Cover Letter
Original file storage
Extracted document text
```

Do not add temporary Base64/PDF fields to JobApplication.

Do not add placeholder database columns for future document functionality yet.

---

## Workflow Rules

Do not change the current Next Action rules.

Preserve the existing behavior where:

- metadata edits do not reset response timing
- ApplicationSent, FollowUpSent and ContactReceived drive response timing
- contactability affects follow-up suggestions
- application deadline is separate from interview, assignment and offer dates
- status is not automatically changed to Ghosted

Form UX changes must not alter these rules.

---

## API Compatibility

Preserve the existing API contracts unless an actual bug requires a change.

Do not rename API fields such as:

```text
deadline
applicationMethod
followUpMode
contactPerson
contactEmail
jobDescription
notes
```

UI labels may differ from backend property names.

---

## Tests

Update frontend tests where necessary.

Test important behavior such as:

- Company remains required
- Job title remains required
- Add form maps application method correctly
- Add form maps follow-up mode correctly
- Edit form preserves existing values
- user-facing enum labels map to the correct API values
- Applied date visibility follows the intended status rules
- hidden Applied date is not silently cleared
- contact validation still works
- Job Description formatting utility preserves content correctly, if implemented

Do not add tests for MUI implementation details.

Do not use snapshot tests just to capture the form layout.

---

## Manual Validation

Test Add Application:

1. Open Add Application.
2. Verify the section hierarchy is clear.
3. Create a Draft application with only Company and Job title.
4. Create a ToApply application with an application deadline.
5. Create an Applied application with an Applied date.
6. Create an Email application with a contact email.
7. Create a portal application without contact details.
8. Verify all saved values after reopening the application.

Test Edit Application:

1. Open an existing application.
2. Verify all saved values populate.
3. Change Status.
4. Verify Applied date behavior.
5. Change Application method.
6. Change Follow-up preference.
7. Change Contact person/email.
8. Edit Job Description and Notes.
9. Save.
10. Reload the page.
11. Verify values persist.

Verify workflow behavior:

- portal application without direct email does not incorrectly gain a follow-up suggestion
- valid contact email still enables the existing eligible follow-up behavior
- unrelated form edits do not reset workflow timing
- Application deadline continues to behave as an application deadline
- Next Action remains correct

---

## Not Included

Do not implement:

- CV uploads
- CV selection
- CV versioning
- Cover Letter persistence
- file storage
- Base64 file storage
- PDF parsing
- AI job-description parsing
- AI rewriting
- AI cover-letter generation
- document comparison
- reminder persistence
- deployment
- production PostgreSQL
- mobile changes

---

## Validation

Frontend:

```powershell
cd web
npm run test
npm run build
npm run lint
```

Backend should not normally require changes.

If backend code is changed:

```powershell
cd api
dotnet test
dotnet build
```

---

## Definition of Done

This feature is complete when:

- Add/Edit forms are easier to scan
- sections have clear purposes
- `Application deadline` is clearly named in the UI
- Application Method labels are user-friendly
- Follow-up Preference labels are user-friendly
- persisted enum/API values remain unchanged
- Applied date is presented contextually without data loss
- Job Description is easier to enter and review
- Notes remain clearly separate from Job Description
- optional deterministic formatting works safely if implemented
- existing validation still works
- existing contact/follow-up logic still works
- existing workflow rules still work
- Add Application works
- Edit Application works
- frontend tests pass
- frontend build passes
- lint passes
- no document/file-storage system was added

---

## Expected Result

The form should feel like:

```text
BASIC INFO
Company              Job title
Job URL              Location

TRACKING
Status               Applied date
Application deadline Source
Salary range

APPLICATION & CONTACT
Application method   Follow-up preference
Contact person       Contact email

DETAILS
Job description

Notes
```

The form remains comprehensive without making the initial application creation unnecessarily difficult.

---

## Next Possible Feature

A separate future feature can be:

```text
Application Documents
```

Possible scope:

```text
Reusable CV library
CV versions
Select CV version per application
Cover Letter text
Optional original files
Extracted document text
Job Description normalization
```

Do not implement it as part of the current feature.

---

## History

- Completed Applications API Integration
- Completed Application Workflow Model
- Completed Authentication and User Ownership
- Completed Application Contact Preferences
- Started Application Form UX Refinement
