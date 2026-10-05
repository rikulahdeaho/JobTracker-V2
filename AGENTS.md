# AGENTS.md

## Project

JobTracker is a fullstack job application tracking app.

The mock-data and API-integration milestones are complete. The desktop-first React
web app is deployed on Vercel with an ASP.NET Core API on Railway and Neon PostgreSQL. Clerk authenticates users;
the API validates tokens and enforces ownership. See docs/how-it-works.md for current behavior.

A mobile app may be added later using Expo React Native. The mobile app should use the same API, the same authentication model, and the same database.

## Architecture

```text
React Web ───────┐
                 ├─ ASP.NET Core API ─ PostgreSQL / SQLite local
Expo Mobile ─────┘
```

Authentication: Clerk
ORM: Entity Framework Core  
Frontend hosting: Vercel
API hosting: Railway
Database hosting: Neon PostgreSQL

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
- MUI
- TanStack Query and Axios for API server state
- React Hook Form later for forms
- Zod later for validation

### API

- ASP.NET Core Web API
- C#
- Entity Framework Core
- SQLite locally
- Neon PostgreSQL in production

### Auth

- Clerk is implemented in the frontend and JWT Bearer validation in the API.
- Ownership comes from validated claims; do not restore a dev-user runtime fallback.

## Current Development Priority

Build the app in small, clear slices.

Current implemented flow:

```text
React + MUI + Clerk -> TanStack Query + Axios -> authenticated ASP.NET Core API -> PostgreSQL (production) / SQLite (local)
```

Follow docs/current-feature.md for the current scope. Do not change deployment or add mobile
or advanced features unless explicitly requested.

Completed first milestone:

```text
A clean React + MUI JobTracker prototype that works with mock data.
```

Completed second milestone:

```text
The same UI connected to ASP.NET Core API and database.
```

## Build Order

1. Clean project foundation
2. React Web foundation with MUI
3. Web app with hardcoded/mock data
4. Web CRUD flow with local state
5. Next Action logic in frontend
6. API and database foundation
7. Applications CRUD API
8. Connect Web App to API
9. Clean up data flow
10. Clerk authentication
11. Timeline
12. Reminders and Schedule
13. Dashboard
14. Search, filters, and sorting
15. Polish and documentation
16. Deploy (completed)
17. Mobile later

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
- Keep the current task focused on the scope defined in `docs/current-feature.md`.

## Git Rules

- Do not commit without permission.
- Use conventional commit messages when asked to commit:
  - `feat:`
  - `fix:`
  - `chore:`
  - `docs:`
  - `refactor:`
- Keep commits focused.
- Never include "Generated with Claude", "Generated with Codex", or similar text in commit messages.

## Code Quality

- No unused imports or variables.
- No commented-out code unless specifically requested.
- Prefer small focused functions.
- Keep components focused on one responsibility.
- Avoid unrelated refactoring.
- Do not add “nice to have” features unless explicitly requested.

## TypeScript Rules

- Use strict TypeScript.
- Do not use `any`; use proper types or `unknown`.
- Define types for important data models.
- Define types for API responses once API integration begins.
- Use type inference when obvious.

## React Rules

- Functional components only.
- Use hooks for state and side effects.
- Use MUI as the primary UI component library.
- Keep page components thin when logic starts to grow.
- Keep reusable UI pieces as components.
- Extract reusable calculations into utilities.
- During the mock-data phase, keep data in feature-level `data/` files.
- When API integration begins, keep API calls inside feature-level API modules.
- Do not mix large API logic directly into page components.
- Use TanStack Query only when real API integration begins.

## MUI Rules

- Use MUI components for layout, navigation, cards, lists, tables, dialogs, forms, chips, and buttons.
- Keep styling simple until the feature works.
- Prefer readable layout over heavy visual polish.
- Do not over-engineer the theme in the first phase.
- Add a basic theme only when needed for consistent spacing, colors, and typography.

## ASP.NET Core API Rules

- Do not implement the API until the mock-data web flow is working.
- Use controllers for REST endpoints.
- Keep business logic out of controllers when it grows.
- Use DTOs for create and update requests.
- Do not expose unnecessary internal fields from API responses.
- Use async EF Core methods.
- Resolve UserId from validated Clerk claims and scope every owned query to it.
- Legacy dev-user data stays untouched; never assign it automatically on sign-in.
- Validate input before saving.
- Return appropriate HTTP status codes.

## Database Rules

- Use EF Core migrations for schema changes.
- Do not manually edit production database schema.
- SQLite is acceptable for early local development.
- Neon PostgreSQL is the production database.
- Keep `CreatedAt` and `UpdatedAt` fields updated consistently.
- Do not add advanced database models before the core `JobApplication` flow works.

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
dotnet ef migrations add <MigrationName> --context AppDbContext --output-dir Migrations/Sqlite
dotnet ef database update --context AppDbContext
```

## Testing Expectations

Before saying a task is complete:

- Web should build without TypeScript errors.
- If web routes changed, verify navigation in the browser.
- If frontend state/data flow changed, verify it in the browser.
- API should build without C# errors when API work begins.
- If API endpoints changed, verify them in Swagger or with HTTP requests.
- If frontend API calls changed, verify the browser can load the data.
- Fix build errors before moving on.

## Completed Foundation Milestone (Historical)

The original first milestone required:

- React app starts
- MUI is installed and used
- App layout exists
- Sidebar/topbar navigation works
- Applications page shows mock job applications
- Application details page opens from the list
- Status labels display correctly
- No API, auth, database, or deployment work has been added yet

## Related Docs

Keep longer product and architecture notes in `docs/` and reference them from here when needed.

Use `docs/current-feature.md` as the source of truth for the current task.
