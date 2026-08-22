# Current Feature

## Feature Name

Web Theme and Dark Mode Refinement

## Status

Completed

## Scope

Work only inside `web/`.

## Goals

- Improve the MUI theme
- Add light/dark mode support
- Add theme toggle in the UI
- Persist selected theme mode to localStorage
- Improve the app color palette
- Improve status chip colors
- Improve card, page and layout consistency
- Improve typography and spacing rhythm
- Make the UI feel clearer and more portfolio-ready

## Not Included

- API integration
- Authentication
- Database
- TanStack Query
- Backend code
- Timeline
- Reminders
- Calendar/email integrations
- Deployment
- Mobile app
- Major redesign

## Theme Requirements

- Use MUI ThemeProvider
- Use CssBaseline
- Support light mode and dark mode
- Store selected theme mode in localStorage
- Add a visible theme toggle, preferably in the Topbar or Settings page
- Keep the theme implementation simple and understandable
- Do not add another UI library

## Palette Direction

Use a calm productivity/dashboard palette.

Suggested colors:

- Primary: `#2563EB`
- Secondary: `#7C3AED`
- Success: `#16A34A`
- Warning: `#D97706`
- Error: `#DC2626`

Light mode:

- Background: `#F8FAFC`
- Paper: `#FFFFFF`
- Text primary: `#0F172A`
- Text secondary: `#64748B`
- Border: `#E2E8F0`

Dark mode:

- Background: `#0B1120`
- Paper: `#111827`
- Elevated paper: `#1E293B`
- Text primary: `#E5E7EB`
- Text secondary: `#94A3B8`
- Border: `#334155`

## UI Requirements

- Keep the existing layout and features working
- Make cards, headers and page sections visually consistent
- Improve Dashboard readability
- Improve Applications card styling
- Improve Application Details readability
- Improve Schedule, Insights and Settings visual consistency
- Make status chips readable in both light and dark mode
- Avoid excessive visual effects
- Prefer clean spacing, contrast and hierarchy

## Validation

- `npm run build` passes
- App runs locally
- Light mode works
- Dark mode works
- Theme selection persists after refresh
- Applications page still works
- Application Details page still works
- Dashboard still works
- Schedule, Insights and Settings still work
- Add/edit/delete still work
- localStorage application persistence still works
- Search, filters and sorting still work
- Next Action logic still works
- No API/auth/database code was added

## History

- Completed Web App Mock Data Foundation
- Completed Web CRUD Flow with Local State
- Completed Next Action Logic in Frontend
- Completed Web UX Polish and Local Persistence
- Completed Web UI Refinement Pass
- Started Web Theme and Dark Mode Refinement