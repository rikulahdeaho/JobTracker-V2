# Current Feature

## Feature Name

Mock Timeline and Reminders UI

## Status

In Progress

## Scope

Work only inside `web/`.

## Goals

- Add frontend-only timeline UI for job applications
- Add mock timeline events for applications
- Show timeline on Application Details page
- Add frontend-only reminders UI
- Add mock reminders based on application deadlines and follow-ups
- Improve Schedule page with reminder groups
- Show upcoming reminders on Dashboard if it fits naturally
- Keep everything local/mock-data only for now

## Not Included

- API integration
- Authentication
- Database
- TanStack Query
- Backend code
- Real notifications
- Calendar integration
- Email integration
- Deployment
- Mobile app

## Timeline Requirements

- Create a TimelineEvent type
- Create mock timeline events
- Show timeline events on Application Details page
- Timeline should include events like:
  - Application created
  - Application sent
  - Status changed
  - Follow-up planned
  - Interview scheduled
  - Assignment received
  - Rejected
  - Offer received

## Reminder Requirements

- Create a Reminder type
- Create mock reminders from local/mock data
- Show reminders on Schedule page
- Group reminders by:
  - Overdue
  - Today
  - Upcoming
- Reminders should include examples like:
  - Follow up
  - Prepare interview
  - Submit assignment
  - Check deadline
  - Respond to offer

## UI Requirements

- Use MUI components
- Keep the UI simple and clean
- Reuse existing application data where possible
- Do not over-engineer state management
- Do not implement real recurring reminders or notifications
- Keep existing CRUD, localStorage, search, filters, sorting and Next Action logic working

## Validation

- `npm run build` passes
- App runs locally
- Application Details page shows timeline
- Schedule page shows reminder groups
- Dashboard still works
- Applications page still works
- Add/edit/delete still work
- localStorage persistence still works
- No API/auth/database code was added

## History

- Completed Web App Mock Data Foundation
- Completed Web CRUD Flow with Local State
- Completed Next Action Logic in Frontend
- Completed Web UX Polish and Local Persistence
- Completed Web UI Refinement Pass
- Started Mock Timeline and Reminders UI