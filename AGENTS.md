# AGENTS.md

## Project

JobTracker is a fullstack job application tracking app.

The current product is a desktop-first React web app connected to an ASP.NET Core Web API. The API owns the business logic and stores data in a relational database.

A mobile app may be added later using Expo React Native. The mobile app should use the same API, the same authentication model, and the same database.

## Architecture

```text
React Web ───────┐
                 ├─ ASP.NET Core API ─ PostgreSQL / SQLite local
Expo Mobile ─────┘
```

Auth target: Clerk
ORM: Entity Framework Core
Frontend hosting later: Vercel
API hosting later: Railway
Database hosting later: Neon PostgreSQL

## Repository Structure

```text
jobtracker/
  api/      ASP.NET Core Web API
  web/      React + TypeScript + Vite app
  mobile/   Future Expo app
  db/       Seed data and database notes
  docs/     Project documentation
```

## Current Stack

### Web

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- React Hook Form
- Zod

### API

- ASP.NET Core Web API
- C#
- Entity Framework Core
- SQLite locally at first
- PostgreSQL later

### Auth

- Clerk later
- Do not implement auth until the basic CRUD flow works

## Current Development Priority

Build the app in small vertical slices.

Current target flow:

```text
React -> ASP.NET Core API -> SQLite DB
```

Do not jump ahead to advanced features before the current slice works.

## MVP Features

The MVP should include:

- Applications CRUD
- Application details page
- Status management
- Next Action logic
- Timeline
- Reminders
- Schedule page
- Dashboard summary
- Search, filters, and sorting
- Clerk authentication

## Not in MVP

Do not implement these unless explicitly asked:

- Mobile app
- AI autofill
- CV analyzer
- File uploads
- Calendar integration
- Email integration
- Payments
- Advanced insights
- Kanban board
- Browser extension

## Working Rules

- Be concise and direct.
- Explain non-obvious decisions briefly.
- Ask before large refactors or architectural changes.
- Do not add features outside the current task.
- Do not delete files without clarification.
- Make minimal changes to accomplish the task.
- Preserve existing patterns in the codebase.
- If something fails after 2-3 attempts, stop and explain the issue instead of trying random fixes.

## Git Rules

- Do not commit without permission.
- Use conventional commit messages when asked to commit:
  - `feat:`
  - `fix:`
  - `chore:`
  - `docs:`
  - `refactor:`
- Keep commits focused.
- Never include "Generated with Claude", "Generated with Codex", or similar text in commits.

## Code Quality

- No unused imports or variables.
- No commented-out code unless specifically requested.
- Prefer small focused functions.
- Keep components focused on one responsibility.
- Avoid unrelated refactoring.

## TypeScript Rules

- Use strict TypeScript.
- Do not use `any`; use proper types or `unknown`.
- Define types for API responses and important data models.
- Use type inference when obvious.

## React Rules

- Functional components only.
- Use hooks for state and side effects.
- Use TanStack Query for API server state.
- Keep API calls inside feature-level API modules.
- Keep reusable UI pieces as components.
- Do not mix large API logic directly into page components.

## ASP.NET Core API Rules

- Use controllers for REST endpoints.
- Keep business logic out of controllers when it grows.
- Use DTOs for create and update requests.
- Do not expose unnecessary internal fields from API responses.
- Use async EF Core methods.
- Keep user-specific data ready through `UserId`, even before Clerk is implemented.
- Validate input before saving.
- Return appropriate HTTP status codes.

## Database Rules

- Use EF Core migrations for schema changes.
- Do not manually edit production database schema.
- SQLite is acceptable for early local development.
- PostgreSQL is the target production database.
- Keep `CreatedAt` and `UpdatedAt` fields updated consistently.

## Commands

### Web

```bash
cd web
npm install
npm run dev
npm run build
npm run lint
```

### API

```bash
cd api/JobTracker.Api
dotnet run
dotnet build
dotnet ef migrations add <MigrationName>
dotnet ef database update
```

## Testing Expectations

Before saying a task is complete:

- Web should build without TypeScript errors.
- API should build without C# errors.
- If API endpoints changed, verify them in Swagger or with HTTP requests.
- If frontend API calls changed, verify the browser can load the data.
- Fix build errors before moving on.

## Current Known Milestone

The first milestone is complete when:

- React app starts
- ASP.NET Core API starts
- SQLite database exists
- Swagger CRUD works
- React lists job applications from the API

## Related Docs

Keep longer product and architecture notes in `docs/` and reference them from here when needed.
