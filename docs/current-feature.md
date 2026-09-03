# Current Feature

## Feature Name

Dashboard Layout Balance Pass

## Status

Completed

## Scope

Work only inside `web/`.

## Goals

- Improve Dashboard layout hierarchy
- Make Dashboard feel like a focused job search command center
- Use the new dashboard reference image as visual direction
- Make Priority Action the strongest visual element
- Keep Schedule Summary compact
- Keep all 6 metric cards
- Make Pipeline Snapshot compact
- Keep Next Actions limited to top 3
- Reduce repeated information
- Keep light and dark mode working

## Not Included

- API integration
- Authentication
- Database
- TanStack Query
- Backend code
- New business logic
- Charts or chart libraries
- Real reminder completion
- Changes to Schedule, Insights, Applications or Details unless required by shared components

## Required Dashboard Layout Order

1. Page header
2. Priority Action + Schedule Summary
3. Metric cards row
4. Pipeline Snapshot + Next Actions

## Dashboard Sections

### Page Header

Show:

- Job search at a glance
- Short local-first dashboard subtitle
- Optional local storage status
- Optional New Application button if it already fits existing functionality

### Priority Action

Show the single highest-priority action.

It should include:

- Company
- Action title
- Short explanation
- Status chip
- Due date chip if available
- Open application button

### Schedule Summary

Show a compact reminder snapshot.

It should include:

- Overdue count
- Today count
- Upcoming count
- Next reminder
- View schedule button/link

### Metrics

Keep all 6 metrics:

- Total applications
- Active processes
- Interviews
- Offers
- Needs follow-up
- Ghosted risk

Metrics should be compact, aligned and visually secondary to Priority Action.

### Pipeline Snapshot

Show a compact health check.

It can include:

- Active count
- Closed count
- Compact active funnel:
  - Applied
  - Interviewing
  - Assignment
  - Offer

Do not duplicate the full Insights page.

### Next Actions

Show only the top 3 actions.

Each action should include:

- Company
- Action
- Short explanation
- Due date if available
- Status chip

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
- Dashboard has the new layout order
- Dashboard feels less repetitive
- Priority Action is visually strongest
- Schedule remains the detailed reminder/deadline page
- Insights remains the deeper metrics page
- Applications page still works
- Application Details page still works
- Schedule still works
- Insights still works
- Settings still works
- Light mode works
- Dark mode works
- No API/auth/database code was added

## History

- Completed Web App Mock Data Foundation
- Completed Web CRUD Flow with Local State
- Completed Next Action Logic in Frontend
- Completed Web UX Polish and Local Persistence
- Completed Mock Timeline and Reminders UI
- Completed Web Visual Alignment and Theme Polish
- Started Dashboard Layout Balance Pass