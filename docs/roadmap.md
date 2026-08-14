# JobTracker Roadmap

## Goal

Build JobTracker in small, clear stages.

The first goal is to build the React web app with MUI and hardcoded/mock data. After the web flow feels right, build the ASP.NET Core API with a real database connection and replace mock data with API data.

---

## Current Build Strategy

```text
1. React + MUI Web prototype with mock data
2. Local frontend CRUD flow
3. Next Action logic in frontend
4. ASP.NET Core API + database
5. Replace mock data with API data
6. Add Clerk authentication
7. Add timeline, reminders, dashboard and search
8. Polish, document and deploy
```

---

## Phase 0 — Clean Project Foundation

### Goal

Start from a clean and understandable project structure.

### Tasks

- Clean old experimental code if needed
- Keep repository structure simple
- Create or update README
- Create or update docs
- Add AGENTS.md for Codex/project instructions
- Decide initial UI library: MUI

### Done When

- Repository has a clean structure
- Project direction is clear
- AGENTS.md exists
- docs/ folder exists

---

## Phase 1 — React Web Foundation with MUI

### Goal

Create the frontend app structure without connecting to the backend yet.

### Tasks

- Create React + TypeScript + Vite app in `web/`
- Add MUI
- Add React Router
- Create app layout
- Create Sidebar
- Create Topbar
- Create placeholder pages

### Pages

- Dashboard
- Applications
- Application Details
- Schedule
- Insights
- Settings

### Done When

- React app starts
- Navigation works between main pages
- MUI is installed and used
- Basic app layout exists

---

## Phase 2 — Web App with Hardcoded Data

### Goal

Build the first usable UI flow using mock data only.

No API yet.

### Tasks

- Create `JobApplication` TypeScript type
- Create `ApplicationStatus` type
- Create `mockApplications.ts`
- Show applications in Applications page
- Show readable status labels
- Create ApplicationDetailsPage
- Route from list to details page
- Show job title, company, status, notes, deadline, source and job URL

### Initial Mock Data

Use realistic example companies:

- Reaktor
- Wolt
- Nitor
- Solita
- Vincit
- Futurice
- Smartly.io

### Done When

- Applications page shows mock data
- Details page opens from application list
- Status labels display correctly
- The web app feels like a real JobTracker prototype

---

## Phase 3 — Web CRUD Flow with Local State

### Goal

Validate the UI and product flow before adding backend complexity.

### Tasks

- Add application form/modal
- Edit application
- Delete application
- Add status dropdown
- Add notes field
- Add basic form validation
- Keep state locally or in a simple mock service

### First Form Fields

- Company
- Job title
- Job URL
- Status
- Applied date
- Deadline
- Location
- Source
- Salary range
- Notes
- Job description

### Done When

- A user can add applications from the UI
- A user can edit applications from the UI
- A user can delete applications from the UI
- All of this works without API or database

---

## Phase 4 — Next Action Logic in Frontend

### Goal

Make the app more useful than a basic CRUD list.

### Tasks

- Create Next Action helper
- Show Next Action in Applications list
- Add Needs follow-up state
- Add Ghosted logic
- Show simple dashboard summary from mock data

### Example Rules

```text
Draft -> Finish application
ToApply -> Apply
Applied + 14 days without activity -> Follow up
Interviewing -> Prepare interview
Assignment -> Submit assignment
Offer -> Respond to offer
Rejected -> No action
Ghosted -> No action
```

### Done When

- The frontend can suggest what should happen next for each application
- Applications list shows next actions
- Dashboard can summarize mock data

---

## Phase 5 — API and Database Foundation

### Goal

Create the backend only after the frontend flow is clear.

The API should be connected to a real database from the beginning.

### Tasks

- Create ASP.NET Core Web API in `api/`
- Add EF Core
- Choose local DB: SQLite or PostgreSQL
- Create JobApplication model
- Create ApplicationStatus enum
- Create AppDbContext
- Add connection string
- Create first migration
- Run database update
- Enable Swagger/OpenAPI
- Enable CORS for Vite frontend

### First Models

- JobApplication
- ApplicationStatus

### Later Models

- TimelineEvent
- Reminder
- Contact

### Done When

- API starts
- Swagger works
- JobApplications table exists in the database

---

## Phase 6 — Applications CRUD API

### Goal

Build the real backend API for job applications.

### Endpoints

```text
GET    /api/applications
GET    /api/applications/{id}
POST   /api/applications
PUT    /api/applications/{id}
DELETE /api/applications/{id}
```

### Tasks

- Add DTOs
- Add basic validation
- Add CreatedAt / UpdatedAt handling
- Use `dev-user` as temporary UserId
- Test endpoints in Swagger

### Done When

- A job application can be created through Swagger
- A job application can be read through Swagger
- A job application can be updated through Swagger
- A job application can be deleted through Swagger

---

## Phase 7 — Connect Web App to API

### Goal

Replace mock data with real API data.

### Tasks

- Add TanStack Query
- Create `apiClient.ts`
- Create `applicationsApi.ts`
- Fetch applications from backend
- Fetch application details by id
- Add loading states
- Add error states
- Connect create/edit/delete UI to API
- Invalidate queries after mutations

### Done When

- The same UI that worked with mock data now works with the ASP.NET Core API and database
- A job application created through API appears in the React UI
- Add/edit/delete works against the database

---

## Phase 8 — Clean Up Data Flow

### Goal

Make the frontend/backend boundary clean.

### Tasks

- Remove unused mock-only logic
- Keep mock data only for seed/demo use
- Align frontend types with API DTOs
- Make status handling consistent
- Move API logic into feature-level API files
- Keep UI components separate from API logic

### Done When

- The app has a clean data flow: React -> API -> DB

---

## Phase 9 — Details and Status Management

### Goal

Make individual application management feel like a real product feature.

### Tasks

- Improve ApplicationDetailsPage
- Add status dropdown connected to API
- Show notes and job description
- Show deadline
- Show source
- Add Open job URL action
- Update UpdatedAt when changes are made

### Done When

- A single job application can be managed from its own details page using real backend data

---

## Phase 10 — Clerk Authentication

### Goal

Add user-specific data and protect the application.

### Frontend Tasks

- Add ClerkProvider
- Add Sign in
- Add Sign up
- Add protected routes
- Show user info in topbar

### Backend Tasks

- Accept Bearer token from frontend
- Validate Clerk JWT in ASP.NET Core API
- Read Clerk userId from token claims
- Save UserId to JobApplication
- Return only the logged-in user's applications

### Done When

- Each user can only see their own job applications

---

## Phase 11 — Timeline

### Goal

Show the history of each job application.

### Tasks

- Create TimelineEvent model
- Add TimelineEvent migration
- Add endpoint for creating timeline events
- Show timeline on details page
- Automatically create timeline events when status changes

### Example Timeline Events

- Application created
- Application sent
- Status changed to Interviewing
- Follow-up sent
- Rejected
- Offer received

### Done When

- The details page shows the event history of an application

---

## Phase 12 — Reminders and Schedule

### Goal

Let the user track follow-ups, deadlines and interviews.

### Tasks

- Create Reminder model
- Add create reminder functionality
- Add complete reminder functionality
- Create Schedule page
- Group reminders by Overdue, Today and Upcoming

### Done When

- Follow-ups, deadlines and interview reminders appear on the Schedule page

---

## Phase 13 — Dashboard

### Goal

Show the current job search situation at a glance.

### Endpoint

```text
GET /api/dashboard/summary
```

### Dashboard Data

- Total applications
- Active applications
- Interviews
- Offers
- Needs follow-up
- Ghosted
- Upcoming actions
- Recent activity

### Done When

- The dashboard shows real data from the API

---

## Phase 14 — Search, Filters and Sorting

### Goal

Make the Applications page usable with a larger amount of data.

### Tasks

- Search by company or job title
- Filter by status
- Filter by needs follow-up
- Sort by applied date
- Sort by deadline
- Sort by last updated

### Suggested Query Format

```text
GET /api/applications?search=react&status=Applied&sort=deadline
```

### Done When

- Applications can be searched, filtered and sorted efficiently

---

## Phase 15 — Polish and Documentation

### Goal

Make the MVP portfolio-ready.

### Tasks

- Add empty states
- Add error states
- Add loading skeletons
- Add validation messages
- Add seed data
- Update README
- Add screenshots
- Add API endpoint documentation
- Add architecture documentation

### README Sections

- Project overview
- Tech stack
- Features
- Screenshots
- Architecture
- How to run locally
- API endpoints
- Roadmap

### Done When

- The project is clear, presentable and understandable for a recruiter or developer

---

## Phase 16 — Deployment

### Goal

Deploy the project publicly.

### Deployment Order

1. Neon PostgreSQL
2. Railway ASP.NET Core API
3. Vercel React frontend
4. Clerk production keys
5. CORS and environment variables

### Environment Variables

Frontend:

```text
VITE_API_BASE_URL
VITE_CLERK_PUBLISHABLE_KEY
```

Backend:

```text
DATABASE_URL
ConnectionStrings__DefaultConnection
CLERK_AUTHORITY
CLERK_AUDIENCE
CORS_ALLOWED_ORIGINS
```

### Done When

- Authentication, CRUD, dashboard and reminders work in production

---

## Phase 17 — Mobile Later

### Goal

Keep the architecture ready for a future mobile app.

### Future Structure

```text
mobile/
  Expo + TypeScript
  @clerk/expo
  same ASP.NET Core API
  same PostgreSQL database
```

### Mobile MVP

- Login
- List active applications
- Change status
- Add note
- Complete reminder

### Done When

- The mobile app uses the same auth, API and database as the web app

---

## Final Build Order

```text
0. Clean project foundation
1. React Web foundation with MUI
2. Web app with hardcoded/mock data
3. Web CRUD flow with local state
4. Next Action logic in frontend
5. API and database foundation
6. Applications CRUD API
7. Connect Web App to API
8. Clean up data flow
9. Details and status management
10. Clerk authentication
11. Timeline
12. Reminders / Schedule
13. Dashboard
14. Search / filters / sort
15. Polish + docs
16. Deploy
17. Mobile later
```
