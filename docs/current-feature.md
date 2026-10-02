# Current Feature

## Feature Name

Reminder / Schedule Product Refinement and Next Action Logic

## Status

Implemented; browser acceptance in progress.

Automated verification on 2026-10-02: 77 backend tests and 88 frontend tests passed;
both builds and frontend lint passed. Full browser acceptance remains pending.
See [current behavior and verification limits](how-it-works.md#tests-and-verification).

## Scope

Refine the existing JobTracker web application and ASP.NET Core API, mainly in `web/`, `api/`, and `docs/`. Preserve Clerk authentication, per-user ownership, existing CRUD and event endpoints, React/TanStack Query/Axios data flow, EF Core/SQLite persistence, and the current nine application statuses. Do not modify `mobile/` or deploy.

## Goal

Make Next Action and Schedule useful for applications submitted through portals where a follow-up may be impossible. Show real dated commitments separately from suggested attention. Never infer a terminal status from elapsed time.

## Behavior Before This Feature

Previously, Applied applications received a follow-up suggestion and a Schedule reminder 14 days after the latest `ApplicationSent` or `FollowUpSent`; after 30 days, Next Action said `Consider ghosted`. Interviewing generally said `Prepare interview`. The implementation now follows the rules below. Reminders and Next Action remain frontend-derived, with no database table or endpoint for reminders.

## Product Language

- Rename the Applications filter `Needs follow-up` to **Needs attention**. It should select applications with a meaningful action that the user can take now, including `Review status`, rather than treating every aging application as contactable.
- Replace `Consider ghosted` with **Review status**. The user may then keep the process active or manually set status to `Ghosted`.
- If the Dashboard's `Active` or `active processes` metric is ambiguous beside the Applications `Active` filter, label it **Active hiring processes** and retain its current count definition (`Applied`, `Interviewing`, `Assignment`, `Offer`). Keep the list filter's definition clear.

## Model Changes

Add `applicationMethod` to the application create/update/response model. Supported values: `CompanyPortal`, `Email`, `RecruiterDirect`, `LinkedInEasyApply`, `Other`, and `Unknown`. New records should ask for a method without requiring it; old records migrate to `Unknown`.

Add optional `contactPerson` and `contactEmail`. Add an explicit follow-up preference such as `followUpMode` (`Possible`, `NotAvailable`, `NotNeeded`, `Unknown`) or an equivalent model with the same distinctions. `Unknown` is the safe migration/default value. A valid direct contact channel and no `NotNeeded`/`NotAvailable` preference makes a follow-up appropriate; `Possible` may explicitly enable it when a usable channel exists. An application method alone, including `Email` or `RecruiterDirect`, must not invent contact details. `CompanyPortal` and `LinkedInEasyApply` without a usable direct contact channel must not generate a follow-up. If the implementation supports another direct channel, define and validate it consistently.

Consider adding a `ContactReceived` or `RecruiterContact` event with `OccurredAt` for an actual recruiter reply. Prefer an event so the timing is auditable and does not depend on `updatedAt`. Its creation follows existing event ownership and validation rules. It may update the workflow status only through the existing explicit event workflow rules, never through derived Next Action or Schedule calculation.

## Timing Rules

Use the latest relevant communication event (`ApplicationSent`, `FollowUpSent`, or `ContactReceived` when added) as the unanswered-response anchor. A recruiter reply resets the stale-response clock. Do not use `updatedAt`, notes edits, or unrelated events. Use the existing whole-24-hour elapsed-day convention for response thresholds and the existing local-calendar convention for dated Schedule entries. If the response anchor is missing, ask the user to record the relevant activity rather than inventing a date.

| Situation | Next Action | Needs attention? |
| --- | --- | --- |
| `Applied`, fewer than 14 days since response anchor | Wait for response | No |
| `Applied`, 14 to fewer than 30 days, follow-up appropriate and contactable | Follow up | Yes |
| `Applied`, 14 to fewer than 30 days, follow-up unavailable, unneeded, or contact unknown | Wait for response | No |
| `Applied`, at least 30 days without a newer response | Review status | Yes |
| `Applied`, missing response anchor | Add application activity/details | Yes |
| `Draft` / `ToApply` | Finish application / Apply | Yes, under existing actionable rules |
| `Rejected`, `Ghosted`, `Withdrawn` | No action | No |

At exactly 14 days, the middle band begins; at exactly 30 days, `Review status` takes precedence regardless of follow-up eligibility. A `FollowUpSent` event resets the clock. A `ContactReceived` event resets it and should prevent an immediately stale follow-up. Do not automatically mark an application `Ghosted` at any age. Status remains a stored user/workflow choice; Next Action remains a derived suggestion.

| Workflow state | Condition | Next Action |
| --- | --- | --- |
| `Interviewing` | Future interview time | Prepare interview |
| `Interviewing` | Interview time has passed, no newer phase/contact resolving it | Wait for interview feedback |
| `Interviewing` | No interview time | Add interview details |
| `Assignment` | Assignment submitted | Wait for assignment feedback |
| `Assignment` | Assignment not submitted, deadline known | Submit assignment |
| `Assignment` | Assignment not submitted, deadline missing | Add assignment deadline |
| `Offer` | Response deadline known | Respond to offer |
| `Offer` | Response deadline missing | Review offer |

Use the latest relevant event when multiple interviews or assignments exist. An actual recruiter reply or newer phase event should prevent an obsolete interview-feedback suggestion. Keep existing sensible behavior for closed applications.

## Schedule Rules

Separate two kinds of entries in the UI and in the derivation code:

| Kind | Sources | Behavior |
| --- | --- | --- |
| Hard-date commitments | Future interview time, unsubmitted assignment deadline, offer response deadline, application deadline | Show the recorded date/time; never fabricate one. Remove or supersede entries when the workflow event shows completion or a newer date. |
| Derived attention | Eligible follow-up at response anchor + 14 days; review status at +30 days; other genuinely actionable review prompts if already supported | Label as suggested attention, not a deadline. Do not create follow-up for uncontactable portal applications. Do not create `Ghosted` automatically. |

An aging portal application may appear as `Review status` at day 30 without a follow-up at day 14. Avoid duplicate or contradictory entries when a new communication event resets the clock. Closed applications produce no future derived attention. Preserve the current frontend-derived reminder design unless a concrete requirement requires storage; do not introduce a reminder table or completion API for this feature.

## Frontend Changes

- Extend add/edit forms and application display with method, optional contact details, and follow-up preference. Use clear defaults and explain that portal applications without a contact will simply be monitored.
- Update shared types, API mapping, form validation, Next Action derivation, list filtering, Schedule derivation and grouping, Dashboard labels/count presentation, and any related Insights wording.
- Show hard dates and suggested attention as visibly distinct sections or types. Keep links from entries to the owning application.
- Offer `Mark as ghosted` and `Keep active` from the review flow if practical; `Mark as ghosted` must invoke the normal authorized status update. `Keep active` must not silently change status or hide later review without a defined persisted choice.
- Allow recording a recruiter reply if the new event is implemented. Make the event timestamp explicit.
- Keep authentication loading, signed-out state, query-cache isolation, error handling, theme behavior, and CRUD flows intact.

## Backend Changes

- Extend the entity, DTOs, enum/string validation, mapping, and EF Core migration only for fields/events actually added.
- Preserve owner scoping through the validated authenticated subject on all existing endpoints. Never accept a writable `UserId`.
- Validate new fields and event payloads consistently on POST and PUT. Keep existing request/response conventions.
- Do not calculate or persist Next Action, Schedule entries, or automatic `Ghosted` transitions on the backend.

## Migration Guidance

Migrate existing applications with `applicationMethod = Unknown` and `followUpMode = Unknown` (or equivalent). Keep existing contact fields null and existing statuses, dates, and events untouched. Unknown follow-up eligibility must not generate an automatic follow-up. Do not synthesize recruiter replies, change ownership, or rewrite historical events. Document the migration and any changed behavior for old records. Add an EF Core migration only when schema changes require it.

## Tests

Backend tests should cover new field round-trips and validation, defaults/migration behavior, event persistence if added, and cross-user ownership for the new event and data. Existing authentication and CRUD tests must keep passing.

Frontend tests should cover the 14- and 30-day boundaries, portal/no-contact cases, direct contact and explicit preference cases, unknown legacy data, follow-up and recruiter-reply clock resets, missing timestamps, future/past interviews, submitted assignments, Schedule category and date behavior, closed statuses, `Needs attention`, and manual Ghosted status changes. Test the user-visible flow without mirroring internal helpers.

## Validation

Run backend `dotnet test` and `dotnet build` from `api/`. Run frontend `npm run test`, `npm run build`, and `npm run lint` from `web/`. Report any failures and their cause; do not claim checks passed unless run.

## Manual Validation

- Create a portal application without contact information; verify no day-14 follow-up on Next Action or Schedule and a day-30 `Review status` prompt.
- Create a contactable application; verify day-14 follow-up, then record a follow-up and recruiter reply and verify the response clock resets.
- Verify `Review status` does not change status. Manually mark Ghosted and confirm closed-state behavior; keep another application active.
- Verify future and past interviews, submitted assignments, and each hard deadline appear correctly and separately from suggested attention.
- Verify add/edit/detail, list filter, Dashboard, Schedule, Insights, reload, signed-in ownership isolation, and theme behavior remain functional.

## Out of Scope

- Automatic email or portal messages, email/push notifications, calendar sync, AI-generated outreach, background jobs, stored reminder completion, automatic Ghosted classification, new statuses, production deployment, mobile implementation, and unrelated visual redesigns.

## Definition of Done

- The model records application method and enough contact/follow-up information to avoid impossible follow-ups.
- `Needs attention` replaces `Needs follow-up` throughout the relevant UI and uses actionable rules.
- Applied timing, recruiter reply, interview, assignment, and Schedule behavior match the tables above.
- Hard dates and derived attention are visually and logically separate.
- Only a user action or existing explicit workflow transition changes stored status; derived logic never does.
- Migration preserves existing data and ownership; automated checks and manual scenarios pass or documented blockers remain.
- Relevant product and API documentation is updated.

## Expected Result

JobTracker presents real deadlines as dates, suggests follow-up only when the user can actually contact someone, and asks for a status review after prolonged silence. The user decides whether a process is Ghosted.

## History

- Completed Web App Mock Data Foundation
- Completed Web CRUD Flow with Local State
- Completed Frontend Applications API Integration
- Completed Applications Automated Test Layer
- Completed Application Workflow Model
- Completed Authentication and User Ownership
- Planned Reminder / Schedule Product Refinement and Next Action Logic
