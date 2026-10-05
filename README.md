# JobTracker

JobTracker helps you keep track of job applications, hiring activity and the next
step for each opportunity.

The web app is deployed on **Vercel**, with an **ASP.NET Core API on Railway** and
**Neon PostgreSQL** for persistence. Clerk handles sign-in, and each user sees
only their own applications. Local development uses SQLite.

## What it does

- Save, edit and delete applications; search, filter and sort them.
- Track nine hiring statuses and a Timeline of recorded activity.
- Suggest next actions using contact history and recorded dates.
- Show interviews, deadlines and suggested follow-ups in Schedule.
- Summarize the job search in Dashboard and Insights.
- Support light/dark themes and a responsive web layout.

Notifications, manual reminder management and mobile are not implemented.
Settings profile/tracking/export controls are previews.

## Start here

| Goal | Guide |
| --- | --- |
| Understand the product | [How JobTracker works](docs/how-it-works.md) |
| Browse all documentation | [Documentation index](docs/README.md) |
| Run locally | [API setup](api/README.md#run-locally) and [web setup](web/README.md#local-setup) |
| Understand the system and deployment | [Architecture](docs/architecture.md) |
| Check quality and remaining work | [Verification](docs/current-feature.md#verification) and [roadmap](docs/roadmap.md) |

## Stack and repository

| Directory | Contents |
| --- | --- |
| `web/` | React, TypeScript, Vite, MUI, React Router, TanStack Query and Axios. |
| `api/` | .NET 10 API, EF Core, SQLite/PostgreSQL migrations and xUnit tests. |
| `docs/` | Product behavior, architecture, workflow rules and maintenance guides. |

Frontend tests use Vitest and React Testing Library. The API validates Clerk JWTs
and enforces ownership. Exact test results, browser coverage and remaining checks
are maintained in the [verification document](docs/current-feature.md#verification).
