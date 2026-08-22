# Current Feature

## Feature Name

Web Visual Alignment and Theme Polish

## Status

In Progress

## Scope

Work only inside `web/`.

## Goals

- Make the current React + MUI prototype feel more like a polished MVP
- Improve the MUI theme for both light and dark mode
- Make light mode and dark mode both usable and visually consistent
- Improve color palette, typography, spacing, cards and layout rhythm
- Align Dashboard, Applications, Application Details, Schedule, Insights and Settings visually
- Improve status chips and action chips across light and dark mode
- Create reusable UI/layout components where useful
- Keep the current frontend-only/local-data architecture
- Keep all existing functionality working

## Not Included

- API integration
- Authentication
- Database
- TanStack Query
- Backend code
- New business features
- Real reminders model
- Real timeline model
- Calendar/email integrations
- Deployment
- Mobile app
- Full redesign from scratch

## Visual Direction

The UI should feel like a clean productivity / career manager SaaS app.

Light mode should be the best default for portfolio screenshots.  
Dark mode should also be usable, readable and visually consistent.

Use the existing layout ideas as direction, but do not try to copy screenshots pixel-perfectly.

## Theme Requirements

- Use MUI ThemeProvider and CssBaseline
- Keep the existing light/dark mode toggle working
- Persist selected theme mode to localStorage
- Improve palette tokens for:
  - background
  - paper/card surfaces
  - elevated surfaces
  - text primary
  - text secondary
  - borders
  - primary action
  - success
  - warning
  - error
- Make status chips readable in both light and dark mode
- Make action chips readable in both light and dark mode
- Avoid excessive shadows, gradients or visual noise

## Suggested Palette Direction

Primary:

- `#0B6BCB` or `#2563EB`

Secondary:

- `#7C3AED`

Success:

- `#16A34A`

Warning:

- `#D97706`

Error:

- `#DC2626`

Light mode:

- Background: `#F5F7FB`
- Surface: `#FFFFFF`
- Muted surface: `#EEF2F8`
- Text primary: `#111827`
- Text secondary: `#4B5563`
- Border: `#D8DEE9`

Dark mode:

- Background: `#0B1120`
- Surface: `#111827`
- Muted surface: `#1E293B`
- Text primary: `#E5E7EB`
- Text secondary: `#94A3B8`
- Border: `#334155`

## Layout Requirements

- Use consistent page max-width where appropriate
- Prevent pages from stretching too much on ultra-wide screens
- Keep sidebar and topbar visually consistent
- Make page headers consistent
- Make cards and sections use consistent padding, radius and borders
- Make empty states consistent
- Keep responsive behavior reasonable

## Page Requirements

### Dashboard

- Keep existing summary metrics
- Keep Current Focus
- Keep Next Actions
- Keep Upcoming Reminders
- Improve spacing, hierarchy and card consistency
- Use local/mock data only

### Applications

- Keep search, filters and sorting working
- Keep application cards working
- Keep add/edit/delete working
- Improve spacing and card hierarchy only if needed
- Do not rewrite the whole page unnecessarily

### Application Details

- Keep edit/delete working
- Keep timeline visible
- Make the page easier to scan
- Keep title/header, next action, quick facts, notes, job description and timeline
- Improve spacing and visual grouping

### Schedule

- Keep reminder/deadline groups
- Keep Overdue, Today, Upcoming and Active Queue sections
- Improve layout consistency with the rest of the app
- Use local/mock data only

### Insights

- Keep local/mock metrics
- Keep Response Momentum, Pipeline Pressure, Coverage and Status Breakdown
- Improve visual consistency and readability
- Do not add advanced analytics or chart libraries

### Settings

- Keep it as a simple prototype settings screen
- Include simple placeholder sections if useful:
  - Appearance
  - Profile placeholder
  - Preferences placeholder
  - Data management placeholder
- Do not implement real account/auth features

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
- Schedule reminders/deadlines
- Insights metrics
- Timeline on details page

## Validation

- `npm run build` passes
- App runs locally
- Light mode works
- Dark mode works
- Theme selection persists after refresh
- Dashboard still works
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
- Reminder/deadline groups still appear on Schedule
- No API/auth/database code was added

## History

- Completed Web App Mock Data Foundation
- Completed Web CRUD Flow with Local State
- Completed Next Action Logic in Frontend
- Completed Web UX Polish and Local Persistence
- Completed Web UI Refinement Pass
- Completed Mock Timeline and Reminders UI
- Started Web Visual Alignment and Theme Polish