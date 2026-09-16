# Current Feature

## Feature Name

Frontend Applications API Integration

## Status

Implemented and verified locally on 2026-09-16.

## Scope

Work mainly inside `web/`.

Minimal API changes are allowed only if required for integration.

Do not modify `mobile/`.

Do not implement authentication or deployment during this feature.

## Goals

- Connect React frontend to ASP.NET Core API
- Add TanStack Query for application server state
- Replace active localStorage/mock application data with API data
- Load Applications page from API
- Load Application Details from API
- Connect Add Application to API
- Connect Edit Application to API
- Connect Delete Application to API
- Add loading and error states
- Preserve the existing UI and user flows

## Data Flow

```text
React
  ↓
TanStack Query
  ↓
applicationsApi.ts
  ↓
ASP.NET Core API
  ↓
EF Core
  ↓
SQLite
```

The ASP.NET Core API becomes the source of truth for application data.

`localStorage` should no longer be the primary persistence mechanism for job applications after this feature.

It may still be used for client-only preferences such as theme selection.

## Existing Backend

The backend is expected to already provide:

- ASP.NET Core Web API
- Entity Framework Core
- SQLite database
- AppDbContext
- JobApplication entity
- ApplicationStatus enum
- Applications DTOs
- Swagger / OpenAPI
- Applications CRUD endpoints

Expected endpoints:

```text
GET    /api/applications
GET    /api/applications/{id}
POST   /api/applications
PUT    /api/applications/{id}
DELETE /api/applications/{id}
```

Authentication is not implemented yet.

The backend may continue using the temporary development user:

```text
dev-user
```

Do not implement Clerk during this feature.

## Existing Frontend

The existing frontend already contains:

- Dashboard
- Applications page
- Application Details page
- Schedule
- Insights
- Settings
- Add Application dialog
- Edit Application dialog
- Delete Application flow
- Search
- Filters
- Sorting
- Status chips
- Next Action logic
- Dashboard metrics
- Schedule grouping
- Insights metrics
- Mock timeline
- Light mode
- Dark mode
- Theme persistence
- localStorage application persistence
- mock application data

The existing visual design should remain substantially unchanged.

This feature is primarily a data integration task, not a UI redesign.

## API Client

Create or update a shared frontend API client.

Preferred location:

```text
web/src/lib/apiClient.ts
```

Use an environment variable for the backend base URL:

```text
VITE_API_BASE_URL
```

Example local value:

```text
VITE_API_BASE_URL=http://localhost:5000
```

Use the actual ASP.NET Core development URL configured in the API project.

If Axios is already installed, use Axios.

If the project already consistently uses `fetch`, it is acceptable to continue using `fetch`.

Do not introduce multiple HTTP client approaches without a reason.

Do not hardcode production URLs.

## Applications API Module

Create a dedicated API module for application requests.

Preferred location:

```text
web/src/features/applications/api/applicationsApi.ts
```

It should expose functions similar to:

```text
getApplications()
getApplicationById(id)
createApplication(data)
updateApplication(id, data)
deleteApplication(id)
```

UI components should not contain raw HTTP request logic.

Keep API communication separate from page and presentation components.

## TanStack Query

Add TanStack Query if it is not already installed.

Configure:

```text
QueryClient
QueryClientProvider
```

at the appropriate application root.

Use TanStack Query for application server state.

Suggested query keys:

```text
["applications"]
["applications", applicationId]
```

Use:

```text
useQuery
```

for reading data.

Use:

```text
useMutation
```

for creating, updating, and deleting data.

Invalidate or update relevant queries after successful mutations.

Avoid unnecessary query abstraction or complex cache architecture during this feature.

## Applications Page

The Applications page should load applications from:

```text
GET /api/applications
```

Replace the current active local/mock application source with the API query.

Preserve:

- Current page layout
- Application cards
- Search
- Status filtering
- Other existing filters
- Sorting
- Status chips
- Next Action display
- Add Application button
- Open Details navigation

Search, filters, and sorting may remain frontend-side.

Do not implement backend search, filtering, or sorting yet.

## Applications Loading State

While applications are loading, show an appropriate loading state.

Use the existing MUI visual style.

Possible options include:

```text
Skeleton cards
Progress indicator
Simple loading state
```

Do not significantly redesign the page.

## Applications Error State

If the Applications request fails:

- Show a visible error state
- Explain that applications could not be loaded
- Allow retry if it is simple to implement
- Do not silently hide the error
- Do not automatically fall back to mock application data

API failure should remain visible during development.

## Applications Empty State

If the API returns no applications:

- Show the existing or improved empty state
- Keep Add Application available
- Do not automatically populate frontend mock records

## Application Details

Application Details should load the selected application from:

```text
GET /api/applications/{id}
```

Use a TanStack Query detail query.

Preserve:

- Back to Applications
- Company name
- Job title
- Status
- Next Action
- Quick Facts
- Job URL
- Notes
- Job Description
- Edit
- Delete
- Timeline UI

Timeline may remain frontend/mock-only during this feature.

Do not create Timeline backend persistence yet.

## Application Details States

While loading:

- Show a clear loading state
- Avoid rendering misleading empty values

If the request fails:

- Show an error state
- Do not crash the page

If the API returns `404`:

- Show an Application Not Found state
- Provide navigation back to Applications

## Add Application Integration

Connect the existing Add Application form to:

```text
POST /api/applications
```

Keep the existing form layout.

Keep the current fields, including:

```text
Company
Job title
Job URL
Status
Applied date
Deadline
Location
Source
Salary range
Notes
Job description
```

Required fields remain:

```text
Company
Job title
```

Keep existing frontend validation.

On successful creation:

- Close the dialog
- Invalidate the Applications query
- Show the new application in the list
- Avoid a full browser reload

If creation fails:

- Keep the form/dialog open
- Show an understandable error
- Do not unnecessarily discard the user's entered form values

## Edit Application Integration

Connect the existing Edit Application flow to:

```text
PUT /api/applications/{id}
```

Keep the current form UI and validation.

On successful update:

- Invalidate the Applications list query
- Invalidate the relevant Application Details query
- Show the updated values
- Avoid a full browser reload

If update fails:

- Show an error
- Keep the current form/page usable

## Delete Application Integration

Connect the existing Delete Application flow to:

```text
DELETE /api/applications/{id}
```

Keep the existing confirmation behavior.

If deleting from the Applications page:

- Invalidate the Applications query
- Remove the deleted application from visible data through query refresh

If deleting from Application Details:

- Invalidate the Applications query
- Clear or invalidate the deleted detail query
- Navigate back to Applications

If deletion fails:

- Show an error
- Do not navigate away as though deletion succeeded

## Frontend Types

Keep frontend application types aligned with the backend DTOs.

Avoid:

```text
any
```

Avoid duplicate incompatible definitions of JobApplication.

Expected application fields include:

```text
id
userId
companyName
jobTitle
jobUrl
location
source
status
appliedDate
deadline
salaryRange
notes
jobDescription
createdAt
updatedAt
```

Exact optional/null fields should match the backend response DTO.

## Application Status

Keep frontend and backend status values aligned.

Supported statuses:

```text
Draft
ToApply
Applied
Interviewing
Assignment
Offer
Rejected
Ghosted
Withdrawn
```

Prefer readable string status values.

Do not introduce numeric status mappings if the backend already returns strings.

Existing status chips should continue working.

## Date Handling

Keep API dates compatible with existing frontend logic.

Typical fields:

```text
appliedDate
deadline
createdAt
updatedAt
```

The API should provide data values.

The frontend remains responsible for user-facing date formatting.

Do not change API contracts only for display formatting.

## localStorage Migration

The API should become the source of truth for applications.

Remove or disable application localStorage persistence as the active runtime data source.

The old flow:

```text
React state
  ↓
localStorage
```

should be replaced with:

```text
React
  ↓
TanStack Query
  ↓
ASP.NET Core API
  ↓
SQLite
```

It is still valid to use localStorage for:

```text
Theme preference
Other client-only UI preferences
```

Do not remove theme persistence.

## Mock Application Data

Mock application data may remain in the repository if it is useful for:

```text
Tests
Fixtures
Development examples
Future demo/reset tooling
```

It must not remain the normal runtime application data source.

Do not silently use mock data when the API is unavailable.

## Dashboard

Do not implement a dedicated Dashboard API during this feature.

The Dashboard should use the application data coming from the API where practical.

Existing frontend-derived metrics may remain frontend logic.

Preserve:

```text
Total
Active
Interviews
Offers
Needs follow-up
Ghosted risk
Priority Action
Schedule Summary
Pipeline Snapshot
Next Actions
```

Reuse the Applications query/cache where practical instead of creating unnecessary duplicate fetching logic.

## Schedule

Do not implement a Reminder or Schedule backend during this feature.

The Schedule page may continue deriving information from:

```text
Application deadlines
Application status
Existing frontend logic
Existing mock reminder data where still needed
```

Preserve the existing Schedule UI and grouping.

## Insights

Do not implement dedicated Insights API endpoints during this feature.

Insights may continue deriving metrics from application data in the frontend.

Preserve:

```text
Response Momentum
Pipeline Pressure
Data Coverage
Status Breakdown
```

Do not add a chart library during this task.

## Next Action Logic

Keep Next Action logic in the frontend during this feature.

Do not move Next Action business rules into the ASP.NET Core API yet.

The frontend may continue deriving actions from fields such as:

```text
status
appliedDate
deadline
updatedAt
```

Backend Next Action logic can be considered later if needed.

## Timeline

Timeline remains frontend/mock-only during this feature.

Do not create:

```text
TimelineEvent entity
Timeline database table
Timeline API endpoints
```

Timeline backend persistence belongs to a later feature.

## CORS

The React development app must be able to access the local ASP.NET Core API.

If CORS configuration is required, make only the smallest necessary backend change.

Allow the actual local Vite frontend origin, typically:

```text
http://localhost:5173
```

Do not use unrestricted CORS unless there is a specific development reason.

## Environment Configuration

Use:

```text
VITE_API_BASE_URL
```

for the frontend API address.

Create or update:

```text
web/.env.example
```

if appropriate.

Example:

```text
VITE_API_BASE_URL=http://localhost:5000
```

Do not commit secrets.

The API base URL is not considered a secret.

## Error Handling

Handle at least:

```text
Applications load failure
Application Details load failure
Application not found
Create failure
Update failure
Delete failure
```

Use existing MUI components.

Do not add a new notification dependency only for this feature unless one already exists.

## Preserve Existing Functionality

The following must continue working:

- App navigation
- Sidebar navigation
- Light mode
- Dark mode
- Theme persistence
- Applications list
- Application Details
- Add Application
- Edit Application
- Delete Application
- Search
- Filters
- Sorting
- Status chips
- Next Action logic
- Dashboard
- Schedule
- Insights
- Timeline mock UI
- Settings

## Preserve Existing UI

Do not perform a broad redesign.

Do not redesign:

```text
Dashboard
Applications
Application Details
Schedule
Insights
Settings
Sidebar
Application dialogs
Application cards
```

Small UI changes required for loading, error, empty, and not-found states are allowed.

The application should look substantially the same after API integration.

## Not Included

Do not implement during this feature:

- Clerk authentication
- JWT authentication
- Real user accounts
- User registration
- Account management
- Timeline backend
- Reminder backend
- Contacts backend
- Dashboard-specific API
- Insights-specific API
- Backend Next Action logic
- Backend search
- Backend filtering
- Backend sorting
- PostgreSQL
- Neon
- Railway deployment
- Vercel deployment changes
- Mobile integration
- Expo integration
- Push notifications
- Email notifications
- File uploads
- CV uploads
- AI features
- Job scraping
- Browser extension

## Validation

### Backend

Run from the API project:

```bash
dotnet build
```

Verify:

- API starts locally
- SQLite database is accessible
- Applications endpoints still work
- Swagger/OpenAPI still works
- CORS allows the local Vite app if required

### Frontend

Run:

```bash
cd web
npm run build
```

If linting is configured:

```bash
npm run lint
```

Verify there are no TypeScript build errors.

## Manual Test Checklist

### Applications List

1. Start the ASP.NET Core API.
2. Start the React frontend.
3. Open Applications.
4. Applications load from the API.
5. Search works.
6. Filters work.
7. Sorting works.
8. Refresh the browser.
9. Applications still exist because data is stored in SQLite.

### Add Application

1. Open Add Application.
2. Enter a company and job title.
3. Fill optional fields if needed.
4. Save.
5. The dialog closes.
6. The new application appears in the list.
7. Refresh the browser.
8. The application still exists.
9. Verify the application through Swagger if needed.

### Edit Application

1. Open an application.
2. Edit one or more fields.
3. Save.
4. Updated values appear in the UI.
5. Refresh the browser.
6. Updated values remain.

### Delete Application

1. Delete an application.
2. Confirm deletion.
3. The application disappears from the UI.
4. Refresh the browser.
5. The deleted application does not return.

### Application Details

1. Open Application Details.
2. Data loads from the API.
3. Refresh directly on the Details URL.
4. The application still loads.
5. Navigate to an invalid/non-existent application ID.
6. A proper not-found state appears.

### Other Pages

Verify:

- Dashboard still works
- Schedule still works
- Insights still works
- Timeline mock UI still works
- Next Action logic still works
- Light mode works
- Dark mode works
- Theme persists after refresh

## Definition of Done

This feature is complete when:

- React successfully communicates with the ASP.NET Core API
- TanStack Query is configured
- Applications are loaded from the API
- Application Details is loaded from the API
- Add Application creates a database record
- Edit Application updates a database record
- Delete Application removes a database record
- SQLite is the source of truth for application data
- Browser refresh does not lose application data
- localStorage is no longer the primary application data source
- Search still works
- Filters still work
- Sorting still works
- Status chips still work
- Next Action logic still works
- Dashboard still works
- Schedule still works
- Insights still works
- Timeline mock UI still works
- Loading states exist
- Error states exist
- Application not-found state exists
- Light mode works
- Dark mode works
- Theme persistence works
- `npm run build` passes
- `dotnet build` passes
- No authentication was implemented
- No deployment work was implemented
- No unrelated redesign was performed

## Expected Result

After this feature, the main application data flow should be:

```text
React + TypeScript + MUI
        ↓
TanStack Query
        ↓
applicationsApi.ts
        ↓
ASP.NET Core Web API
        ↓
Entity Framework Core
        ↓
SQLite
```

Application CRUD is now persisted through the backend.

The frontend no longer depends on localStorage for JobApplication persistence.

Some other features such as Timeline and Reminders may still be mock/frontend-only.

## Next Feature

The likely next major feature after this integration is:

```text
Authentication and User Ownership
```

That feature may include:

- Clerk React integration
- Sign in / sign out
- Access token handling
- ASP.NET Core JWT validation
- Replacing `dev-user`
- Associating JobApplications with the authenticated user
- Ensuring users can only access their own applications

Do not implement authentication as part of the current feature.

## History

- Completed Web App Mock Data Foundation
- Completed Web CRUD Flow with Local State
- Completed Next Action Logic in Frontend
- Completed Web UX Polish and Local Persistence
- Completed Mock Timeline and Reminders UI
- Completed Web Visual Alignment and Theme Polish
- Completed Dashboard Layout Balance Pass
- Completed Web MVP Usability Polish Pass
- Completed Topbar Removal and Sidebar Footer Refinement
- Completed API Foundation and Applications CRUD
- Started Frontend Applications API Integration
- Completed Frontend Applications API Integration

## Implementation and Verification Notes

- Shared Axios client uses `VITE_API_BASE_URL=http://localhost:5080`.
- TanStack Query owns the applications list and ID-specific detail caches.
- Existing ApplicationsProvider exposes query data and async CRUD mutations.
- Application DTO nullability matches the API. UserId remains internal to the backend.
- Application localStorage and mock fallback are disconnected from runtime.
  Existing stored records and legacy helper files are retained, not migrated.
- Theme persistence is unchanged; the Settings demo reset is disabled.
- No API/CORS changes were needed: both localhost and 127.0.0.1 on port 5173
  were already allowed. No mobile, authentication or deployment changes.
- Passed: frontend build, ESLint, backend build, HTTP CRUD test script.
- Browser verified: empty/loading states; create/edit/delete; refresh persistence;
  direct detail navigation; search; status and active/archived filters; deadline
  sorting; Dashboard, Schedule, Insights, Next Action and mock timeline;
  light/dark theme persistence; deleted-record not found.
- Stopping the API verified visible list/detail load errors, retry recovery,
  create/edit input retention, and delete failure staying on the detail page.
  Temporary test applications were removed after verification.
- Remaining manual check: native Applied date/Deadline date-picker entry.
  The browser automation did not populate those native controls; API date
  round-trips and date-based rendering/sorting passed.
- Non-blocking existing/tooling notices: Vite bundle-size warning and npm audit
  high-severity `js-yaml@4.3.1` advisory in the existing ESLint dependency tree.
  No unrelated dependency upgrades were made.

Setup and data-flow details: [web README](../web/README.md).
