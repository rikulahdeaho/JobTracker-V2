# JobTracker Architecture

This document describes the target architecture and staged implementation plan.
For the current API-connected web app, local SQLite persistence and testing,
see [Miten sovellus toimii nyt](how-it-works.md).

## Overview

JobTracker is a fullstack job application tracking app.

The architecture is designed so that the web app, and later a mobile app, can use the same backend API and the same database.

The first implementation milestone is a React + MUI web prototype using hardcoded/mock data. The backend is added after the frontend flow is validated.

---

## High-Level Architecture

```text
React Web ───────┐
                 ├─ ASP.NET Core API ─ PostgreSQL
Expo Mobile ─────┘
```

### Main Parts

- `web/` — React + TypeScript + Vite web app
- `api/` — ASP.NET Core Web API
- `db/` — seed data and database notes
- `docs/` — project documentation
- `mobile/` — future Expo React Native app

---

## Target Stack

### Web

- React
- TypeScript
- Vite
- React Router
- MUI
- TanStack Query later for API server state
- React Hook Form later for forms
- Zod later for validation

### API

- ASP.NET Core Web API
- C#
- Entity Framework Core
- Controllers for REST endpoints
- DTOs for create/update requests
- Swagger/OpenAPI for endpoint testing

### Database

- SQLite or PostgreSQL for local development
- PostgreSQL for production
- Neon PostgreSQL for deployment later
- EF Core migrations for schema changes

### Authentication

- Clerk later
- Clerk on web frontend
- Clerk JWT validation in ASP.NET Core API
- API reads Clerk user id from token claims
- User-owned data is filtered by `UserId`

### Deployment

- Frontend: Vercel
- API: Railway
- Database: Neon PostgreSQL

---

## Repository Structure

```text
jobtracker/
  AGENTS.md
  README.md

  web/
    AGENTS.md
    src/
      app/
      components/
      features/
      lib/

  api/
    AGENTS.md
    JobTracker.Api/
      Controllers/
      Data/
      Models/
      DTOs/
      Services/

  db/
    seed/
    notes/

  docs/
    roadmap.md
    architecture.md
    current-feature.md

  mobile/
    # Future Expo app
```

---

## Data Flow by Phase

## Phase A — Mock Data Frontend

The first milestone does not use an API or database.

```text
React + MUI UI -> mockApplications.ts
```

Purpose:

- Build the UI structure first
- Validate navigation
- Validate application list and detail views
- Validate status labels
- Validate local CRUD flow
- Validate Next Action logic

No API, auth, database, or deployment work should be added during this phase.

---

## Phase B — Backend with Database

After the web flow works, the API is created with a real database connection.

```text
Swagger / HTTP client -> ASP.NET Core API -> EF Core -> SQLite/PostgreSQL
```

Purpose:

- Create real JobApplication model
- Create ApplicationStatus enum
- Create AppDbContext
- Create EF migration
- Test CRUD endpoints in Swagger
- Confirm database table exists

---

## Phase C — Web Connected to API

After the API works, the frontend mock data is replaced with API data.

```text
React Web -> TanStack Query -> API client -> ASP.NET Core API -> EF Core -> DB
```

Purpose:

- Fetch real applications from backend
- Fetch single application details
- Create applications from UI
- Edit applications from UI
- Delete applications from UI
- Invalidate queries after mutations
- Add loading and error states

---

## Phase D — Authenticated User Data

After CRUD works, Clerk authentication is added.

```text
React Web -> Clerk token -> ASP.NET Core API -> validate JWT -> UserId filter -> DB
```

Purpose:

- Protect frontend routes
- Send Bearer token to API
- Validate Clerk JWT in backend
- Store `UserId` on user-owned data
- Return only the logged-in user's applications

---

## Core Domain Model

## JobApplication

Represents one job application in the user's job search pipeline.

Suggested fields:

```text
Id
UserId
CompanyName
JobTitle
JobUrl
Location
Source
Status
AppliedDate
Deadline
SalaryRange
Notes
JobDescription
CreatedAt
UpdatedAt
```

## ApplicationStatus

Suggested statuses:

```text
Draft
ToApply
Applied
Interviewing
Assignment
Offer
Rejected
Ghosted
Withdrawn
```

## Later Models

### TimelineEvent

Represents a historical event for a job application.

Examples:

- Application created
- Application sent
- Status changed
- Follow-up sent
- Interview scheduled
- Offer received
- Rejected

### Reminder

Represents a follow-up, deadline, interview or other scheduled action.

Examples:

- Follow up after 14 days
- Prepare for interview
- Submit assignment
- Respond to offer

### Contact

Represents a recruiter, hiring manager or other person related to an application.

---

## API Design

## Applications Endpoints

```text
GET    /api/applications
GET    /api/applications/{id}
POST   /api/applications
PUT    /api/applications/{id}
DELETE /api/applications/{id}
```

## Future Endpoints

```text
GET    /api/dashboard/summary

GET    /api/applications/{id}/timeline
POST   /api/applications/{id}/timeline

GET    /api/reminders
POST   /api/reminders
PUT    /api/reminders/{id}
DELETE /api/reminders/{id}
```

## Query Examples

```text
GET /api/applications?search=react
GET /api/applications?status=Applied
GET /api/applications?search=react&status=Applied&sort=deadline
```

---

## Frontend Architecture

## Suggested Structure

```text
web/src/
  app/
    App.tsx
    router.tsx
    theme.ts

  components/
    layout/
      AppLayout.tsx
      Sidebar.tsx
      Topbar.tsx
    ui/

  features/
    applications/
      api/
      components/
      data/
      pages/
      types/
      utils/

    dashboard/
    schedule/
    insights/

  lib/
    apiClient.ts
```

## Frontend Rules

- Keep page components thin when logic grows
- Keep reusable UI in components
- Keep reusable calculations in utils
- Keep mock data in feature-level `data/` folders
- Keep API calls in feature-level `api/` folders once API integration begins
- Use MUI for layout, navigation, cards, lists, tables, dialogs, chips and forms
- Use TanStack Query only when API integration begins

---

## Backend Architecture

## Suggested Structure

```text
api/JobTracker.Api/
  Controllers/
  Data/
    AppDbContext.cs
  Models/
    JobApplication.cs
    ApplicationStatus.cs
  DTOs/
    CreateJobApplicationRequest.cs
    UpdateJobApplicationRequest.cs
    JobApplicationResponse.cs
  Services/
```

## Backend Rules

- Use controllers for REST endpoints
- Use DTOs for create/update requests
- Use async EF Core methods
- Keep controllers simple
- Move business logic into services when controller logic grows
- Validate required fields before saving
- Return appropriate HTTP status codes
- Use `dev-user` temporarily until Clerk auth is implemented

---

## Database Architecture

## Local Development

Use either:

```text
SQLite
```

or:

```text
PostgreSQL
```

SQLite is acceptable for early local development because it is fast and simple.

PostgreSQL is the target production database.

## Production

Target production database:

```text
Neon PostgreSQL
```

## Migration Rules

- Use EF Core migrations
- Do not manually edit production database schema
- Do not add advanced database models before the core JobApplication flow works

---

## Auth Architecture

Authentication is added after the basic CRUD flow works.

## Frontend

- Add ClerkProvider
- Add sign in and sign up
- Protect routes
- Get Clerk token for API requests

## Backend

- Accept Bearer token
- Validate Clerk JWT
- Read user id from token claims
- Store user id as `UserId`
- Filter all user-owned queries by `UserId`

## Temporary Development User

Before Clerk:

```text
UserId = "dev-user"
```

This allows backend data modeling to stay ready for user-specific data without implementing auth too early.

---

## Deployment Architecture

## Deployment Order

1. Create Neon PostgreSQL database
2. Deploy ASP.NET Core API to Railway
3. Deploy React frontend to Vercel
4. Add Clerk production keys
5. Configure CORS and environment variables

## Frontend Environment Variables

```text
VITE_API_BASE_URL
VITE_CLERK_PUBLISHABLE_KEY
```

## Backend Environment Variables

```text
DATABASE_URL
ConnectionStrings__DefaultConnection
CLERK_AUTHORITY
CLERK_AUDIENCE
CORS_ALLOWED_ORIGINS
```

---

## Key Architecture Principle

Build in this order:

```text
1. Make the web UI work with hardcoded data
2. Make the frontend CRUD flow feel right
3. Build the API with a real database
4. Replace mock data with API data
5. Add auth and user-specific data
6. Add advanced features
```

Do not start with authentication, deployment, mobile, or advanced database modeling.

The architecture should stay simple until the core JobApplication flow works.
