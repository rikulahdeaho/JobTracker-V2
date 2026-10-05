# JobTracker documentation

JobTracker keeps job applications, hiring activity and upcoming actions in one
place. The web app is deployed on Vercel, with an ASP.NET Core API on Railway and
a Neon PostgreSQL database. Clerk gives each user access to their own data.

**Start with [How JobTracker works](how-it-works.md)** for a short product overview.

| I want to… | Read |
| --- | --- |
| Understand the pages and daily workflow | [How it works](how-it-works.md) |
| Understand Next Action, Timeline and Schedule rules | [Application workflow](application-workflow.md) |
| Understand the system, data and deployment settings | [Architecture](architecture.md) |
| Run the project locally | [Web setup](../web/README.md#local-setup) and [API setup](../api/README.md#run-locally) |
| Apply or create database migrations | [Database migrations](database-migrations.md) |
| Check current scope, test results and remaining checks | [Current feature](current-feature.md) |
| See what is finished and what may come next | [Roadmap](roadmap.md) |
| Follow the existing UI style | [Design](DESIGN.md) |

These documents describe the current implementation, reviewed on 2026-10-05.
Future ideas live in the roadmap. Test results and manual verification limits live
in the current-feature document so they do not need to be repeated across guides.
