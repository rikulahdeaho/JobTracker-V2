# Current Feature

## Feature Name

Next Action Logic in Frontend

## Status

In Progress

## Scope

Work only inside `web/`.

## Goals

- Create Next Action helper for job applications
- Show Next Action in Applications list
- Show Next Action on Application Details page
- Add Needs Follow-up logic
- Add Ghosted logic
- Add simple dashboard summary from local/mock data

## Not Included

- API integration
- Authentication
- Database
- TanStack Query
- Backend code
- Deployment
- Mobile app
- Final UI polish

## Example Rules

- Draft → Finish application
- ToApply → Apply
- Applied + 14 days without activity → Follow up
- Applied + 30 days without activity → Consider ghosted
- Interviewing → Prepare interview
- Assignment → Submit assignment
- Offer → Respond to offer
- Rejected → No action
- Ghosted → No action
- Withdrawn → No action

## Validation

- `npm run build` passes
- App runs locally
- Applications list shows next action for each application
- Details page shows next action
- Dashboard shows basic summary from local data
- No API/auth/database code was added

## History

- Completed Web App Mock Data Foundation
- Completed Web CRUD Flow with Local State
- Started Next Action Logic in Frontend