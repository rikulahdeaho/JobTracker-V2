# JobTracker

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Job seekers managing their own job search. Each signed-in user maintains their
own applications, activity history, and next steps. This audience was confirmed
by the project owner during initialization.

## Product Purpose

Help a job seeker answer: Where have I applied? What has happened? What should
I do next? Success means keeping application records useful and current, finding
the next step, and seeing important dates without confusing suggestions with
commitments.

## Operating Context

The current product is a desktop-first, responsive web app. A typical session is
to sign in, add or update an application, record hiring activity, and check Next
Action, Schedule, or Dashboard. Smaller screens use the same web workflows.

Applications hold company and job details, contact information, advertisement
text, and personal notes. Timeline records activity; Next Action derives
suggestions from status, contact history, and dates. Schedule separates recorded
deadlines and interviews from suggested attention.

## Capabilities and Constraints

- Create, read, edit, and delete applications; search, filter, and sort them.
  Company and Job title are the only required fields.
- Track nine statuses: Draft, ToApply, Applied, Interviewing, Assignment, Offer,
  Rejected, Ghosted, and Withdrawn. Users can change status directly; recording
  activity can also advance it. Suggestions never change status automatically.
- Preserve the distinction between saved facts, derived suggestions, and user
  decisions. Ordinary edits do not count as contact. Follow-up eligibility
  depends on contact information and preferences.
- Keep Application due date separate from interview, assignment, and offer dates.
  Keep Job Description separate from personal Notes. Formatting cleanup must
  preserve wording; failed saves must preserve entered values.
- Dashboard and Insights summarize saved data. Current-status summaries are not
  historical response-rate measurements.
- Clerk authenticates users. The API validates sessions and enforces ownership;
  signing in never imports another user's records or legacy demo data.
- Use the existing React, TypeScript, and MUI patterns, with TanStack Query and
  Axios for API state. The ASP.NET Core API uses EF Core, PostgreSQL in production,
  and SQLite locally. Preserve the existing deployment architecture.
- Theme selection works. Settings profile, tracking, and export controls are
  previews. Manual reminder management, snooze, background notifications, and
  general activity editing/deletion are not implemented.
- Mobile, AI autofill, CV analysis, file uploads, calendar/email integrations,
  payments, advanced insights, Kanban, and a browser extension require a separate
  explicit request. A possible future Expo app is not part of current work.
- Follow [AGENTS.md](AGENTS.md) for implementation rules and
  [docs/current-feature.md](docs/current-feature.md) for current scope and
  verification. This record does not expand that scope.

## Brand Commitments

The product name is JobTracker. Preserve established product terms: Applications,
Timeline, Next Action, Schedule, Dashboard, and Insights.

The owner confirmed on 2026-10-05 that JobTracker is a personal job-search CRM
for an individual actively applying. Its identity should feel focused, calm,
slightly technical and purposeful. Avoid a generic B2B SaaS dashboard, HR system
or corporate ATS presentation. Use a recognizable visual language with one
strong accent color; avoid excessive cards, generic KPI dashboards, gradients
and decorative AI-style visuals. Applications, momentum, waiting, next actions,
interviews and progress are the core concepts. The proposed visual direction in
[docs/jobtracker-visual-direction.md](docs/jobtracker-visual-direction.md) records
the owner's selected Search agenda direction, implemented across the web app on
2026-10-05. [DESIGN.md](DESIGN.md) records the extracted shared tokens and visual
rules; [docs/DESIGN.md](docs/DESIGN.md) describes the interface and accessibility
conventions. Dashboard omits Current pipeline and retains its six real summary
counts; stage distribution remains available in Insights.

## Evidence on Hand

- [Product guide](docs/how-it-works.md): current user workflows and limitations.
- [Workflow rules](docs/application-workflow.md): status, contact, timing, and
  date semantics.
- [Current scope and verification](docs/current-feature.md): automated results,
  historical browser coverage, and remaining manual checks.
- [Architecture](docs/architecture.md): system and deployment context.
- [Existing UI documentation](docs/DESIGN.md) and the implemented web app:
  incumbent interface evidence. The images under `docs/ui-references/` are
  historical concepts, not current screenshots or acceptance criteria.

No customer testimonials, adoption metrics, or comparative performance claims
were established in this initialization; do not invent them.

## Product Principles

1. Help users understand each application and decide its next step.
2. Keep facts and hard dates distinct from suggestions; retain user control over
   status decisions.
3. Make basic capture lightweight and preserve optional details and entered work.
4. Protect ownership and keep each user's job search private from other users.
5. Build focused improvements within the documented scope and existing patterns.

## Open Decisions

Specific market differentiation, additional audience segments, and a formal
accessibility standard have not been established. Do not present assumptions
about these as confirmed requirements.
