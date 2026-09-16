# Current Feature

## Feature Name

Application Workflow Model

## Status

Completed

## Scope

Design and implement a more reliable application workflow model.

Work mainly inside:

- `api/`
- `web/`
- `docs/`

Do not implement authentication yet.

Do not deploy anything.

## Goal

Improve the JobTracker domain model so that:

- Next Action is based on meaningful workflow events instead of generic record updates
- Timeline can represent real application history
- Schedule can use real dates and reminders instead of guessed dates
- technical `updatedAt` changes do not reset follow-up timing
- future authentication can be added on top of a stable domain model

The current implementation uses `updatedAt` as the main fallback for follow-up and ghosted calculations.

This causes unrelated edits, such as changing Notes, Salary Range, or Job Description, to affect workflow timing.

This feature should separate:

```text
technical record updates
```

from:

```text
actual job application activity
```

---

## Current Problems

### 1. `updatedAt` is not workflow activity

`updatedAt` currently changes whenever the JobApplication entity is edited.

This includes edits such as:

```text
Notes changed
Salary changed
Job description changed
Source changed
```

These should not automatically restart follow-up timing.

### 2. Timeline is derived instead of persisted

The current Timeline is reconstructed from:

```text
createdAt
appliedDate
status
updatedAt
```

It does not preserve previous state transitions or communication history.

For example, the application cannot currently represent:

```text
Applied
→ Follow-up sent
→ Interview scheduled
→ Interview completed
→ Assignment received
```

as real persisted events.

### 3. Schedule uses estimated dates

Some current reminders are based on guessed dates such as:

```text
updatedAt + 2 days
updatedAt + 3 days
```

These are useful for a prototype but should not become the long-term workflow model.

Important events should use real dates when known.

---

## Target Domain Model

The target workflow should contain three concepts:

```text
JobApplication
ApplicationEvent
Reminder
```

### JobApplication

JobApplication remains the main aggregate containing current application state.

It should continue to contain fields such as:

```text
Id
UserId
CompanyName
JobTitle
JobUrl
Location
Source
Status
AppliedDate
Deadline
SalaryRange
Notes
JobDescription
CreatedAt
UpdatedAt
```

`UpdatedAt` remains a technical record timestamp.

Do not use `UpdatedAt` as the primary workflow activity timestamp after this feature.

---

## ApplicationEvent

Add a persisted timeline/event model.

Suggested entity:

```text
ApplicationEvent
```

Suggested fields:

```text
Id
ApplicationId
Type
OccurredAt
Note
CreatedAt
```

Possible event types:

```text
ApplicationCreated
ApplicationSent
StatusChanged
FollowUpSent
InterviewScheduled
InterviewCompleted
AssignmentReceived
AssignmentSubmitted
OfferReceived
NoteAdded
```

Do not add every possible event type unless needed.

Start with a small set that supports the current application workflow.

### Event Principles

Events represent meaningful workflow activity.

Examples:

```text
Application sent
Follow-up sent
Interview scheduled
Assignment received
Offer received
Status changed
```

Events should not be created for every technical database update.

For example:

```text
Changing Salary Range
Changing Source
Editing Job Description
```

should normally not create workflow events.

---

## Timeline

Application Details should eventually display persisted `ApplicationEvent` records.

Timeline should be ordered by:

```text
OccurredAt descending
```

or another clearly documented order.

Timeline should no longer be reconstructed only from the current state of JobApplication.

The system should retain historical events even after the current application status changes.

Example:

```text
Sep 20
Interview scheduled

Sep 16
Follow-up sent

Sep 01
Application sent

Aug 30
Application created
```

---

## Reminder Model

Add a Reminder model only if required for the workflow implementation.

Suggested fields:

```text
Id
ApplicationId
Type
Title
DueAt
CompletedAt
CreatedAt
```

Possible types:

```text
FollowUp
ApplicationDeadline
Interview
AssignmentDeadline
OfferResponse
Custom
```

Keep the first implementation small.

A reminder should represent something the user may need to act on.

Do not automatically create arbitrary dates when no real date exists.

---

## Schedule Rules

Schedule should prefer explicit dates.

Examples:

### Application deadline

Use:

```text
JobApplication.Deadline
```

### Interview

Use an explicit interview date from an event or reminder.

Do not automatically assume:

```text
updatedAt + 2 days
```

### Assignment

Use the real assignment deadline when known.

Do not automatically assume:

```text
updatedAt + 3 days
```

### Offer response

Use a real response deadline when known.

### Follow-up

Follow-up may still be derived from workflow activity if no explicit reminder exists.

For example:

```text
ApplicationSent + follow-up threshold
```

or:

```text
FollowUpSent + next waiting period
```

The exact rule should be documented.

---

## Next Action

Next Action should remain a derived value.

Do not persist a `NextAction` string directly in the database during this feature unless a strong reason appears.

The system should calculate the recommended action from:

```text
Current application status
Relevant workflow events
Deadlines
Reminders
```

instead of generic `UpdatedAt`.

---

## Proposed Next Action Rules

### Draft

```text
Finish application
```

### ToApply

If a deadline exists:

```text
Apply before deadline
```

Otherwise:

```text
Apply
```

### Applied

Use the latest relevant activity.

Relevant events include:

```text
ApplicationSent
FollowUpSent
```

Do not use generic record updates.

Possible behavior:

```text
recently sent
→ Wait for response

follow-up threshold reached
→ Follow up

follow-up already sent recently
→ Wait for response

long silence after latest relevant contact
→ Consider ghosted
```

### Interviewing

If an interview date exists:

```text
Prepare for interview
```

If no interview details exist:

```text
Add interview details
```

or:

```text
Follow up
```

depending on workflow context.

### Assignment

If a deadline exists:

```text
Submit assignment
```

Otherwise:

```text
Add assignment deadline
```

### Offer

If a response deadline exists:

```text
Respond to offer
```

Otherwise:

```text
Review offer
```

### Closed States

For:

```text
Rejected
Ghosted
Withdrawn
```

use:

```text
No action
```

unless there is an explicit incomplete reminder.

---

## Follow-Up Rules

Do not use `JobApplication.UpdatedAt` as the main follow-up timer.

Use the most recent relevant workflow event.

Example:

```text
ApplicationSent
    ↓
14 days
    ↓
Follow up
```

After:

```text
FollowUpSent
```

the waiting period should restart from that event.

Editing Notes should not affect this timer.

---

## Ghosted Risk

Ghosted risk should be based on meaningful communication history.

Do not define Ghosted Risk as simply:

```text
updatedAt >= 30 days ago
```

Prefer logic based on the last meaningful activity such as:

```text
ApplicationSent
FollowUpSent
InterviewCompleted
```

A user editing the record must not reset or trigger ghosted risk.

Do not automatically change the application status to `Ghosted`.

The user should remain in control of status changes.

---

## Backend

Add only the backend pieces needed for the new workflow.

Possible additions:

```text
ApplicationEvent entity
ApplicationEventType enum
Reminder entity
ReminderType enum
DbSet<ApplicationEvent>
DbSet<Reminder>
EF Core migration
```

Do not create unnecessary service layers unless they provide clear value.

Keep the existing Applications CRUD working.

---

## API

Add endpoints only when required by the frontend workflow.

Possible event endpoints:

```text
GET  /api/applications/{applicationId}/events
POST /api/applications/{applicationId}/events
```

Possible reminder endpoints:

```text
GET    /api/applications/{applicationId}/reminders
POST   /api/applications/{applicationId}/reminders
PUT    /api/reminders/{id}
DELETE /api/reminders/{id}
```

Do not implement all endpoints automatically.

Prefer the smallest API that supports the current UI.

---

## Frontend

Update the frontend so that:

- Timeline can use persisted events
- Next Action uses meaningful activity
- Schedule uses real dates when available
- unrelated application edits do not affect follow-up timing

Preserve the current visual design where possible.

Do not redesign the entire Application Details or Schedule page.

---

## Migration Strategy

Existing applications do not have historical event data.

Do not fabricate a detailed fake history.

If useful, create only minimal initial events from existing reliable fields.

For example:

```text
ApplicationCreated from CreatedAt
ApplicationSent from AppliedDate if it exists
```

Do not infer interviews, follow-ups, assignments, or offers that are not actually known.

Document any migration behavior clearly.

---

## Tests

Update automated tests for the workflow model.

### Backend

Add tests for:

- creating application events
- retrieving application events
- events belonging to the correct application
- meaningful timestamps
- reminder persistence if Reminder is implemented
- application CRUD still working

### Frontend

Add tests for Next Action rules.

Important cases:

```text
Draft → Finish application
ToApply → Apply
Applied recently → Wait for response
Applied after follow-up threshold → Follow up
Follow-up sent → Wait again
Long silence → Consider ghosted
Interviewing with date → Prepare for interview
Assignment with deadline → Submit assignment
Offer → Respond to offer
Closed status → No action
```

Also test:

- editing unrelated application fields does not change workflow activity
- latest relevant event controls follow-up timing
- explicit deadlines are preferred over generated dates

Do not aim for maximum coverage.

Test the business rules that would be easy to break.

---

## Not Included

Do not implement during this feature:

- Clerk authentication
- JWT authentication
- production users
- deployment
- PostgreSQL / Neon
- push notifications
- email notifications
- mobile integration
- AI suggestions
- job scraping
- browser extension
- calendar integrations

---

## Definition of Done

This feature is complete when:

- `updatedAt` is no longer the primary follow-up timer
- meaningful application activity can be represented explicitly
- Timeline can represent real persisted history
- Next Action uses relevant workflow activity
- Notes or other unrelated edits do not reset follow-up timing
- Schedule prefers real deadlines/dates
- Ghosted risk uses meaningful activity
- application status is not automatically changed to Ghosted
- existing Applications CRUD still works
- frontend build passes
- backend build passes
- automated tests pass
- workflow rules are documented

---

## Validation

Backend:

```powershell
cd api
dotnet test
dotnet build
```

Frontend:

```powershell
cd web
npm run test
npm run build
npm run lint
```

---

## Expected Result

The workflow should move from:

```text
Application status
      +
updatedAt
      ↓
Next Action / Timeline / Schedule
```

toward:

```text
JobApplication
      +
ApplicationEvent history
      +
real deadlines/reminders
      ↓
Next Action
Timeline
Schedule
Ghosted risk
```

`updatedAt` remains useful as technical metadata but no longer represents user workflow activity.


---

## History

- Completed Web App Mock Data Foundation
- Completed Web CRUD Flow with Local State
- Completed Frontend Applications API Integration
- Completed Applications automated test layer
- Started Application Workflow Model
## Implementation result — 2026-09-16

- Persisted ApplicationEvent model and ApplicationWorkflow migration implemented.
- Application responses include events; one POST activity endpoint added.
- Details records activity and displays persisted history through the existing Query cache.
- Next Action and Schedule no longer use application UpdatedAt as workflow activity.
- No separate Reminder table: explicit event dates and contact history are sufficient for this slice.
- Migration applied locally; only known creation and applied-date facts backfilled.
- Validation: dotnet test 37 passed; dotnet build passed with no warnings/errors;
  npm run test 47 passed; npm run build passed; npm run lint passed.
- Vite retains its bundle-size warning (approximately 767 kB main chunk).
- Browser verified API-backed loading, follow-up recording/history/Next Action and
  Schedule display of an API-recorded interview. Temporary test data removed.
- Manual check remains for the native datetime picker: browser automation could
  not fill it. RTL tests verify date input state and local-to-UTC request conversion.
- See [workflow decisions and remaining limits](application-workflow.md).
