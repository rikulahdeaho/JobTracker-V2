# Current Feature

## Feature Name

Web UX Polish and Local Persistence

## Status

In Progress

## Scope

Work only inside `web/`.

## Goals

- Persist local job applications to localStorage
- Keep mock data as initial seed data only
- Add search for applications
- Add status filter
- Add next action / needs follow-up filter
- Add sorting for applied date, deadline and updated date
- Improve Applications page layout
- Improve Application Details page layout
- Add better empty states
- Add delete confirmation if not already present
- Add small MUI polish without over-engineering the design

## Not Included

- API integration
- Authentication
- Database
- TanStack Query
- Backend code
- Timeline
- Reminders
- Deployment
- Mobile app
- Major redesign

## UX Requirements

- Applications should persist after page refresh
- Search should work by company name and job title
- Filtering should work by status
- Sorting should work at least by newest updated, applied date and deadline
- Empty state should be shown when no applications match search/filter
- Details page should be easier to scan
- UI should remain simple and clean

## Validation

- `npm run build` passes
- App runs locally
- Applications persist after refresh
- Search works
- Status filter works
- Sorting works
- Empty state appears when no results match
- Details page still works
- Add/edit/delete still work
- No API/auth/database code was added

## History

- Completed Web App Mock Data Foundation
- Completed Web CRUD Flow with Local State
- Completed Next Action Logic in Frontend
- Started Web UX Polish and Local Persistence