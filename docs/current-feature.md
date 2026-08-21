# Current Feature

## Feature Name

Web UI Refinement Pass

## Status

Completed

## Scope

Work only inside `web/`.

## Goals

- Improve the overall visual quality of the existing React + MUI prototype
- Add consistent page width, spacing and layout rhythm
- Improve Dashboard layout so it does not stretch too much on wide screens
- Improve Application Details page so it feels like a real product page
- Improve Schedule page using existing local/mock application data
- Improve Insights page using existing local/mock application data
- Improve Settings page as a simple prototype settings screen
- Create reusable UI/page components if helpful
- Keep the app local/mock-data only for now

## Not Included

- API integration
- Authentication
- Database
- TanStack Query
- Backend code
- Real reminders model
- Timeline model
- Calendar/email integrations
- Deployment
- Mobile app
- Major redesign

## UI Requirements

- Use MUI components consistently
- Keep the design clean, simple and portfolio-friendly
- Avoid over-engineering the theme
- Prefer better spacing and hierarchy over heavy visual effects
- Keep Applications CRUD working
- Keep localStorage persistence working
- Keep search, filters and sorting working
- Keep Next Action logic working

## Page Requirements

### Dashboard

- Add better max-width / content layout
- Make summary cards easier to scan
- Make Current Focus and Next Actions feel more balanced
- Avoid excessive empty horizontal space on wide screens

### Applications

- Keep current search, filters, sorting and cards
- Make small spacing / hierarchy improvements only
- Do not rewrite the whole page unless necessary

### Application Details

- Make the details page easier to scan
- Group information into sections
- Show status and next action clearly
- Keep edit/delete flows working

### Schedule

- Use local/mock data to show upcoming deadlines and actions
- Group items in a cleaner way if possible
- Keep it frontend-only

### Insights

- Add simple local/mock metrics
- Show basic status distribution or pipeline summary
- Keep it simple

### Settings

- Add simple placeholder setting sections
- Example sections:
  - Profile placeholder
  - Preferences placeholder
  - Data management placeholder
- Do not implement real auth or account features

## Validation

- `npm run build` passes
- App runs locally
- Dashboard looks better on wide screens
- Applications page still works
- Application details page still works
- Add/edit/delete still work
- localStorage persistence still works
- Search, filters and sorting still work
- Schedule is no longer just a plain placeholder
- Insights is no longer just a plain placeholder
- Settings is no longer just a plain placeholder
- No API/auth/database code was added

## History

- Completed Web App Mock Data Foundation
- Completed Web CRUD Flow with Local State
- Completed Next Action Logic in Frontend
- Completed Web UX Polish and Local Persistence
- Started Web UI Refinement Pass