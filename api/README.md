# JobTracker API

ASP.NET Core 10 controller API with EF Core 10 and local SQLite persistence.
The React application uses this API for Applications CRUD through TanStack Query.
See [How JobTracker works](../docs/how-it-works.md) for the current application behavior.

## Run locally

Prerequisite: .NET 10 SDK.

Store the Clerk settings below in `JobTracker.Api/appsettings.Development.json`
once. Development loads this file automatically, so subsequent starts need only
`dotnet run`. The file is ignored by Git; this checkout has been configured locally.

From the repository root:

```powershell
cd api/JobTracker.Api
dotnet tool restore
dotnet build
dotnet ef database update
dotnet run
```

- Swagger UI: http://localhost:5080/swagger
- OpenAPI document: http://localhost:5080/swagger/v1/swagger.json
- API: http://localhost:5080/api/applications

The launch profile selects Development. Swagger and CORS for
`http://localhost:5173` and `http://127.0.0.1:5173` are enabled only in Development.
All application and event endpoints require a validated Clerk session token.
Swagger/OpenAPI remain public in Development; data operations still require Bearer authentication.

## Clerk configuration

1. Create/select your own **development** application in [Clerk Dashboard](https://dashboard.clerk.com).
2. Under sign-up/sign-in settings, enable the identifiers/providers you want to use
   (for example email). Keep personal accounts enabled; this app does not use organizations.
3. From **API keys**, copy the publishable key to `web/.env.local` as
   `VITE_CLERK_PUBLISHABLE_KEY`. Copy that same instance's **Frontend API URL** as
   `Clerk__Authority` below. It is the session token's exact `iss`, not the web/API URL
   and not `https://api.clerk.com`. Do not invent a tenant hostname.
4. Use the default Clerk session token; no JWT template or Clerk secret key is required.
   If you intentionally customize session tokens to include `aud`, configure
   `Clerk__Audience` to that exact value. Otherwise leave it unset.
5. Use one consistent local frontend origin. If you have restricted origins or
   redirect URLs in your Clerk settings, allow that origin and its sign-in return URLs.
   The backend permitted origins must match the token's `azp` exactly.

Recommended local configuration in `JobTracker.Api/appsettings.Development.json`
(replace the placeholder with your actual Clerk Frontend API URL):

```json
{
  "Clerk": {
    "Authority": "<Frontend API URL from your Clerk development instance>",
    "AuthorizedParties": [
      "http://127.0.0.1:5173",
      "http://localhost:5173"
    ]
  }
}
```

Keep any other existing settings in this file. No `Audience` is needed for default
session tokens. An optional `Clerk:Audience` must match your configured token audience.
Environment variables are an alternative and override JSON settings; old values in
a terminal therefore still take precedence:

```powershell
$env:Clerk__Authority = '<Frontend API URL from your Clerk development instance>'
$env:Clerk__AuthorizedParties__0 = 'http://127.0.0.1:5173'
$env:Clerk__AuthorizedParties__1 = 'http://localhost:5173'
# Only if your actual session tokens have a configured audience:
# $env:Clerk__Audience = '<that exact audience>'
```

Configuration uses the standard ASP.NET Core `Clerk` section; double underscores map
environment variables to nested keys. Missing/invalid authority or permitted origins
fail startup rather than enabling anonymous access. Tenant configuration is not checked in.
`ConnectionStrings__DefaultConnection` remains an optional SQLite override.

`Microsoft.AspNetCore.Authentication.JwtBearer` 10.0.9 validates tokens following
[Clerk's JWT guidance](https://clerk.com/docs/guides/sessions/manual-jwt-verification).
Authority discovery uses `/.well-known/openid-configuration` and its JWKS signing keys,
with HTTPS metadata and cached key refresh. Validation checks RS256 signature, issuer,
expiration/not-before (5-second clock skew), and configured audience when present.
The `azp` claim, when provided, must equal a configured AuthorizedParties origin.
Missing subjects and pending sessions are rejected. Authentication runs before authorization.

All mapped controllers require authorization. `CurrentUser` reads the validated `sub`
claim without inbound claim remapping. Reads/updates/deletes include both ID and owner;
POST assigns the current subject, and DTOs do not accept ownership fields. Other users'
resource IDs return 404, and requests without valid authentication return 401.

## Database

`appsettings.json` defines `ConnectionStrings:DefaultConnection` as
`Data Source=jobtracker.db`. Run the commands from `api/JobTracker.Api` so the
relative database path is consistent. Override it with
`ConnectionStrings__DefaultConnection` when needed.

The generated `InitialCreate` migration creates `JobApplications` with a GUID
primary key, all application fields, and an index on `UserId`. Status is stored
as text. The database file is ignored by Git. There is no seed data.
Migrations are applied explicitly, not automatically on startup.

For future model changes:

```powershell
dotnet ef migrations add <MigrationName>
dotnet ef database update
```

The local tool manifest in `api/.config/dotnet-tools.json` pins dotnet-ef to
the EF Core package version. The explicit SQLitePCLRaw bundle dependency
replaces the older transitive native SQLite package that raised NU1903.

## Endpoints

| Method | Path | Success | Errors |
| --- | --- | --- | --- |
| GET | /api/applications | 200, list (empty array if none) | |
| GET | /api/applications/{id} | 200, application | 404 |
| POST | /api/applications | 201, application and Location header | 400 |
| PUT | /api/applications/{id} | 200, updated application | 400, 404 |
| DELETE | /api/applications/{id} | 204 | 404 |
| POST | /api/applications/{id}/events | 201, updated application | 400, 404 |

IDs use GUID format; malformed IDs do not match the route and return 404.
Every database lookup is scoped to the authenticated subject. All rows in the endpoint
table can also return 401. POST `/api/applications/{id}/events` uses the same rule on
the parent application before changing history/status and returns 201, 400 or 404.
GET list/detail include events only through owned parents.

There are no separate Reminder entities or endpoints yet. The existing frontend
Reminder model derives dates from the owned application/event aggregate. Schedule,
Dashboard and Insights therefore inherit the same ownership boundary. This feature
does not add reminder CRUD or completion endpoints.

## Legacy development data

Existing `dev-user` rows are left untouched and are inaccessible to real Clerk users.
There is no automatic ownership transfer and no schema migration for authentication.

For an explicit local reset without deleting old data, stop the API and select a new,
unused SQLite filename in the same API terminal, then apply migrations and restart:

```powershell
cd api/JobTracker.Api
$env:ConnectionStrings__DefaultConnection = 'Data Source=jobtracker-auth-local.db'
dotnet ef database update
dotnet run
```

Keep that connection setting for subsequent runs. Sign in and create new records.
The old database remains available as a backup. No migration utility is supplied;
any manual transfer must explicitly select the local source rows and the intended
Clerk user ID after backing up the database, never assign data to the first login.

Create and update use separate DTOs sharing field definitions and validation.
Responses omit the internal `UserId`. IDs, ownership and timestamps are
server-controlled; request fields cannot overwrite them.

Example POST or PUT body:

```json
{
  "companyName": "Example Company",
  "jobTitle": "Backend Developer",
  "jobUrl": "https://example.com/jobs/123",
  "location": "Helsinki",
  "source": "Company website",
  "status": "Applied",
  "appliedDate": "2026-09-16",
  "deadline": "2026-09-30",
  "salaryRange": "4000-5000 EUR",
  "notes": "Application sent",
  "jobDescription": "Build ASP.NET Core APIs"
}
```

- `companyName` and `jobTitle` are required and cannot be blank; both are trimmed.
- Status values: `Draft`, `ToApply`, `Applied`, `Interviewing`, `Assignment`,
  `Offer`, `Rejected`, `Ghosted`, `Withdrawn`. JSON uses strings; numeric and
  undefined enum values return 400. Omitted status defaults to `Draft`.
- Applied date and deadline are nullable dates in `YYYY-MM-DD` format.
- Other editable fields are optional and nullable.
- `applicationMethod`: `Unknown` (default), `CompanyPortal`, `Email`, `RecruiterDirect`, `LinkedInEasyApply`, or `Other`.
- `followUpMode`: `Unknown` (default), `Possible`, `NotAvailable`, or `NotNeeded`. Undefined/numeric enum inputs return 400.
- `contactPerson`: optional, maximum 200 characters. `contactEmail`: optional, maximum 254 characters; requires a non-whitespace local part and dotted domain. Empty contacts normalize to null.
- Methods and preferences never create contact details. A valid email and no explicit NotAvailable/NotNeeded preference allow frontend follow-up suggestions.
- PUT replaces all editable fields. Omitted optional fields become null.
- `createdAt` and `updatedAt` are UTC timestamps with a `Z` suffix.
  They match on create; only `updatedAt` changes on edit.
- Validation errors use ASP.NET Core ValidationProblemDetails with HTTP 400.

## Verification

The 2026-10-03 review passed all 77 backend tests and the build without warnings.
For cross-stack checks and remaining browser limits, see
[release preparation](../docs/current-feature.md#release-preparation-2026-10-03).

Run the isolated automated suite from `api/` (the solution includes API and tests):

```powershell
dotnet test
dotnet build
```

`JobTracker.Api.Tests` uses xUnit and WebApplicationFactory. Each test owns an
open SQLite `:memory:` connection and applies the real EF migrations. The
development DbContext registration is replaced before the host handles requests.
No development database is read or written, and no running API is required.

The suite covers CRUD, validation, timestamps, status serialization, workflow events,
401 on every data route, authenticated `user-a`/`user-b` isolation, forged ownership
fields on POST/PUT, parent ownership for events and reminder source dates, and untouched
legacy data. TestAuthenticationHandler exists only in the test project; no test header
or development authentication bypass is installed in the API.
Additional bearer tests use locally signed RSA tokens and static discovery keys to
verify issuer, signature, algorithm, lifetime, subject, origin and optional audience.
No automated test makes a real Clerk request.

With the API running, use a second PowerShell 7 terminal from the repository root:

```powershell
$token = Read-Host 'Paste a fresh Clerk session token' -AsSecureString
./api/scripts/Test-Applications.ps1 -Token $token
```

The script checks OpenAPI availability, CRUD, all statuses, field round-trips,
required-field and invalid-input validation, UTC timestamps, server-owned
fields, replacement semantics, and missing-record responses. It creates and
deletes its own temporary record, leaving existing applications untouched.

Use a fresh session token from your signed-in local app when making manual HTTP calls;
Clerk session tokens expire quickly. Never check tokens into files. Swagger documents
the routes; its unauthenticated Try it out requests return 401. The script sends the
provided token in Bearer headers and creates/deletes only its own temporary record.

Real Clerk browser acceptance on 2026-09-17 verified an A -> B -> A session cycle,
separate lists/derived reminders, and "Application not found" for direct foreign
Details links in both directions. Browser creation, editing and Application sent
event recording persisted through reload/re-login. Test records were retained at
the user's request, so browser deletion was not executed in that run. A separate
disposable-record browser deletion passed on 2026-10-03. Cross-user PUT/DELETE/event
POST and exact 404 status assertions are covered by the automated API suite;
these HTTP mutations were not manually replayed with real Clerk tokens.

## Application workflow

Application responses now include persisted `events`. POST
`/api/applications/{applicationId}/events` records workflow activity and returns
201 with the updated application. Status changes and activity save atomically;
invalid events return 400 and missing/other-user applications return 404.
No separate GET events call is needed because both application GET endpoints include history.

Migration `20260916123052_ApplicationWorkflow` creates ApplicationEvents and
backfills only creation and known applied dates. Run `dotnet ef database update`
before starting the updated API. No inferred interviews or follow-ups are created.

See [workflow model, API example and rules](../docs/application-workflow.md),
including date corrections and intentionally deferred reminder/event management.

Migration `20261002084434_ApplicationContactPreferences` adds method, follow-up mode,
contact person and contact email. Existing rows receive Unknown/Unknown/null/null;
ownership, status, dates and events remain unchanged. Apply with `dotnet ef database update`.
`ContactReceived` is accepted by the existing event POST with required past/present
`occurredAt`, optional note and no `dueAt`. It preserves status and uses the same
parent ownership checks. No Next Action or Schedule values are stored by the API.
