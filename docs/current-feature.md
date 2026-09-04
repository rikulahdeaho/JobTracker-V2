# Current Feature

## Feature Name

Web MVP Usability Polish Pass

## Status

Completed

## Scope

Work only inside `web/`.

## Goals

- Improve readability of small text across the app
- Make typography and spacing more consistent
- Make page content width and alignment consistent
- Improve sidebar readability
- Clarify topbar/search behavior
- Improve Schedule visual hierarchy
- Improve Insights Data Coverage section
- Make Settings placeholders more honest and intentional
- Keep the current layout and visual direction
- Keep all existing frontend functionality working

## Not Included

- API integration
- Authentication
- Database
- TanStack Query
- Backend code
- New business features
- Chart libraries
- Mobile app
- Deployment
- Major redesign

## Page Focus

### Dashboard

Keep the current focused dashboard layout. Only make small readability and spacing improvements if needed.

### Applications

Keep CRUD, search, filters, sorting and application cards working.

### Application Details

Keep the current workspace layout, edit/delete, quick facts, next action and timeline working.

### Schedule

Make Overdue, Today, Upcoming and Active Queue easier to scan. Keep it mock-data only.

### Insights

Improve Data Coverage so it feels intentional and not empty. Use simple rows or progress bars, not chart libraries.

### Settings

Make prototype-only settings clear. Keep Appearance/theme toggle working. Do not implement real auth/account/export/import features.

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
- Text is easier to read without browser zoom
- Pages feel consistently aligned
- Schedule hierarchy is clearer
- Insights Data Coverage looks intentional
- Settings placeholders are honest
- Dashboard still works
- Applications still work
- Details still work
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
- Completed Dashboard Layout Balance Pass
- Started Web MVP Usability Polish Pass