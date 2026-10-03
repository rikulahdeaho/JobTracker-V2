# Application Workflow Model

Implemented 2026-09-16. `JobApplication.UpdatedAt` is technical metadata. Notes,
salary, source and description edits do not count as contact or reset workflow timers.

## Persisted model

`JobApplication` retains its existing fields and statuses. It owns an `Events`
collection with cascade deletion. `ApplicationEvents` has:

| Field | Meaning |
| --- | --- |
| `Id`, `ApplicationId` | Event identity and required application foreign key. |
| `Type` | String enum identifying meaningful activity. |
| `OccurredAt` | When the activity happened, UTC. |
| `DueAt` | Optional actual interview time, assignment deadline or offer response deadline, UTC. |
| `Note` | Optional user note, at most 4000 characters. |
| `FromStatus`, `ToStatus` | Previous/new status for automatic status-change events. |
| `CreatedAt` | When the event was recorded, UTC. Separate from the activity date. |

Event types are `ApplicationCreated`, `ApplicationSent`, `StatusChanged`,
`FollowUpSent`, `ContactReceived`, `InterviewScheduled`, `AssignmentReceived`, `AssignmentSubmitted`
and `OfferReceived`. No generic notes event, notifications or interview-completion
workflow is included in this slice.

No separate Reminder table is needed yet. Schedule items are derived from persisted
event dates and the application deadline. Next Action also remains derived.

## API and UI

Existing application GET, POST and PUT responses now include `events`, ordered by
`OccurredAt` descending, then event `CreatedAt` descending, then ID for ties.
The list response includes events too: Dashboard, Schedule, Insights and Applications
reuse the existing TanStack Query list cache without a separate request per application.
Request DTOs for application CRUD do not accept event collections.

One endpoint is added:

```text
POST /api/applications/{applicationId}/events
```

Example:

```json
{
  "type": "InterviewScheduled",
  "occurredAt": "2026-09-16T09:00:00Z",
  "dueAt": "2026-09-25T11:00:00Z",
  "note": "First interview agreed with the recruiter"
}
```

`OccurredAt` is when the interview was arranged; `DueAt` is when it will take place.
OccurredAt is required and cannot be in the future. DueAt cannot precede OccurredAt;
it is required for interviews and optional for assignments/offers. Other event types
do not accept DueAt. Timestamps with offsets are normalized to UTC.

The endpoint returns `201` and the updated application aggregate. Invalid input
returns `400`; missing or other-user applications return `404`. Ownership is checked
through the parent application's `UserId`, using the validated Clerk subject.
All application/event endpoints require authentication; invalid or missing tokens
return `401`. Derived reminders share this ownership boundary and the frontend's
per-session query cache. See [authentication setup](../api/README.md#clerk-configuration).

Recording ApplicationSent, InterviewScheduled, AssignmentReceived or OfferReceived
also sets the corresponding current application status. Status changes are recorded
automatically, in the same SaveChanges transaction. FollowUpSent is supported in
Applied, and AssignmentSubmitted in Assignment. Historical events are retained when
the current status changes. Creating directly in a status does not invent a prior transition.

Details has a **Record activity** dialog using the existing MUI design. Its local
datetime inputs are converted to UTC. Successful saves update and invalidate list
and detail caches; failed saves preserve inputs and display the error.
Timeline renders persisted events only, never guessed events from the current status.

## Applied date compatibility

There is one ApplicationSent event per application. Recording it explicitly sets
AppliedDate. An existing AppliedDate on create also produces the sent event.

Editing AppliedDate corrects that event's occurrence date, preserving its ID and
other events. Clearing AppliedDate removes that sent fact; follow-up events remain.
This is a correction of editable data, not an immutable audit log. A second explicit
ApplicationSent POST is rejected; use Edit to correct the date. Repeated application
submissions and general event editing/deletion are outside this slice.

Date-only AppliedDate values use midnight UTC as a storage convention. No exact
sending time is inferred. An explicitly recorded time stays intact unless the date
is subsequently corrected through the date-only field.

## Derived rules

| Status | Next Action / Schedule |
| --- | --- |
| Draft | Finish application. |
| ToApply | Apply; use JobApplication.Deadline when known. |
| Applied | Latest non-future ApplicationSent, FollowUpSent or ContactReceived by OccurredAt. Before 14 full days: wait. Days 14–29: follow up only with a valid contact email and no NotAvailable/NotNeeded preference; otherwise wait. From day 30: Review status. |
| Applied with no contact event | Add application activity/details. Do not fall back to CreatedAt or UpdatedAt. |
| Interviewing | Future interview: Prepare interview. Past interview: Wait for interview feedback. A reply after the interview: Review recruiter reply. Missing time: Add interview details. |
| Assignment | Submit by the explicit assignment deadline; otherwise ask for a deadline. After AssignmentSubmitted: wait for feedback and remove the submission reminder. |
| Offer | Respond by the explicit response deadline; otherwise review offer. |
| Rejected / Ghosted / Withdrawn | No action and no automatically derived reminders. |

Follow-up suggestions use the response anchor +14 full 24-hour periods when contactable.
Otherwise the next suggestion is a status review at +30 days. At day 30 the review
replaces the follow-up, so there is only one response suggestion per application.
Both FollowUpSent and ContactReceived reset the clock; metadata and status events do not.
ContactReceived requires an explicit OccurredAt, accepts no DueAt, and never changes status.
Mark as ghosted uses the normal authorized application PUT. Keep active performs no write
and leaves future review prompts visible; it does not snooze or invent contact history.

Schedule separates hard-date commitments from suggested attention. Suggestions are
labeled as suggestions, never overdue deadlines. Dashboard's overdue/today/upcoming
counts cover hard dates only. Schedule entries link to the application.

Interview/assignment/offer dates come only from their corresponding stage events.
JobApplication.Deadline is shown for Draft and ToApply, then retired when submission
is no longer pending. It never substitutes for a later-stage deadline.

When a status is left and entered again, events recorded before the latest entry
are historical and do not reactivate the old stage's reminders. Within that stage,
the latest relevant occurrence wins, with recording time breaking ties. Recording
another scheduled/received event can update that stage's date while retaining history.
Schedule groups timestamp-based dates by the browser's local calendar day; date-only
application deadlines retain their entered day. Past interviews leave Schedule;
Next Action waits for feedback until a newer interview, reply or phase resolves it.

## Application contact preferences (2026-10-02)

ApplicationMethod: Unknown, CompanyPortal, Email, RecruiterDirect, LinkedInEasyApply, Other.
FollowUpMode: Unknown, Possible, NotAvailable, NotNeeded. Both default to Unknown.
ContactPerson is optional (maximum 200 characters). ContactEmail is optional (maximum
254 characters), with a non-whitespace local part, @, and a dotted domain. Both web
and API validate this format. Empty contact fields persist as null.
Only a valid email establishes a direct channel. A name or application method never
implies contactability. Possible still needs an email; Unknown with an explicit valid
email can receive follow-up suggestions. Unknown legacy records without one cannot.

Migration `20261002084434_ApplicationContactPreferences` adds these four columns with
Unknown/null defaults. It preserves owners, statuses, timestamps and historical events.
Run `dotnet ef database update` before using the updated API. No reminder table is added.

## Migration

`20260916123052_ApplicationWorkflow` creates ApplicationEvents, its parent/time index
and cascade foreign key. It backfills only ApplicationCreated from CreatedAt and
ApplicationSent from non-null AppliedDate. It does not infer interviews, follow-ups,
assignments, offers or prior status transitions. Existing statuses and fields survive.
For backfilled events, the technical event CreatedAt inherits the source record CreatedAt;
only OccurredAt describes the known historical fact. New events use their actual recording time.
The migration was applied to the local development database during implementation.

On another checkout, stop the API and run from `api/JobTracker.Api`:

```powershell
dotnet tool restore
dotnet ef database update
dotnet run
```

## UpdatedAt audit

- Removed from Next Action contact timing and ghosted risk.
- Removed from all synthetic Timeline status/activity generation.
- Removed from follow-up reminders and interview/assignment/offer date guesses.
- Schedule's active pipeline now orders by persisted workflow activity.
- Dashboard/Insights counters, chips and Needs attention filtering inherit the shared rules.
- Retained for Updated labels, Recently updated sorting and the recent-record list:
  these describe record edits, not workflow activity.
- Unused legacy mock/storage/CRUD files remain inactive; their types now include events.

## Verification and intentional limits

xUnit uses isolated in-memory SQLite databases and real migrations. Tests protect
CRUD, history retention, event validation, UTC conversion, status changes, ownership,
cascade deletion, date corrections and migration from the previous schema.
Vitest tests protect 14/30-day boundaries, follow-up resets, metadata independence,
missing/explicit dates, stage re-entry, submitted assignments and persisted Timeline.
React Testing Library verifies activity saving, shared cache refresh and failed saves.

Manual review points: date-only midnight convention; AppliedDate corrections are not
immutable audit history; no individual event correction/cancellation UI; no reminder
completion; no interview completion or accepted-offer status; no concurrent-editor
conflict handling. These are explicit scope limits, not guessed workflow behavior.

Historical workflow-slice validation on 2026-09-16: backend 37 tests passed, frontend 47 tests passed,
.NET build and frontend build/lint passed. The existing Vite bundle-size warning
remains. Browser verification covered API loading, follow-up recording and Next
Action refresh, persisted Timeline, and an explicit interview displayed on Schedule.
Native datetime-picker interaction still needs a manual check because the browser
automation fill operation failed; component tests cover input state and UTC conversion.

Historical full-suite validation on 2026-09-17: backend 57 tests and frontend 61 tests
passed, with both builds and frontend lint passing. The authenticated browser checks
and remaining acceptance limits are summarized in [the project README](../README.md).
For current automated results, see [release preparation](current-feature.md#release-preparation-2026-10-03).
