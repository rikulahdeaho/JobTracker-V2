# Current feature and verification

## Active feature: Job Description Parser v1 (implemented — 2026-10-15)

**Status: implemented and automated checks passed; live browser review remains open.**
Implementation plan: [Job Description Parser](job-description-parser-plan.md).

### Objective

Extend the existing Add/Edit application's Job Description area with an explicit
**Analyze description** action. A deterministic backend parser identifies supported
facts from pasted Finnish or English job adverts and returns evidence-backed
suggestions for review. The user selectively applies suggestions to the current
unsaved form; parsing itself never saves or rewrites an application.

### V1 scope

- Suggest explicit **Company**, **Job title**, **Location**, **Application due
  date**, **Contact email**, **Contact person**, **Source**, and **Salary range**
  values. These fields already exist in the application model.
  Recognized technologies and remote/hybrid/on-site arrangements are displayed
  as informational detections; they are not stored as separate fields.
- Show source evidence for each proposal and an explicit Apply selected / Cancel
  choice. Existing non-empty values are not overwritten without explicit opt-in.
- Keep the original Job Description wording and separate Notes unchanged.
- Clean formatting now removes copied markup and excess spacing, unifies bullet
  markers as `-`, and recognizes unmarked lists under clear section headings.
  The action changes only the unsaved description; Undo restores the paste.
- Direct web paste now reads semantic list items from the clipboard's HTML and
  restores missing `-` bullets in the plain text field before Clean formatting.
  Existing markers and plain-text-only pastes follow their normal behavior.
- Support partial/no-match results, invalid or ambiguous dates, long inputs,
  authentication, and network failures without losing unsaved form data.
- Preserve the current form, Clerk access rules, workflow statuses, follow-up
  eligibility, timeline, Schedule, and all existing CRUD behaviors.
- No LLM, job URL import, CV matching, new storage for skill tags, or schema migration.

### Actual implementation and plan differences

- `POST /api/job-description/parse` uses the existing global Clerk authorization
  policy. It validates nonblank input and a 20,000-character parser limit, calls
  a deterministic service, and returns evidence excerpts with high/medium-confidence
  field suggestions and informational detections. It makes no database query or
  write. No dependency, AI integration, table, or migration was added.
- The shared Add/Edit dialog calls the endpoint only when **Analyze description**
  is clicked. A separate MUI review dialog has individual checkboxes. Empty fields
  are selected initially; populated fields require an explicit opt-in to replace.
  **Apply selected** updates unsaved form state only. Cancel, no matches, errors,
  and edits made while a request is in flight preserve the current form.
- The plan assumed Location might be absent, but `JobApplication`, its DTOs and
  the form already persist it, so a labeled location is applyable. Work arrangement
  remains informational because it has no dedicated field. The existing Job
  Description field has no length limit; the new limit applies only to analysis.
- The parser recognizes explicit Finnish/English labels and cautious narrative
  phrases. A Veikkaus advert regression case covers “Veikkaus is a gaming company”,
  “We're looking for a Lead Developer”, a headquarters location in
  Pohjois-Haaga/Helsinki, and “no later than 25.10.2026”. Copied Markdown and HTML
  character references are normalized for analysis only. Unclear or conflicting
  facts are omitted. It does not infer status or follow-up settings.
- Contact details are proposed only next to explicit contact cues. Privacy and
  no-reply addresses are excluded. Source is taken from an explicit Source/Lähde
  label or multiple Duunitori links in the listing header, not body links. Salary
  requires a pay cue, currency and amount; revenue and salary requests are
  excluded. Conflicting values are omitted. The four fields use the same
  selective review behavior as the original suggestions in Add and Edit.
- Aurora Live, Nordea and Academic Work listing cases cover title/company/location
  page headers, `Published 7.10. (3 days left)`, `Ends 24.10. at 12:59 AM`, and
  `Published 12.10. (Ends 12.4.)`. A concrete `Ends` date is suggested for
  Application due date ahead of a different employer deadline; the employer date
  remains visible as an informational detection. When `Ends` omits its year, the
  parser uses the listing's publication date and the browser-local analysis date
  to infer it, marks the suggestion medium confidence, and asks the user to check
  the year. With a 2026-10-15 reference date, `Ends 12.4.` resolves to
  2027-04-12. Relative text such as `3 days left` stays informational because it
  does not provide an exact end date. The client passes a date only; the endpoint
  remains authenticated and read-only.
- Date labels also recognize Finnish `Julkaistu`, `Päättyy`, `Haku päättyy`, and
  `Hakuaika päättyy`, including `klo 16.00` or `klo 16:00`. A Finnish publication
  date anchors the same year inference as `Published`.

### Definition of done

- [x] Suggestions include supporting excerpts and are never automatically saved.
- [x] Users can accept some suggestions, reject others, and cancel safely.
- [x] Existing populated fields and source description are protected.
- [x] Tested ambiguous values are omitted rather than guessed.
- [x] Add/Edit behavior, authorization, workflow rules, and persistence regressions pass automated tests.
- [ ] Live responsive, theme, keyboard, and authenticated browser checks remain.

### Verification status

| Check | Result |
| --- | --- |
| Backend tests | 119 passed in Release, including Finnish and English listing dates, year rollover, contact, source, salary, negative cases, authentication, and read-only endpoint behavior. |
| Backend build | Release build passed with 0 warnings and 0 errors. The running local Debug API locked its output files, so the final backend checks used Release. |
| Frontend tests | 186 passed across 14 files, including direct HTML-list paste, existing text insertion, formatting and Undo, Add/Edit selection, cancellation, stale response, and error cases. The complete suite passed with one worker and a 15-second per-test timeout. |
| Frontend build and lint | Passed. Existing large-chunk warning: 890.81 kB JavaScript (270.92 kB gzip); bundled font 874.71 kB. |
| UI detector | No findings for the changed form and review dialog. |
| Manual browser | The local browser origin was denied by the browser approval gate, so live authenticated Add/Edit was not checked. Desktop/mobile, both themes and keyboard review remain. |

The frontend runner initially hit a temporary-directory permission error during
a focused rerun. Using a writable task temporary directory allowed the tests to
run. Parallel full-suite runs timed out in existing contact and application-flow
tests under local load; the complete suite passed when run sequentially with a
15-second per-test timeout. The existing manual checks below are historical and
are not parser verification.

If a local API process was already running before this parser fix, restart it to
load the updated extraction rules.

---

## Previous feature: Search agenda and Application Form UX Refinement (implemented)

### Historical scope

**Search agenda visual identity and Application Form UX Refinement are implemented.** Remaining work is manual
validation of native date controls and the combined workflow. Deployment is
complete, as confirmed by the project owner on 2026-10-05.

The documentation review updates descriptions and removes obsolete plans.
It does not expand the product scope or change application behavior.
See [roadmap](roadmap.md) for uncommitted future options.

### UI polish (2026-10-05)

The requested polish pass addresses findings 1–7 of the
[technical UI audit](ui-audit-2026-10-05.md). It corrects Dashboard Closed counts
and urgency labels, improves contrast and accessible names, separates heading
semantics from visual size, adds form keyboard submission/error focus, and
improves touch targets and text wrapping. Native date controls follow the theme.
The original visual system and API/data workflows are preserved.

Validation: the full frontend suite ran 139 tests; 138 passed initially, and the
remaining light-navigation contrast case passed after correction in a targeted
rerun of both theme tests. Lint and the final production build passed. The
bundled UI detector returned no findings. The build still reports a large
JavaScript chunk (883.62 kB; 268.31 kB gzip) and an 874.71 kB font.

Local browser checks used the real signed-in session and API: Dashboard,
Applications, Insights, and Details loaded; light/dark switching worked; the
Add form validated via Enter and focused Company; footer buttons remained visible
with 44 px heights. Applications and Details had no page-level horizontal overflow
at 320 px; mobile cards and Insights were also checked at 390 px, and the form
at 1440 px. Checks did not save or delete application records. Full screen-reader,
zoom, and production smoke testing were not performed in this pass.

The audit's initial-loading finding remains open: eager routes and the large TTF
font are unchanged. The original audit score is historical and has not been
recalculated. Remaining native date persistence and combined-workflow checks
below are still outstanding.

## Design refinement (2026-10-05)

The owner requested all five improvements from the
[visual critique](../.impeccable/critique/2026-10-05T06-38-43Z__web-src.md).
The Dashboard now uses one priority panel and compact counts; mobile Applications
discloses secondary filters; Details places Record activity alongside Next Action;
Settings groups future-control previews; Schedule uses neutral clear states and
puts recorded dates first. Typography, card framing and explanatory copy are quieter.
MUI, the existing application workflows, and API behavior are preserved.

Validation: all 139 frontend tests passed after updating assertions for the revised
presentation. Final lint and production build passed; the existing bundle-size
warning remains (879.07 kB JavaScript, 267.41 kB gzip). The UI detector returned
no findings. Browser checks covered search/reset, mobile filters and sorting,
navigation, opening/canceling the activity dialog, theme switching and settings
preview disclosure. Desktop and 320/390 px mobile layouts were inspected with
existing records. No application records were created, edited or deleted.


## Search agenda implementation (2026-10-05)

The approved [whole-app plan](search-agenda-implementation-plan.md) applies the
Search agenda direction to Dashboard, Applications, Details, Schedule, Insights,
Settings and the shared forms. A single blue accent, neutral stage markers,
consistent Inter hierarchy and flatter surfaces replace competing color blocks
and unnecessary card framing. Dashboard prioritizes Next Action and recorded
Schedule dates; Pipeline snapshot is removed, with stage distribution retained
in Insights. Existing counters, filters, workflow rules, MUI, API and auth remain.

Insights labels current-stage counts accurately and links suggestions to Details.
Missing Applied dates are distinguished from applications not yet sent.
Add/Edit and activity dialogs confirm discarding actual unsaved changes.

Validation: all 164 frontend tests passed across 13 files. After the final visual
adjustments, eight relevant Dashboard, Insights and theme tests passed again.
Final lint and production build passed. The existing large-chunk warning remains
(879.15 kB JavaScript, 267.00 kB gzip; 874.71 kB font). The UI detector returned
no findings. No API code changed during this pass.

Local browser checks covered all six pages in light/dark at desktop and 390 px,
Dashboard at 1280 px, and Dashboard/Applications/Details at 320 px without
page-level horizontal overflow. Add/Edit/activity dialogs, discard confirmation,
navigation, theme controls, search/reset and mobile filters were checked with
existing signed-in records. No application data was saved or deleted. Screenshots
are in `.impeccable/review/`. This does not close the native date persistence,
combined workflow, zoom, screen-reader or production checks below.

Independent finish review: **ship**, no material fixes. The reviewer inspected
41 valid viewport captures and sampled source against the approved direction.
Populated Schedule and authentication/error/save-failure states rely on source
and automated tests rather than a separate live reviewer session.

## Search agenda personality refinements (2026-10-05)

The five requested refinements strengthen the existing Search agenda identity.
Shared ApplicationIdentity leads with a 700-weight role and secondary company text,
replacing company-initial avatars in Applications and Details and aligning action
and suggestion rows. Dashboard makes the application identity primary and its
task secondary, with a 1280px maximum reading width; Details uses 1200px.

Details puts Next Action and Timeline ahead of Description & notes. Quick facts
groups compact Dates, Contact and populated Reference fields; one collapsed
Missing optional details disclosure retains all absent optional fields without
a count. Add details opens the existing Edit form. Timeline and Schedule use
aligned date columns and group dividers, stacking at small widths. Dashboard's
View schedule action has its own row below the Schedule summary heading.

Validation: the full frontend suite passed 166 tests across 13 files. After the
final changes, 32 targeted tests across two files passed. Final lint and production
build passed; the existing large-chunk warning remains. The UI detector returned
no findings.

Local browser inspection produced 26 valid captures of the five changed pages
at 1440px desktop and 390px mobile in light/dark, plus Dashboard at 1280 × 720
in both modes. Filled and sparse Details were checked; Missing optional details
expanded, and Add details opened the prefilled Edit form, which was canceled
unchanged. Sparse Details had no page-level horizontal overflow at 320px.
No application records were saved or deleted. Populated Schedule and authentication,
error and save-failure states rely on source and automated tests in this pass.
Zoom, screen-reader and production checks were not performed. Independent finish
review: **ship**, no material fixes for the five authorized refinements. The fresh
reviewer inspected all 26 captures and source against the incumbent product,
design system and surface contract; no separate QUALITY BAR card was supplied.
The processed critique snapshot was closed; its historical score was not recalculated.
This pass does not close the remaining native date or combined-workflow checks.

## Inline sign-in (2026-10-05)

The signed-out page displays Clerk's native SignIn component directly, removing
the extra modal-launch step. An open, narrow layout and theme-aware Clerk
appearance use the existing Search agenda typography and colors. Authentication
options, API ownership, session expiration and cache isolation remain unchanged.
Hash routing supports embedded steps; Dashboard is the authentication fallback.

Validation: all 11 authentication/session tests, lint and production build passed.
The detector returned no findings. The real signed-out Clerk form was inspected
at desktop and 390px mobile in both themes, with no horizontal mobile overflow.
No credentials were submitted or accounts created; completing a new sign-in and
recovery/sign-up remain outside this browser check. Existing bundle warnings remain.
Independent finish review: **ship**, no material fixes for the inline login scope,
after inspecting five valid screenshots and the authentication source.

## Implemented form behavior

- Shared Add/Edit form: Basic Info, Application, expandable Contact, Job Description
  and expandable More details.
- Company and Job title remain the only required fields.
- The visible Application due date label maps to the existing `deadline` field.
- Applied date appears when relevant or already populated; status changes preserve it.
- Application method and follow-up preference labels retain their API enum values.
- Job description grows from eight to sixteen rows. Clean formatting is reversible
  and preserves wording; Notes remains separate.
- Edit populates existing values, collapsed fields retain values and failed saves
  preserve input.
- Fields stack on small screens and dialog footer actions stay outside the scroll area.

The [product guide](how-it-works.md#adding-and-editing) explains the form.
[Workflow rules](application-workflow.md) remain unchanged. File uploads, CV
selection, cover-letter persistence, AI rewriting and reminder persistence are
outside this feature.

## Verification

Local automated checks on **2026-10-05**:

| Check | Result |
| --- | --- |
| Frontend tests | 131 passed across 9 files. |
| Frontend lint | Passed. |
| Frontend build | Passed; existing bundle-size warning remains (about 881 kB JavaScript, 268 kB gzip). |
| Backend tests | 84 passed. |
| Backend build | Passed with no warnings or errors. |

The builds were run during the deployment-documentation update; tests and lint
were rerun during the full documentation review. No runtime code changed.

Tests cover CRUD, ownership/JWT validation, session/cache isolation, workflow
timing, Schedule derivation, form validation/preservation and provider-specific
migrations. Backend integration tests use isolated SQLite databases. PostgreSQL
migration SQL is checked offline; the suite does not use the production database.

Run from the repository root:

```powershell
dotnet build api/JobTracker.sln
dotnet test api/JobTracker.sln
cd web
npm run test
npm run build
npm run lint
```

### Recorded browser coverage

| Date | Confirmed locally |
| --- | --- |
| 2026-09-17 | Real Clerk A → B → A sessions, separate data/reminders, blocked foreign Details links, create/edit/activity writes, reload, navigation and themes. |
| 2026-10-02 | Minimal Draft creation, Edit/save/reload, conditional Applied date, contact validation, description cleanup/Undo and form stacking at 390 px. |
| 2026-10-03 | Native Applied date entry persisted through save/reload/Edit; a disposable application was deleted and remained absent after reload. |

These are historical local checks, not a new production browser pass.

### Release preparation (2026-10-03)

The earlier run passed 131 frontend and 77 backend tests, both builds and frontend
lint. Its browser scope is summarized above. The newer 84-test backend result
supersedes that automated total.

## Remaining manual checks

- Enter an **Application due date** through its native control and confirm
  save/reload/Edit preservation. Earlier automation could not populate it;
  that limitation did not establish a product defect.
- Exercise the native activity datetime controls for an interview, assignment and
  offer, checking local display and saved dates.
- Run the combined workflow: a portal application without direct email gets no
  follow-up suggestion; eligible email contact does; a recorded reply resets
  timing; ordinary edits do not.
- Verify manual status review and that Schedule removes past interviews and
  submitted assignments while keeping real deadlines distinct from suggestions.
- Record a production smoke-test result separately if one is performed. Deployment
  confirmation alone does not mark these checks complete.

Browser sign-in expiry and in-flight session races were not manually induced;
automated tests cover those paths. General activity editing/deletion, immutable
audit history and concurrent-editor conflict handling are not implemented.
