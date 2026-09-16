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
`FollowUpSent`, `InterviewScheduled`, `AssignmentReceived`, `AssignmentSubmitted`
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
through the parent application using `dev-user`. There is no authentication yet.

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
| Applied | Use the latest non-future ApplicationSent or FollowUpSent by OccurredAt. Before 14 full days: wait; from 14 days: follow up; from 30 days: consider ghosted. |
| Applied with no contact event | Ask for the application sent date. Do not fall back to CreatedAt or UpdatedAt. |
| Interviewing | Prepare interview if an explicit interview date exists; otherwise ask for interview details. |
| Assignment | Submit by the explicit assignment deadline; otherwise ask for a deadline. After AssignmentSubmitted: wait for feedback and remove the submission reminder. |
| Offer | Respond by the explicit response deadline; otherwise review offer. |
| Rejected / Ghosted / Withdrawn | No action and no automatically derived reminders. |

Follow-up reminders are due 14 full 24-hour periods after the latest contact and
appear before they become overdue too. Follow-up resets the waiting period; metadata
and status events do not. Ghosted is a recommendation, never an automatic status change.

Interview/assignment/offer dates come only from their corresponding stage events.
JobApplication.Deadline remains a separate application deadline, not a substitute
for a later-stage deadline. No `updatedAt + 2/3 days` estimates remain.

When a status is left and entered again, events recorded before the latest entry
are historical and do not reactivate the old stage's reminders. Within that stage,
the latest relevant occurrence wins, with recording time breaking ties. Recording
another scheduled/received event can update that stage's date while retaining history.
Schedule groups timestamp-based dates by the browser's local calendar day; date-only
application deadlines retain their entered day. Past interviews remain overdue until
the user records a new step or changes status; completion is not implemented here.

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
- Dashboard/Insights counters, chips and Needs follow-up filtering inherit the new rules.
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

Validation on 2026-09-16: backend 37 tests passed, frontend 47 tests passed,
.NET build and frontend build/lint passed. The existing Vite bundle-size warning
remains. Browser verification covered API loading, follow-up recording and Next
Action refresh, persisted Timeline, and an explicit interview displayed on Schedule.
Native datetime-picker interaction still needs a manual check because the browser
automation fill operation failed; component tests cover input state and UTC conversion.
