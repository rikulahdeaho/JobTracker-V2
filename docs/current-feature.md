# Current feature and verification

## Current scope

**Application Form UX Refinement is implemented.** Remaining work is manual
validation of native date controls and the combined workflow. Deployment is
complete, as confirmed by the project owner on 2026-10-05.

The documentation review updates descriptions and removes obsolete plans.
It does not expand the product scope or change application behavior.
See [roadmap](roadmap.md) for uncommitted future options.

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
