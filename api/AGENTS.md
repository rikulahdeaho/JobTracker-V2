# AGENTS.md

## Scope

These instructions apply to the ASP.NET Core Web API in `api/`.

## Stack

- ASP.NET Core Web API
- C#
- Entity Framework Core
- SQLite locally at first
- PostgreSQL later

## Structure

Preferred structure:

```text
JobTracker.Api/
  Controllers/
  Data/
  Models/
  DTOs/
  Services/
```

## API Rules

- Use controllers for REST endpoints.
- Keep controllers simple.
- Move business logic into services when controller logic grows.
- Use DTOs for create and update endpoints.
- Do not rely on EF entities as long-term public request models.
- Use async methods for database operations.
- Return appropriate HTTP status codes:
  - `200 OK`
  - `201 Created`
  - `204 No Content`
  - `400 Bad Request`
  - `404 Not Found`

## Database

- Use EF Core migrations.
- Do not manually edit generated migrations unless necessary.
- Do not manually change production database structure.
- SQLite is acceptable for early local development.
- PostgreSQL is the production target.

## Authentication and Ownership

- Clerk JWT Bearer validation is implemented; user-data endpoints require authentication.
- Keep `UserId` in user-owned entities.
- Read the current user through CurrentUser from the validated sub claim.
- Scope application queries and event parent lookups to the current user; prefer 404 for other-user IDs.
- Never accept UserId from request DTOs or automatically transfer legacy dev-user records.
- Keep tenant configuration outside committed source; local settings use ignored appsettings.Development.json.

## Validation

- Validate required fields before saving.
- Company name and job title should not be empty.
- Do not trust frontend validation alone.

## Testing

Before calling API work complete:

- Run `dotnet build`.
- Run the API.
- Verify changed endpoints in Swagger or with HTTP requests.
