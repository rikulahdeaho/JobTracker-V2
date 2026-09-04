# Current Feature

## Feature Name

Web Accessibility and Typography Pass

## Status

Completed

## Scope

Work only inside `web/`.

## Goals

- Improve overall text readability across the React + MUI prototype
- Define explicit typography sizes in the MUI theme
- Make small text easier to read in both light and dark mode
- Improve contrast for secondary and muted text
- Reduce overuse of caption-sized text
- Improve metric card readability
- Improve Dashboard, Applications, Details, Schedule, Insights and Settings text hierarchy
- Keep the current visual layout and product direction

## Not Included

- API integration
- Authentication
- Database
- TanStack Query
- Backend code
- Major redesign
- New business features
- New pages
- Chart libraries
- Deployment
- Mobile app

## Typography Requirements

Use an explicit dashboard-friendly typography scale.

Recommended scale:

- Page title: 30–32px
- Section title: 18–20px
- Card title: 16–18px
- Body text: 15–16px
- Secondary text: 14–15px
- Caption/meta text: 12–13px only when appropriate
- Button text: 14px
- Chip text: 12–13px

Avoid using very small text for important information.

## Contrast Requirements

Light mode:

- Primary text should be very readable
- Secondary text should be darker than before
- Muted text should still be readable
- Borders should remain subtle but visible

Dark mode:

- Primary text should remain clear
- Secondary text should not be too dim
- Cards and borders should remain visually separated

## Page Requirements

### Dashboard

- Make metric labels and helper texts easier to read
- Make Priority Action text clearly readable
- Make Schedule Summary labels readable
- Make Next Actions descriptions readable
- Keep current Dashboard layout

### Applications

- Make card text, metadata and filters readable
- Keep search, filters, sorting and CRUD working

### Application Details

- Make quick facts, notes, job description and timeline readable
- Keep edit/delete and timeline working

### Schedule

- Make reminder cards and date labels readable
- Keep grouped reminders working

### Insights

- Make metrics, descriptions and status breakdown readable
- Do not add chart libraries

### Settings

- Make settings labels, helper texts and placeholder text readable

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
- Text is easier to read without zooming
- Light mode remains clean and portfolio-friendly
- Dark mode remains usable
- Dashboard layout does not change significantly
- Applications page still works
- Application Details page still works
- Schedule still works
- Insights still works
- Settings still works
- Add/edit/delete still work
- No API/auth/database code was added

## History

- Completed Web App Mock Data Foundation
- Completed Web CRUD Flow with Local State
- Completed Next Action Logic in Frontend
- Completed Web UX Polish and Local Persistence
- Completed Mock Timeline and Reminders UI
- Completed Web Visual Alignment and Theme Polish
- Completed Dashboard Layout Balance Pass
- Started Web Accessibility and Typography Pass