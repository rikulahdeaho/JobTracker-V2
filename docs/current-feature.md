# Current Feature

## Feature Name

Authentication and User Ownership

## Status

Completed

## Implementation and verification (2026-09-17)

Clerk sign-in/sign-out, centralized Axios tokens, per-user/session QueryClient isolation,
JWT validation and authenticated subject ownership are implemented. All six existing
data endpoints are protected. ApplicationEvents are owned through their application;
Reminder objects remain frontend-derived, with no separate reminder table or endpoint.
Legacy `dev-user` data is untouched. Local backend settings use ignored
`appsettings.Development.json`; frontend settings use ignored `.env.local`.

Latest checks: 57 backend tests, 61 frontend tests, both builds and frontend lint passed.
Browser checks covered real Clerk sign-in/sign-out, API list/detail reads, all current
pages, search, Timeline display, reload/session persistence and theme persistence.
Real two-account browser isolation was verified with an A -> B -> A sign-out/sign-in
cycle in the same tab: separate application lists, Dashboard/Schedule data, and
"Application not found" for direct links to the other account's application in both directions.
Browser writes verified application creation for both users, editing A's notes, and
recording A's Application sent event. Reload and re-login preserved the notes/event;
Timeline, Applied status, Next Action and the derived follow-up reminder updated.
Both AUTH TEST A/B 2026-09-17 records remain in local development data. The user chose
to retain the test application, so permanent browser deletion was not executed.
Deletion, cross-user PUT/DELETE/event POST, expired-session handling and in-flight
cache races remain covered by automated tests rather than this real-session browser run.
The automated suites also cover failed edit/delete recovery.
Vite reports a bundle-size warning. An isolated browser MutationObserver error did not
reproduce in a fresh tab; its source remains unconfirmed. The last npm audit reported
an existing high-severity js-yaml development dependency issue through ESLint.

The sections below retain this feature's original requirements and acceptance checklist.

## Scope

Implement authentication and user-specific data ownership for the existing JobTracker web application and ASP.NET Core API.

Work mainly inside:

- `web/`
- `api/`
- `docs/`

Do not modify `mobile/`.

Do not deploy the application during this feature.

## Goal

Replace the temporary shared `dev-user` model with real authenticated users.

Use Clerk for frontend authentication.

The ASP.NET Core API must validate authentication tokens and derive the current user's identity from the validated token.

Users must only be able to access their own:

- JobApplications
- ApplicationEvents
- Reminders

The frontend must not send or control ownership identifiers.

The backend must remain the authority for data ownership.

## Target Architecture

```text
User
  ↓
Clerk Authentication
  ↓
React Web
  ↓
Clerk access token
  ↓
Axios
  ↓
ASP.NET Core authentication
  ↓
Validated user identity
  ↓
Applications / Events / Reminders
  ↓
EF Core
  ↓
SQLite
```

Later production deployment may replace SQLite with PostgreSQL, but that is not part of this feature.

---

## Situation Before This Feature

Before this feature, the API used the same temporary user for all requests:

```text
dev-user
```

`UserId` already existed in the data model, but real authentication was not yet implemented.

The current frontend already communicates with the ASP.NET Core API through:

```text
React
  ↓
TanStack Query
  ↓
applicationsApi.ts
  ↓
Axios
  ↓
ASP.NET Core API
```

This data flow should remain.

Authentication should be added on top of it.

---

## Authentication Provider

Use Clerk for web authentication.

Add Clerk to the React application using the current recommended Clerk React integration.

The frontend should support at least:

```text
Sign in
Sign out
Authenticated application access
Current user display
```

Do not build a custom username/password authentication system.

Do not store passwords.

---

## Frontend Environment Configuration

Use an environment variable for the Clerk publishable key.

Example:

```text
VITE_CLERK_PUBLISHABLE_KEY=
```

Update:

```text
web/.env.example
```

Do not commit real secrets.

The Clerk publishable key is intended for frontend use.

Any backend-specific configuration must be stored through normal ASP.NET Core configuration/environment variables.

Do not hardcode Clerk tenant-specific URLs or secrets into source code.

---

## Clerk Provider

Configure Clerk at the React application root.

The existing application should continue to contain the existing providers such as:

```text
ClerkProvider
Theme Provider
QueryClientProvider
Router
```

Use an appropriate provider order that allows authenticated API access.

Do not unnecessarily redesign the application bootstrap structure.

---

## Authentication States

The application must handle:

```text
Clerk loading
Signed out
Signed in
Authentication failure
```

Do not attempt authenticated API requests before Clerk authentication state is ready.

---

## Signed-Out Experience

When the user is not authenticated, do not show the normal JobTracker workspace as though it were available.

Provide a simple signed-out view.

It may contain:

```text
JobTracker
Career Co-pilot

Track your job applications and next actions.

Sign in
```

Keep it visually consistent with the existing application.

Do not spend significant time building a marketing landing page during this feature.

---

## Signed-In Experience

After successful sign-in:

- show the existing JobTracker application
- load the authenticated user's data
- preserve the current Dashboard
- preserve Applications
- preserve Application Details
- preserve Schedule
- preserve Insights
- preserve Settings
- preserve the existing sidebar layout

Authentication should not require a broad UI redesign.

---

## Sidebar Account Section

Replace the current mock account placeholder with real authenticated user information.

Display a compact account section using available Clerk user information.

Possible content:

```text
Avatar
Display name
Email
Sign out
```

Keep the sidebar footer compact.

Do not turn the sidebar into a full account management interface.

Theme controls should continue to work independently.

---

## API Authentication

Configure ASP.NET Core authentication using Clerk-issued tokens.

Use the current Clerk-supported JWT validation approach.

Do not invent token validation rules.

Validate at least:

```text
Signature
Issuer
Expiration
```

Validate audience when the actual Clerk token configuration requires it.

Keep Clerk tenant-specific configuration outside source code.

Do not trust JWT payloads without cryptographic validation.

---

## API Authorization

Application API endpoints that operate on user data must require authentication.

Use ASP.NET Core authorization.

For example:

```text
[Authorize]
```

or an equivalent application-wide authorization policy.

Protected resources include at least:

```text
JobApplications
ApplicationEvents
Reminders
```

Swagger/OpenAPI may remain accessible in Development if useful.

---

## Current User ID

The backend must derive the authenticated user identifier from the validated token.

Use the authenticated subject/user identifier from the claims principal.

Conceptually:

```text
HttpContext.User
    ↓
validated subject claim
    ↓
CurrentUserId
```

Do not accept `UserId` from frontend request bodies.

Do not allow the frontend to choose application ownership.

---

## Ownership Rules

Every user-owned query must be scoped to the authenticated user.

Conceptually:

```text
application.UserId == currentUserId
```

This applies to:

```text
GET list
GET by id
POST
PUT
DELETE
Application Events
Reminders
```

---

## Create Application

When creating a JobApplication:

The backend should set:

```text
UserId = current authenticated user ID
```

The request DTO must not contain a writable ownership field.

The frontend must not send `UserId`.

---

## Read Applications

For:

```text
GET /api/applications
```

return only applications owned by the authenticated user.

User A must never receive applications owned by User B.

---

## Read Single Application

For:

```text
GET /api/applications/{id}
```

the application must match both:

```text
Id == requested id
UserId == current user
```

If the application exists but belongs to another user, do not expose that fact.

Prefer the same outward result as an unknown application:

```text
404 Not Found
```

---

## Update Application

For:

```text
PUT /api/applications/{id}
```

only allow updates when the application belongs to the authenticated user.

User ownership must never change through normal update requests.

The request must not be able to overwrite:

```text
UserId
Id
CreatedAt
```

---

## Delete Application

For:

```text
DELETE /api/applications/{id}
```

only delete records belonging to the authenticated user.

A user must not be able to delete another user's application by guessing its ID.

---

## Application Events

ApplicationEvent ownership should be enforced through its parent JobApplication.

For example:

```text
ApplicationEvent
  ↓
JobApplication
  ↓
UserId
```

When retrieving or creating events:

1. find the parent application
2. verify that it belongs to the current user
3. only then access or modify its events

Do not trust an arbitrary `ApplicationId` without ownership validation.

---

## Reminders

Reminder ownership should also be enforced through the owning JobApplication.

A user must not be able to:

```text
read
create
update
complete
delete
```

a reminder belonging to another user's application.

---

## Current User Abstraction

Avoid duplicating raw claims extraction across every controller.

If useful, introduce a small abstraction such as:

```text
ICurrentUser
CurrentUserService
```

or a similarly simple solution.

Its responsibility should be small:

```text
return current authenticated user ID
```

Do not create a large authentication/domain service layer unnecessarily.

---

## Axios Authentication

The frontend API client must send the authenticated Clerk token with protected API requests.

Conceptually:

```text
Authorization: Bearer <token>
```

Keep token handling centralized.

Do not manually add authentication headers separately in every API function.

Integrate authentication with the existing shared Axios/API client structure.

---

## Token Retrieval

Use Clerk's supported token retrieval mechanism.

Do not store access tokens manually in:

```text
localStorage
sessionStorage
application state
```

unless Clerk itself manages its internal session storage.

The application should request/use the current Clerk session token through Clerk APIs.

---

## TanStack Query and Authentication

TanStack Query must not leak cached server data between authenticated users.

When the authenticated user changes or signs out:

- remove or clear user-specific query data
- ensure previous user data is not rendered for the next user

At minimum, handle:

```text
Sign out
User switch
New sign in
```

Possible strategies include:

```text
clear the QueryClient on authentication change
```

or user-scoped query keys.

Choose the simplest reliable approach.

The important requirement is:

```text
User B must never briefly see cached User A data.
```

---

## Existing Query Structure

Preserve the existing application query structure where practical.

Current examples:

```text
["applications"]
["applications", id]
```

These may remain if the entire query cache is safely cleared when authentication changes.

If user identity is included in query keys instead, keep the structure simple and consistent.

Do not introduce unnecessary query-key complexity.

---

## Existing Frontend Functionality

Authentication must not break:

- Applications CRUD
- Application Events
- Timeline
- Reminders
- Next Action
- Schedule
- Dashboard
- Insights
- Search
- Filters
- Sorting
- light mode
- dark mode
- theme persistence

---

## Theme Persistence

Theme preference may continue using localStorage.

Theme preference does not need to become a backend user setting during this feature.

Do not mix client appearance preferences with authentication data unless necessary.

---

## Existing Development Data

Existing SQLite records may currently belong to:

```text
dev-user
```

Do not automatically assign all existing `dev-user` data to the first person who signs in.

That could incorrectly transfer ownership.

Existing development data may instead:

```text
remain as legacy dev-user data
```

and become invisible to authenticated users.

For local development, it is acceptable to:

```text
delete/reset the development database
```

and create new records after authentication is enabled.

If a migration or development utility is added for existing data, it must require an explicit action.

Do not silently migrate ownership.

Document the chosen development migration behavior.

---

## Database Model

The existing `UserId` field may remain a string unless there is a concrete reason to change it.

Clerk user identifiers can be stored in the existing ownership field.

Do not create a local Users table merely to duplicate Clerk users during this feature.

A local application user/profile table can be considered later if the product needs application-specific profile data.

---

## Database Migration

Only create an EF Core migration if the database schema actually changes.

Authentication by itself may not require a migration if:

```text
UserId
```

already exists with a suitable type.

Do not create empty or unnecessary migrations.

---

## Error Handling

Frontend should clearly handle at least:

```text
401 Unauthorized
403 Forbidden if used
Authentication loading
Expired/invalid session
API unavailable
```

If the API returns `401`, do not silently replace authenticated data with mock data.

Do not expose sensitive authentication details in UI error messages.

---

## Unauthorized API Requests

Unauthenticated access to protected user data should return:

```text
401 Unauthorized
```

Authenticated access to another user's resource should not reveal ownership information.

Prefer:

```text
404 Not Found
```

for inaccessible resource IDs where appropriate.

---

## Backend Tests

Update the existing xUnit / WebApplicationFactory test suite.

The tests should support fake authenticated identities.

Do not require real Clerk network calls in automated backend tests.

Use a test authentication handler or equivalent isolated authentication mechanism.

Test at least:

### Authentication

```text
Unauthenticated GET /api/applications → 401
Authenticated request → succeeds
```

### Ownership

Create records for:

```text
user-a
user-b
```

Verify:

```text
user-a only sees user-a applications
user-b only sees user-b applications
```

Verify that User A cannot:

```text
GET User B application
PUT User B application
DELETE User B application
access User B events
access User B reminders
```

### Creation

Verify that POST automatically sets ownership from the authenticated identity.

The frontend/request body must not control UserId.

### Existing Behavior

Keep tests for:

- CRUD
- validation
- timestamps
- statuses
- workflow events
- reminders
- Next Action related backend behavior if applicable

---

## Frontend Tests

Update Vitest / React Testing Library tests where necessary.

Mock Clerk authentication at the authentication boundary.

Do not make real Clerk network calls during unit/component tests.

Add focused coverage for:

```text
signed-out state
signed-in application rendering
authenticated API requests
sign-out behavior
query cache clearing on authentication change
```

Do not test Clerk's internal implementation.

Test JobTracker behavior around Clerk.

---

## Manual Multi-User Test

Perform a manual ownership test using two separate Clerk users.

### User A

1. Sign in as User A.
2. Create an application.
3. Add workflow/event data if supported.
4. Sign out.

### User B

1. Sign in as User B.
2. Verify User A's application is not visible.
3. Create a separate application.
4. Sign out.

### User A Again

1. Sign in again as User A.
2. Verify User A's application is visible.
3. Verify User B's application is not visible.

This is an important acceptance test.

---

## Security Requirements

Do not rely only on frontend route protection.

The API must enforce ownership.

The following is not sufficient:

```text
Hide other users' applications in React
```

Authorization must happen on the server.

Never trust these values from a request:

```text
UserId
OwnerId
ClerkUserId
```

Ownership comes from the validated authenticated identity.

---

## Not Included

Do not implement during this feature:

- social profile system
- local password authentication
- custom password reset
- roles
- admin panel
- organizations
- teams
- Clerk Organizations
- account billing
- subscription plans
- production PostgreSQL
- Neon
- Railway deployment
- Vercel deployment changes
- mobile authentication
- Expo Clerk integration
- email notifications
- push notifications
- calendar integrations
- AI features

---

## Validation

### Backend

Run:

```powershell
cd api
dotnet test
dotnet build
```

Verify:

```text
all tests pass
unauthenticated requests are rejected
authenticated CRUD works
ownership isolation works
```

### Frontend

Run:

```powershell
cd web
npm run test
npm run build
npm run lint
```

Verify:

```text
all tests pass
frontend builds
lint passes
```

---

## Manual Validation

Verify:

### Authentication

- Signed-out user sees sign-in experience
- User can sign in
- User can sign out
- Reload keeps valid Clerk session
- Expired/invalid authentication does not expose application data

### Applications

- Applications load after sign-in
- Add Application works
- Edit Application works
- Delete Application works
- Refresh works
- Direct Details route works

### Workflow

- Application Events still work
- Timeline still works
- Next Action still works
- Reminders still work
- Schedule still works

### Other Pages

- Dashboard works
- Insights works
- Settings works
- light mode works
- dark mode works
- theme persists

### User Isolation

- User A cannot see User B data
- User B cannot see User A data
- Direct ID requests cannot bypass ownership rules
- frontend cache does not leak previous user's data

---

## Definition of Done

This feature is complete when:

- Clerk is integrated into the React frontend
- Signed-out users cannot access the normal workspace
- Signed-in users can use the existing application
- Axios sends valid authentication tokens to the API
- ASP.NET Core validates authentication
- API no longer uses hardcoded `dev-user` for normal authenticated requests
- User ID is derived from authenticated claims
- JobApplications belong to the authenticated user
- ApplicationEvents are ownership protected
- Reminders are ownership protected
- User A cannot access User B resources
- frontend query cache cannot leak data between users
- existing CRUD still works
- workflow model still works
- Dashboard still works
- Schedule still works
- Insights still works
- automated authentication/ownership tests pass
- frontend tests pass
- backend tests pass
- frontend build passes
- backend build passes
- lint passes
- no production deployment work was added

---

## Expected Result

Before:

```text
Any browser
    ↓
React
    ↓
API
    ↓
UserId = dev-user
    ↓
Shared development data
```

After:

```text
Clerk User
    ↓
Authenticated React session
    ↓
Bearer token
    ↓
ASP.NET Core token validation
    ↓
Authenticated user ID
    ↓
User-owned JobApplications
    ↓
User-owned Events / Reminders
```

---

## Next Feature

After authentication and ownership are stable, likely next areas include:

```text
Production Database and Deployment
```

or:

```text
Reminder / Schedule Product Refinement
```

or:

```text
Mobile App Foundation
```

Do not implement those as part of this feature.

---

## History

- Completed Web App Mock Data Foundation
- Completed Web CRUD Flow with Local State
- Completed Frontend Applications API Integration
- Completed Applications Automated Test Layer
- Completed Application Workflow Model
- Completed Authentication and User Ownership
