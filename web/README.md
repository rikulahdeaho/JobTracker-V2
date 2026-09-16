# JobTracker web

## Local setup

Run the existing API in one terminal:

```powershell
cd api/JobTracker.Api
dotnet tool restore
dotnet ef database update
dotnet run
```

In another terminal, from the repository root:

```powershell
cd web
npm install
Copy-Item .env.example .env.local
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Copy the environment example only when setting up a new checkout; preserve
existing local settings. The integration workspace already has `.env.local`.

`VITE_API_BASE_URL=http://localhost:5080` points to the API origin (without
`/api`). Restart Vite after changing it. A missing variable produces a visible
configuration error. API failures never fall back to mock data.

The API permits `http://localhost:5173` and `http://127.0.0.1:5173` in Development.
Use port 5173; another origin needs an explicit CORS change.

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

Now the provider exposes one TanStack Query list cache to Applications,
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

The database owns IDs and UTC timestamps. The frontend response type matches
the backend DTO, including nullable strings and dates; UserId is intentionally
absent because the response DTO does not expose it. Forms convert empty
optional values to null and API nulls to empty input values.

The list uses a 30-second stale time. Failed queries have a Retry action;
mutations are not automatically retried. Form values remain available after
failed saves, and delete failures keep the confirmation open.

## Retained frontend behavior

- Search, filters, sorting, Next Action and summary calculations remain local.
- Timeline and reminders remain frontend-derived previews with no backend persistence.
- Theme preference still uses localStorage.
- Existing localStorage application records are untouched and are not imported.
- `mockApplications.ts`, `applicationStorage.ts` and `applicationCrud.ts` remain
  as unused legacy code; the runtime provider no longer imports them.
- The demo reset control is disabled because it must not replace API data.
- No authentication, new backend endpoints, deployment or mobile changes.

## Checks

```powershell
npm run build
npm run lint
```

See `docs/current-feature.md` for the feature acceptance checklist.
