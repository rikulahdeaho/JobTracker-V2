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

## Auth Later

- Clerk auth is not part of the first CRUD milestone.
- Keep `UserId` in user-owned entities.
- Use `dev-user` temporarily until Clerk JWT validation is implemented.
- Later, read the real user id from validated Clerk JWT claims.

## Validation

- Validate required fields before saving.
- Company name and job title should not be empty.
- Do not trust frontend validation alone.

## Testing

Before calling API work complete:

- Run `dotnet build`.
- Run the API.
- Verify changed endpoints in Swagger or with HTTP requests.
