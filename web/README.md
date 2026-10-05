# JobTracker web

See [How JobTracker works](../docs/how-it-works.md) for a guide to
the current pages, data flow, application rules and test commands.

## Deployment

The web app is deployed on Vercel and calls the Railway API backed by Neon PostgreSQL.
See [deployment configuration](../docs/architecture.md#deployment-architecture).
The committed `vercel.json` rewrite supports direct navigation to application routes.

## Local setup

Configure a Clerk development application first (see [API setup](../api/README.md#clerk-configuration)).
Set `VITE_CLERK_PUBLISHABLE_KEY` in `.env.local` to its publishable key. Never put a
Clerk secret key in a `VITE_` variable. Use Node.js 22.12+ (or a compatible newer LTS release). Vite requires
`^20.19.0 || >=22.12.0`; Clerk's lower minimum alone is not sufficient.

Run the existing API in one terminal:

```powershell
cd api/JobTracker.Api
dotnet tool restore
dotnet ef database update --context AppDbContext
dotnet run
```

In another terminal, from the repository root:

```powershell
cd web
npm install
Copy-Item .env.example .env.local
# Set VITE_CLERK_PUBLISHABLE_KEY in .env.local before starting Vite.
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Copy the environment example only when setting up a new checkout; preserve
existing local settings. The integration workspace already has `.env.local`.

`VITE_API_BASE_URL=http://localhost:5080` points to the API origin (without
`/api`). Restart Vite after changing it. A missing variable produces a visible
configuration error. API failures never fall back to mock data.

The API permits `http://localhost:5173` and `http://127.0.0.1:5173` in Development.
Use port 5173 locally; set the API `FrontendUrl` to allow another frontend origin.

If npm reports `UNABLE_TO_VERIFY_LEAF_SIGNATURE` on Windows with a Node version
supporting system certificates, this session used:

```powershell
$env:NODE_USE_SYSTEM_CA = '1'
npm install
```

## Data flow

Previously, ApplicationsProvider initialized React state from
`jobtracker.applications` in localStorage, falling back to mockApplications.
CRUD helpers generated IDs and timestamps in the browser, and an effect saved
the array after changes. Details looked up an item in that array.

Now the provider exposes one TanStack Query list cache per signed-in session to Applications,
Dashboard, Schedule and Insights. Details uses its own API query:

- `["applications"]`: GET /api/applications.
- `["applications", id]`: GET /api/applications/{id}.

Create, update and delete use TanStack Query mutations through
`features/applications/api/applicationsApi.ts` and the shared Axios client.
Create refreshes the list. Update writes the returned record to the list and
detail caches, then invalidates both. Delete clears the matching detail cache,
updates and refreshes the list, then navigates back from Details.
In-flight reads are canceled before cache updates to avoid older responses
overwriting successful writes.

The API owns IDs and UTC timestamps. The frontend response type matches
the backend DTO, including nullable strings and dates; UserId is intentionally
absent because the response DTO does not expose it. Forms convert empty
optional values to null and API nulls to empty input values.

The list uses a 30-second stale time. Failed queries have a Retry action;
mutations are not automatically retried. Form values remain available after
failed saves, and delete failures keep the confirmation open.

## Retained frontend behavior

- Search, filters, sorting, Next Action and summary calculations remain local.
- Timeline displays persisted application events. Schedule derives reminders from explicit event dates and contact history.
- Details can record activity through POST /api/applications/{id}/events. The returned aggregate refreshes list and detail caches.
- Next Action uses sent/follow-up/recruiter-reply events, never generic updatedAt. From day 14 it suggests follow-up only with a valid contact email and no NotAvailable/NotNeeded preference; from day 30 it suggests Review status. See [workflow rules](../docs/application-workflow.md).
- Add/edit/details expose application method, optional contact information and follow-up preference. Unknown defaults do not invent contactability.
- Needs attention includes actionable preparation, missing details, follow-up and status review; waiting and closed processes are excluded.
- Schedule separates recorded hard dates from suggested attention. Past interviews and submitted assignments leave the hard-date queue. Application deadlines apply to Draft/ToApply.
- Review status offers Keep active (no write or snooze) and Mark as ghosted (normal authorized update).
- Theme preference still uses localStorage.
- Existing localStorage application records are untouched and are not imported.
- `mockApplications.ts`, `applicationStorage.ts` and `applicationCrud.ts` remain
  as unused legacy code; the runtime provider no longer imports them.
- The demo reset control is disabled because it must not replace API data.
- Authentication protects the existing workspace in local and deployed environments.

## Authentication

`@clerk/react` provides ClerkProvider, the sign-in modal, session state and user information.
The provider tree is ThemeModeProvider -> ClerkProvider -> AuthenticationBoundary ->
session-specific QueryClientProvider -> ApplicationsProvider -> RouterProvider.
Theme state stays mounted through sign-out and user changes. The sidebar shows the
user's name/email/avatar and a Sign out action, alongside existing theme controls.

Missing configuration, Clerk loading/failure and signed-out states do not mount the
workspace or start API queries. Deep links keep their URL through sign-in.
The shared Axios client calls Clerk `getToken()` for each request and sets Bearer
authentication centrally. Tokens are never manually persisted or kept in React state.
Feature API functions do not set auth headers. Token retrieval failures have a safe
error message; API 401 hides the workspace, clears cached data and offers sign-out
and reauthentication. API 403 is reported as a permission error.

Each `(userId, sessionId)` gets a new QueryClient and workspace subtree. Sign-out or
identity changes destroy queries, abort pending reads, remove mutation cache entries,
and detach the token getter. Existing query keys are unchanged. A token retrieval
finishing after a session change is rejected. Late mutation callbacks only reference
the discarded client, so they cannot populate the next user's cache. An old 401 cannot
invalidate the new session. Theme preference remains the only app preference stored locally.

Existing `dev-user` data stays in SQLite and is invisible to Clerk users. See the
[local reset instructions](../api/README.md#legacy-development-data).

## Checks

```powershell
npm run test
npm run build
npm run lint
```

Vitest runs once (no watch mode) with React Testing Library and jsdom. The suite
covers Next Action status rules and 14/30-day boundaries, combined filtering,
sorting with missing dates, non-mutating list helpers, and nullable/date-only
form mapping.

Component tests use a fresh QueryClient and mock only the Axios transport.
They run the real API module, ApplicationsProvider, pages and mutations:
loading-to-empty, failure-and-retry, API records/search, successful create
and list refresh, failed create preserving values, and detail 404 navigation.
No running API, browser storage, or development database is required.

Auth boundary tests mock Clerk hooks/components and the Axios transport, while using
the real providers/cache. They cover loading, signed-out and signed-in rendering,
Bearer token refresh, sign-out, direct user switches, canceled reads, delayed token
retrieval, 401/missing-token behavior, derived reminder isolation, sidebar identity
and theme controls. They do not test Clerk internals.

Local configuration, sign-in/sign-out, reads, navigation, search, reload and theme
persistence were verified on 2026-09-17. A real Clerk A -> B -> A cycle in the same
browser tab verified separate lists and derived reminders, restored A's persisted
notes/events, and blocked foreign Details links in both directions. Application
creation for both users, editing A's notes and recording A's Application sent event
passed; Timeline, status, Next Action and Schedule updated accordingly.
Test records were retained at the user's request; deletion was not verified in that
run. A new disposable record was created and deleted in the browser on 2026-10-03. Real-session expiry and in-flight race scenarios were not manually induced;
automated tests cover those auth/cache paths and deletion/error recovery.

Intentionally outside this small suite: visual/MUI internals, snapshots,
full browser end-to-end tests, native date-picker interaction, theme persistence,
exhaustive Dashboard/Schedule/Insights
UI coverage. Backend update/delete behavior is covered in the xUnit suite.

Frontend integration tests also cover edit success updating both caches, failed edits
preserving input, and failed deletion followed by retry, cache removal and list navigation.

See [current verification and remaining checks](../docs/current-feature.md#verification)
for the latest test totals, browser coverage and the feature acceptance checklist.
