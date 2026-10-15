# Job Description Parser — Implementation Plan

Status: Planned, not implemented  
Date: 2026-10-15  
Related: `current-feature.md`, `how-it-works.md`, `application-workflow.md`

## 1. Goal

Add an explicit, user-controlled **Analyze description** action to the existing shared Add/Edit application form. Users paste a job advertisement into the existing Job Description field, inspect extracted field suggestions, and selectively apply them to the unsaved form. No automatic saving or destructive overwriting.

This is a deterministic, local-rule-based parser (no LLM, scraping, browser extension, or third-party API) and must fit the existing Search agenda UI and workflow.

## 2. Existing behavior to preserve

- Shared Add/Edit form: Basic Info, Application, optional Contact, Job Description, optional More details.
- Only Company and Job title are mandatory to save. User may run parsing before filling them.
- Job Description is already persisted separately from Notes; cleanup is reversible and wording-preserving.
- Existing `deadline` API field is shown as **Application due date**.
- All existing application method, follow-up, status, Next Action, activity, Schedule, and ownership rules remain unchanged.
- Unsaved edits are retained on parser failure or cancellation. Existing form dismissal/discard protections remain.
- Parser results are suggestions, never evidence that data was entered or verified by the user.

## 3. V1 functional scope

### Supported extraction

1. **Company**: cautiously suggest an explicit employer name when a reliable pattern exists, e.g. `Company: Example Oy`. Do not assume the organization mentioned in marketing copy is the hiring company.
2. **Job title**: suggest from explicit heading/label patterns, e.g. `Job title: Fullstack Developer`. Do not guess merely from a stack list.
3. **Technologies**: identify dictionary-based, case-insensitive technology mentions with word boundaries and alias normalization (`.NET`, `ASP.NET Core`, `TypeScript`, `React`, `Azure`, `SQL Server`, etc.). Deduplicate, preserve evidence snippets, and never infer unmentioned skills.
4. **Location / work arrangement**: identify explicit Helsinki / Espoo / Vantaa etc. or `remote`, `hybrid`, `on-site` terms; return them as informative suggestions. Only apply to persisted fields if matching fields already exist. Do not add DB columns in V1 merely for these suggestions.
5. **Application deadline**: parse unambiguous Finnish/ISO dates when clearly tied to a deadline phrase (`Hakuaika päättyy`, `Apply by`, etc.). No implicit dates or fabricated year. Reject ambiguous or invalid values rather than guessing.

Return empty/partial results normally; avoid forcing a result for every field. English and Finnish advertisement text should be supported for representative patterns. The parser must not decide application status, applied date, follow-up eligibility, priority, salary, or contact details.

### UX

- The existing Job Description section gains a secondary **Analyze description** action; disable when input is blank, and show pending/error states.
- Show a preview panel/dialog consistent with existing MUI design. Each proposal includes the extracted value, a short source excerpt, and an individual acceptance control.
- Explicit **Apply selected** copies accepted suggestions into the form only. **Cancel** leaves all values unchanged.
- Non-empty conflicting fields are unchecked by default; a user must explicitly opt in to replacing them. Empty fields can be preselected, but are still applied only after confirmation.
- Technologies and values without a persisted destination are displayed as *Detected in description*, with no pretend data persistence. Avoid adding to Notes or mutating the source description.
- If no trustworthy matches, show a quiet no-results message; manual entry remains available.
- On Add and Edit, applying suggestions updates only form state, not the database. Existing Save persists the form via current API.
- Parsing the same text twice must not compound suggestions or change untouched fields.

## 4. Implementation design

### Backend

- Inspect existing controllers/endpoints, DTO conventions, DI setup, auth/ownership handling, and validation before choosing files and route names.
- Suggested endpoint: `POST /api/job-description/parse` receiving `{ "text": "..." }` and returning structured proposals with `field`, `value`, `evidence`, and `confidence` (use an explainable coarse value such as `high` / `medium`, not a pseudo-precise percentage). Adapt naming to repo conventions.
- Register a focused parser service and pure extraction helpers. Prefer ordered rules and explicit patterns; avoid a generic NLP framework.
- Enforce a modest maximum input length consistent with the app's description limit; respond with validation errors for empty/overlong requests. Do not log raw advertisement text.
- Require an authenticated session using the existing Clerk auth policy even though this endpoint does not access application records. Rate-limiting is optional if existing project conventions support it.
- Treat supplied text as untrusted data. Return plain strings; never render advertisement HTML as executable HTML.
- No new database tables or EF migrations for V1; derived suggestions are transient.

### Frontend

- Add typed request/response models in the existing API client pattern.
- Use the shared Add/Edit form so both flows behave identically.
- Keep suggestions in temporary UI state, separate from persisted application state, and reset/mark stale if the source text changes after parsing.
- Reuse form validation, error focus, keyboard and discard-confirmation conventions.
- Prefer small reusable UI components; do not introduce a parallel application form or a large third-party state library.
- Respect light/dark themes, narrow mobile layouts (320/390 px), accessible labels, keyboard interaction, and loading announcements.

## 5. Delivery steps

1. **Repository inspection:** confirm actual form components, API client, DTOs, current database fields, description character limit, and test conventions. Resolve deviations from the suggestions above in a short implementation note; do not invent missing schema fields.
2. **Extraction contracts:** define a narrow response DTO with evidence and detected-only values. Write examples for Finnish and English input and ambiguous cases.
3. **Parser implementation:** start with labeled company/title, dictionary-based skill extraction, explicit work arrangement/location, and strict deadline detection. Keep independent rules unit-testable.
4. **Endpoint:** authenticated parse request, validation, DI, error handling; no writes.
5. **Form integration:** Analyze button, review dialog, selective apply, conflict handling, no-results/stale/error states.
6. **Tests:** parser units, endpoint validation/auth, UI selection/overwriting semantics, Add/Edit regression coverage.
7. **Verification:** run backend and frontend test/build/lint commands; manually exercise desktop/mobile, light/dark, keyboard, filled/empty Add/Edit; document exactly what was and was not validated.
8. **Documentation:** update `current-feature.md` with actual results, `how-it-works.md` for the workflow, and relevant roadmap entries after implementation. Do not mark this plan done based solely on generated code.

## 6. Acceptance criteria

- [ ] The same Analyze action works in Add and Edit using current unsaved description text.
- [ ] Parsing never calls Save or changes persisted application data.
- [ ] User can review and selectively apply proposals, and cancel without any changes.
- [ ] Non-empty existing fields are not silently overwritten.
- [ ] Job Description and Notes remain untouched when applying proposals.
- [ ] Technology recognition deduplicates aliases and does not create nonexistent DB fields.
- [ ] Ambiguous employer, title, or date is omitted rather than fabricated.
- [ ] Blank input, excessive input, no matches, network error, and unauthorized request are handled.
- [ ] All applicable existing workflows and follow-up rules remain unchanged.
- [ ] Parser/endpoint/front-end tests pass; lint/build pass; any known warnings are reported.
- [ ] Manual usability checks cover keyboard and mobile layouts, both themes, and Add/Edit.

## 7. Explicitly out of scope

LLMs, AI writing, automatic job fetching from URLs, browser extensions, PDFs, uploading CVs, skill matching scores, persisting detected technology tags, database migrations solely for parser output, autonomous updates, and parsing emails. Consider separately after V1 is validated.

## 8. Risks and design decisions

- Job ads have unpredictable structures. Favor precision over recall; failure to identify data is acceptable.
- Company names in consultancy ads may refer to recruiter, hiring client, or product. Only propose names supported by explicit evidence.
- Locations/dates can appear in unrelated contexts; require contextual clues and reject ambiguous cases.
- Existing backend enums and fields are authoritative; do not add speculative `location` or `remoteType` columns just for parser results.
- Keep parser service independently replaceable so a later opt-in LLM implementation could return the same suggestion contract.

## 9. Verification commands (from repository root)

```powershell
dotnet build api/JobTracker.sln
dotnet test api/JobTracker.sln
cd web
npm run test
npm run build
npm run lint
```

These commands are documented, **not executed** as part of this planning task.
