# Current Feature

## Feature Name

Dashboard Information Hierarchy Cleanup

## Status

Completed

## Scope

Work only inside `web/`.

## Goals

- Reduce duplicated information on the Dashboard
- Make Dashboard feel like a focused overview page instead of another Schedule page
- Keep the top metric cards
- Replace Current Focus with a clearer single priority section
- Limit Next Actions to the most important 3–4 actions
- Replace the long Upcoming Reminders list with a compact summary
- Add a clear link or button to Schedule for full reminder details
- Add a small Pipeline Snapshot section if useful
- Keep the current visual style, theme and layout direction

## Not Included

- API integration
- Authentication
- Database
- TanStack Query
- Backend code
- New business features
- New reminder model
- New timeline model
- Calendar/email integrations
- Deployment
- Mobile app
- Major redesign

## Dashboard Purpose

The Dashboard should answer three questions:

- How is my job search going?
- What needs attention now?
- Where do I go for full schedule details?

It should not repeat all Schedule page information.

## Requirements

### Metrics

Keep the existing top metric cards:

- Total applications
- Active processes
- Interviews
- Offers
- Needs follow-up
- Ghosted risk

Small visual adjustments are allowed if needed.

### Priority Focus

Replace or simplify the current `Current Focus` section.

It should highlight only the single most important current priority, for example:

- Wolt needs follow-up
- Nitor deadline is today
- Reaktor interview prep is next
- Solita assignment deadline is close

Show a short explanation and a clear action.

### Next Actions

Keep the Next Actions section, but limit it to the top 3–4 actions.

It should not duplicate the full Schedule or Reminder list.

### Upcoming Reminders

Remove the long Upcoming Reminders list from Dashboard or replace it with a compact summary card.

Example:

- 3 reminders due this week
- 1 overdue
- Next: Nitor deadline today
- Button/link: View schedule

The full reminder/deadline list should stay on the Schedule page.

### Pipeline Snapshot

Add a small Pipeline Snapshot section if it fits naturally.

It can show a compact status distribution using existing local/mock data, for example:

- Applied
- Interviewing
- Assignment
- Offer
- Ghosted

Do not add chart libraries.

## Existing Functionality That Must Keep Working

- App navigation
- Light/dark mode toggle
- Theme persistence
- Applications list
- Application details
- Add application
- Edit application
- Delete application
- localStorage application persistence
- Search
- Filters
- Sorting
- Status chips
- Next Action logic
- Schedule reminder/deadline groups
- Insights metrics
- Timeline on details page

## Validation

- `npm run build` passes
- App runs locally
- Dashboard has less repeated information
- Dashboard has a clearer information hierarchy
- Schedule still shows full reminder/deadline groups
- Applications page still works
- Application Details page still works
- Add/edit/delete still work
- localStorage application persistence still works
- Search, filters and sorting still work
- Next Action logic still works
- Light mode still works
- Dark mode still works
- No API/auth/database code was added

## History

- Completed Web App Mock Data Foundation
- Completed Web CRUD Flow with Local State
- Completed Next Action Logic in Frontend
- Completed Web UX Polish and Local Persistence
- Completed Web UI Refinement Pass
- Completed Mock Timeline and Reminders UI
- Completed Web Visual Alignment and Theme Polish
- Started Dashboard Information Hierarchy Cleanup