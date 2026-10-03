# Jobtracker

JobTracker is a job application tracker built with React, TypeScript and an ASP.NET Core API. Applications are persisted in local SQLite through Entity Framework Core.

## Documentation

- [How JobTracker works](docs/how-it-works.md) — current pages, workflow rules, data flow, API, local setup and verification.
- [Web setup and tests](web/README.md)
- [API setup, endpoints and tests](api/README.md)
- [Current feature](docs/current-feature.md)
- [Target architecture](docs/architecture.md)
- [Roadmap](docs/roadmap.md)

## Tech Stack

- React + TypeScript + Vite
- MUI + React Router
- ASP.NET Core Web API
- SQLite for local development
- EF Core
- TanStack Query + Axios
- Clerk authentication + ASP.NET Core JWT Bearer validation
- xUnit + WebApplicationFactory, Vitest + React Testing Library

Applications CRUD uses the API. Search, filters, sorting, Next Action, Dashboard
and Insights use frontend calculations based on API application data. Timeline
uses persisted workflow events; Schedule derives reminders from explicit dates
and meaningful contact history. See [workflow rules](docs/application-workflow.md).
Theme preferences are saved in localStorage.

Clerk sign-in protects the workspace. The API derives ownership from validated tokens
and restricts applications and their events to the current user. Query caches are
isolated per user/session. Existing `dev-user` records are not automatically transferred.

## Current features

- Application list, details, create, edit, delete and nine application statuses.
- Search, status/view filters and sorting.
- Persisted workflow events and Timeline: sent applications, follow-ups, interviews,
  assignments and offers, including automatic status-change history.
- Next Action suggestions and derived reminders based on recorded contact/stage dates.
- Dashboard summaries, Schedule and Insights calculated from the user's API data.
- Clerk sign-in/sign-out and current account display; light/dark theme with persistence.
- Backend ownership/JWT/workflow tests and frontend logic, auth/cache and CRUD tests.

Reminders currently have no separate database table, manual CRUD or completion action.
Profile/tracking preferences and export controls in Settings are previews. Notifications,
production PostgreSQL, deployment and mobile remain future work.

## Local configuration and verification

Set `VITE_API_BASE_URL` and `VITE_CLERK_PUBLISHABLE_KEY` in `web/.env.local`.
Store backend `Clerk:Authority` and `Clerk:AuthorizedParties` in
`api/JobTracker.Api/appsettings.Development.json`. Both files are ignored by Git.
After configuration and migrations, start the API with `dotnet run` from
`api/JobTracker.Api` and Vite with `npm run dev` from `web`.
See the setup guides above for complete instructions.

See [current verification results and remaining checks](docs/current-feature.md#release-preparation-2026-10-03).

Historical verification on 2026-09-17: 57 backend tests and 61 frontend tests passed;
both builds and frontend lint passed. Real Clerk sign-in, API reads, page navigation,
search, reload, themes and sign-out were verified in the browser. A real two-account
A -> B -> A session cycle verified separate lists/reminders and blocked direct foreign
Details links in both directions. Browser creation, editing and workflow event writes
passed; test records were retained at the user's request, so browser deletion was not verified in that run. A disposable-record deletion
was verified on 2026-10-03; see the current results above. Automated tests cover ownership isolation and CRUD. See the
[detailed verification scope](docs/current-feature.md). Vite reports a bundle-size warning.

## Project Structure

- `web/` — React web application
- `api/` — ASP.NET Core Web API
- `db/` — reserved for future database notes and seed data; no tracked files yet.
- `docs/` — project documentation
- `mobile/` — planned Expo mobile app; no tracked implementation yet.
