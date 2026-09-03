# Current Feature

## Feature Name

Web MVP Layout Implementation

## Status

Completed

## Scope

Work only inside `web/`.

## Goals

- Implement the new MVP layout direction for the existing React + MUI prototype
- Align the UI with `docs/DESIGN.md`
- Make the app feel like a polished Career Co-pilot / Career Manager product
- Keep light mode and dark mode both usable
- Make light mode the best default for portfolio screenshots
- Improve Dashboard layout
- Improve Applications layout
- Improve Application Details layout
- Improve Schedule layout
- Improve Insights layout
- Improve Settings layout
- Keep all existing frontend functionality working

## Not Included

- API integration
- Authentication
- Database
- TanStack Query
- Backend code
- Real account/profile functionality
- Real contacts functionality
- Real global search beyond applications
- Real reminder completion
- Real calendar/email integrations
- Deployment
- Mobile app

## Design Direction

Use `docs/DESIGN.md` as the main design reference.

The UI should feel like:

- Professional
- Clear
- Calm
- Productive
- Career-focused
- Portfolio-ready

Do not copy screenshots pixel-perfectly. Use them as layout direction.

## Global Layout Requirements

- Use fixed sidebar / fluid content layout
- Use a max content width around 1280px where appropriate
- Keep sidebar width around 260px
- Keep spacing consistent
- Use MUI components
- Use tonal layering and low-contrast borders instead of heavy shadows
- Keep light and dark modes visually consistent
- Avoid flashy effects or decorative clutter

## Branding Requirements

Use:

- Product name: `JobTracker`
- Subtitle: `Career Co-pilot` or `Career Manager`

Prefer one subtitle consistently across the app.

## Dashboard Requirements

Dashboard should be a focused overview page.

It should include:

- Priority Action card
- Summary metric cards
- Next Actions card
- Compact Schedule summary
- Pipeline Snapshot

It should not duplicate the full Schedule page.

## Applications Requirements

Applications should be the main job application management page.

It should include:

- Page title and subtitle
- Add Application button
- Search applications
- Filters:
  - All
  - Active
  - Archived
  - Needs follow-up
- Application cards
- Status chips
- Next action / deadline / updated info
- Open details behavior

Keep existing search, filters, sorting, CRUD and localStorage behavior working.

## Application Details Requirements

Application Details should feel like a real workspace for one application.

It should include:

- Back to applications
- Job title and company
- Status chip
- Next action chip
- Edit button
- Delete button
- Prominent next action banner
- Description and notes section
- Quick facts card
- Open job ad button/link
- Timeline card

Keep existing edit/delete/timeline behavior working.

## Schedule Requirements

Schedule should answer:

- What is overdue?
- What should be handled today?
- What is upcoming?
- Which applications are active?

It should include:

- Overdue section
- Today section
- Upcoming deadlines/tasks section
- Active queue section

Do not implement real reminder completion or calendar integration.

## Insights Requirements

Insights should show simple local-only metrics.

It should include:

- Response Momentum
- Pipeline Pressure
- Data Coverage
- Status Breakdown

Do not add chart libraries. Use MUI cards, progress bars and simple visual indicators.

## Settings Requirements

Settings should feel intentional even without auth/backend.

It should include:

- Appearance section with theme toggle
- Tracking Preferences placeholders
  - Default follow-up days
  - Ghosted risk days
- Profile placeholder
- Data Management placeholder

Do not implement real account/auth features.

Optional:
- Reset local data only if it already fits the existing localStorage flow and can be implemented safely.

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
- Dashboard summary
- Schedule reminder/deadline groups
- Insights metrics
- Timeline on details page

## Validation

- `npm run build` passes
- App runs locally
- Light mode works
- Dark mode works
- Dashboard has the new focused layout
- Applications page still works
- Application Details page still works
- Schedule still works
- Insights still works
- Settings still works
- Add/edit/delete still work
- localStorage application persistence still works
- Search, filters and sorting still work
- Next Action logic still works
- Timeline still appears on details page
- No API/auth/database code was added

## History

- Completed Web App Mock Data Foundation
- Completed Web CRUD Flow with Local State
- Completed Next Action Logic in Frontend
- Completed Web UX Polish and Local Persistence
- Completed Web UI Refinement Pass
- Completed Mock Timeline and Reminders UI
- Completed Web Visual Alignment and Theme Polish
- Started Web MVP Layout Implementation