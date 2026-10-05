# Roadmap

JobTracker's web application is deployed. The current focus is keeping the
implemented product clear and reliable; a new feature needs its own agreed scope.

## Delivered

| Area | Current result |
| --- | --- |
| Application management | Create, read, edit and delete; nine statuses and shared Add/Edit form. |
| Authentication | Clerk sessions, API ownership checks and isolated frontend caches. |
| Workflow | Persisted Timeline events, contact preferences and derived Next Action. |
| Schedule | Recorded commitments and suggested follow-up/status-review dates. |
| Overview | Dashboard and Insights calculated from the user's applications. |
| Finding applications | Search, status/view filters and sorting. |
| Appearance | Responsive web layout and persistent light/dark theme. |
| Deployment | Vercel web, Railway API and Neon PostgreSQL; SQLite for local development. |

The earlier mock-data and API-integration milestones are complete. Their original
step-by-step build plan has been replaced by the current [architecture](architecture.md).

## Remaining quality work

- Finish the native date/datetime and workflow browser checks listed in
  [current feature](current-feature.md#remaining-manual-checks).
- Consider reducing the frontend bundle; the build currently reports a size warning.
- Remove inactive mock helpers when a separate cleanup is agreed.

## Possible future work

These are options, not committed milestones or a delivery schedule.

| Area | Current gap or possible addition |
| --- | --- |
| Settings | Saved profile/tracking preferences and data export; current controls are previews. |
| Reminders | Manual reminder creation, completion, snooze and notifications. |
| Activity history | Individual event corrections/cancellations and richer completion states. |
| Application documents | CV versions, application-specific CV selection and cover letters. |
| Mobile | An Expo client using the same API, authentication and database. |

File uploads, AI features, email/calendar integration, payments, Kanban and a
browser extension are outside the current scope. The current product does not
promise these features.
