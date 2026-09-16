## Unit and Integration Tests

Add a small, focused automated test layer for the API integration.

The goal is not maximum coverage.

The goal is to protect the most important application behavior while the frontend data source changes from local/mock data to the ASP.NET Core API.

### Backend Tests

Use xUnit.

Create or use a test project such as:

```text
api/JobTracker.Api.Tests/
```

Test important application behavior such as:

- Creating an application
- Rejecting invalid create requests
- Getting applications
- Getting a single application
- Returning not found for a missing application
- Updating an application
- Rejecting invalid updates
- Deleting an application
- UpdatedAt changes when an application is updated
- ApplicationStatus values are persisted correctly

Prefer testing behavior rather than implementation details.

If practical, use an isolated test database.

Do not run tests against the normal development SQLite database.

Possible approaches:

```text
EF Core SQLite in-memory database
```

or another isolated temporary SQLite database.

Avoid relying on the EF Core InMemory provider if database behavior is important, because it does not behave exactly like a relational database.

### API Integration Tests

If the existing project structure makes it reasonable, add a small number of API-level integration tests using:

```text
Microsoft.AspNetCore.Mvc.Testing
WebApplicationFactory
```

Useful API integration tests include:

```text
POST /api/applications returns success for valid data
POST /api/applications returns 400 for invalid data
GET /api/applications returns created applications
GET /api/applications/{id} returns 404 for unknown id
PUT /api/applications/{id} updates data
DELETE /api/applications/{id} removes data
```

Do not attempt to test every possible endpoint variation during this feature.

### Frontend Tests

Use the existing frontend test stack if one already exists.

Otherwise prefer:

```text
Vitest
React Testing Library
```

Add focused tests for logic that is valuable and relatively stable.

Good candidates:

```text
Next Action logic
Application filtering
Application sorting
Application status helpers
API data mapping if mapping exists
```

Avoid unit testing MUI implementation details.

Avoid tests that only verify that static text renders.

### Frontend API Integration Tests

If practical, add a small number of component-level tests around the Applications data flow.

Examples:

- Applications page shows a loading state
- Applications page shows API results
- Applications page shows an error state
- Applications page shows an empty state
- Add Application mutation causes the list to refresh
- Application Details handles not found correctly

Mock the HTTP boundary rather than mocking internal implementation details.

If an HTTP mocking library is already installed, use it.

Do not introduce a large testing framework only for this feature unless necessary.

### Test Priorities

Prioritize tests in this order:

```text
1. Next Action / business logic
2. Backend Applications CRUD behavior
3. API endpoint behavior
4. Applications loading/error/empty states
5. Mutation behavior
```

Do not aim for a specific code coverage percentage during this feature.

### Test Validation

Backend:

```bash
dotnet test
```

Frontend:

```bash
npm run test
```

or the project's actual configured test command.

Existing build validation still applies:

```bash
dotnet build
```

```bash
cd web
npm run build
```

If linting exists:

```bash
npm run lint
```

### Definition of Done Additions

The feature is also complete when:

- Backend tests pass
- Frontend tests pass
- Important Applications CRUD behavior has automated coverage
- Next Action logic has automated coverage
- Test data does not modify the normal development database
- Tests do not depend on execution order
- Tests can be run locally with simple commands

### Completed Verification (2026-09-16)

- `cd api; dotnet test`: 19 passed, 0 failed.
- `cd web; npm run test`: 27 passed across 4 files, 0 failed.
- `cd api; dotnet build`: passed, no warnings or errors.
- `cd web; npm run build`: passed; existing Vite bundle-size warning remains.
- `cd web; npm run lint`: passed.

Tests use isolated SQLite in-memory databases and mocked frontend HTTP transport.
No tests touch the normal development database. See the API and web READMEs
for setup, covered behavior and deliberate exclusions.
