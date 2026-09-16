# Jobtracker

JobTracker is a job application tracker built with React, TypeScript and an ASP.NET Core API. Applications are persisted in local SQLite through Entity Framework Core.

## Documentation

- [Miten sovellus toimii nyt](docs/how-it-works.md) — suomenkielinen ohje sivuista, datavirrasta, API:sta, käynnistyksestä ja testeistä.
- [Web setup and tests](web/README.md)
- [API setup, endpoints and tests](api/README.md)
- [Current feature](docs/current-feature.md)
- [Target architecture](docs/architecture.md)
- [Roadmap](docs/roadmap.md)

## Tech Stack

- React + TypeScript + Vite
- ASP.NET Core Web API
- SQLite for local development
- EF Core
- TanStack Query + Axios
- xUnit + WebApplicationFactory, Vitest + React Testing Library

Applications CRUD uses the API. Search, filters, sorting, Next Action, Dashboard
and Insights use frontend calculations based on API application data. Timeline
and Schedule reminders remain frontend-derived previews without separate persistence.
Theme preferences are saved in localStorage.

Authentication is not implemented; all API requests use the temporary `dev-user`.
Clerk, production PostgreSQL, deployment and mobile remain future work.

## Project Structure

- `web/` — React web application
- `api/` — ASP.NET Core Web API
- `db/` — database notes, seed data and schema docs
- `docs/` — project documentation
- `mobile/` — future Expo mobile app
