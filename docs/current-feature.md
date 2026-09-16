# Current Feature

## Feature Name

API Foundation and Applications CRUD Design

## Status

Complete — API foundation and CRUD verified locally on 2026-09-16.

## Scope

Work inside `api/` and project documentation only.

Do not modify the existing React web application yet.

## Goals

- Create the ASP.NET Core API foundation
- Add Entity Framework Core
- Use SQLite for initial local development
- Create the JobApplication entity
- Create the ApplicationStatus enum
- Create AppDbContext
- Create API DTOs
- Create the first EF Core migration
- Create Applications CRUD endpoints
- Enable Swagger/OpenAPI
- Validate CRUD through Swagger

## Architecture

```text
React Web
    |
    | later
    v
ASP.NET Core Web API
    |
    v
Entity Framework Core
    |
    v
SQLite local
```

## Implementation

- ASP.NET Core 10 controller API in `api/JobTracker.Api`.
- EF Core with SQLite, string statuses and generated `InitialCreate` migration.
- Separate create/update request DTOs and response DTO; required-field validation.
- All five Applications endpoints use `dev-user` and server-owned UTC timestamps.
- Swagger UI and OpenAPI enabled for local development.
- React and mobile remain unchanged; no authentication or API integration added.

## Verification

- `dotnet build`: passed without warnings or errors.
- `dotnet ef database update`: applied the initial migration successfully.
- Swagger UI: list, create, detail, update and delete verified.
- `api/scripts/Test-Applications.ps1`: CRUD and validation checks passed.

See [API setup and endpoint documentation](../api/README.md) for commands and request examples.
