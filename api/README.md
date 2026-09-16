# JobTracker API

ASP.NET Core 10 controller API with EF Core 10 and local SQLite persistence.
The React application uses this API for Applications CRUD through TanStack Query.
See [Miten sovellus toimii nyt](../docs/how-it-works.md) for the current application behavior.

## Run locally

Prerequisite: .NET 10 SDK.

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
Authentication is not implemented. All requests use the
same temporary `dev-user`; this is a local development API.

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

IDs use GUID format; malformed IDs do not match the route and return 404.
Every database lookup is scoped to `dev-user`.

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
- PUT replaces all editable fields. Omitted optional fields become null.
- `createdAt` and `updatedAt` are UTC timestamps with a `Z` suffix.
  They match on create; only `updatedAt` changes on edit.
- Validation errors use ASP.NET Core ValidationProblemDetails with HTTP 400.

## Verification

Run the isolated automated suite from `api/` (the solution includes API and tests):

```powershell
dotnet test
dotnet build
```

`JobTracker.Api.Tests` uses xUnit and WebApplicationFactory. Each test owns an
open SQLite `:memory:` connection and applies the real EF migrations. The
development DbContext registration is replaced before the host handles requests.
No development database is read or written, and no running API is required.

The suite covers CRUD HTTP responses, validation without unintended writes,
UTC timestamps, all nine statuses stored as strings, and user ownership filtering.
It deliberately does not test private helpers, authentication, deployment,
or every possible malformed request.

With the API running, use a second PowerShell 7 terminal from the repository root:

```powershell
./api/scripts/Test-Applications.ps1
```

The script checks OpenAPI availability, CRUD, all statuses, field round-trips,
required-field and invalid-input validation, UTC timestamps, server-owned
fields, replacement semantics, and missing-record responses. It creates and
deletes its own temporary record, leaving existing applications untouched.

For manual Swagger verification, expand an operation, select **Try it out**,
enter the body or ID and select **Execute**. POST returns the ID to use for
GET, PUT and DELETE.
