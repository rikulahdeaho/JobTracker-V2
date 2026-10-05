# Database migrations

The API uses one shared data model and two provider-specific EF Core migration
series. **Apply the series matching the target database.** API startup does not
apply migrations or seed records.

| `DatabaseProvider` | Context | Migration directory in `api/JobTracker.Api` |
| --- | --- | --- |
| `Sqlite` (default) | `AppDbContext` | `Migrations/Sqlite` |
| `Postgres` or `PostgreSQL` | `PostgresAppDbContext` | `Migrations/Postgres` |

PostgresAppDbContext inherits the shared model configuration. Each context selects
its own migrations and snapshot; controllers still receive AppDbContext.

## Before running commands

Use .NET 10 and the repository's pinned EF tool. Start at the repository root,
then enter the API directory so the local tool manifest is discovered:

```powershell
cd api
dotnet tool restore
dotnet build JobTracker.sln
```

Run all remaining commands from `api/`. Build after code changes
before using `--no-build`. Authentication configuration must be available when
starting the API; see [API setup](../api/README.md#clerk-configuration).

## Update local SQLite

```powershell
dotnet ef database update --no-build --project JobTracker.Api --context AppDbContext -- --DatabaseProvider=Sqlite '--ConnectionStrings:DefaultConnection=Data Source=JobTracker.Api/jobtracker.db'
```

The explicit provider and connection string override settings left in the shell.
The path targets the usual local database from the API directory. Stop the
local API before updating its database.

## Update Neon PostgreSQL

Set the connection string in the terminal running the migration. Railway's
environment variables are not automatically present in a local terminal.

```powershell
$env:ConnectionStrings__DefaultConnection = '<Neon Npgsql connection string>'
dotnet ef database update --no-build --project JobTracker.Api --context PostgresAppDbContext -- --DatabaseProvider=Postgres
```

Use the actual target's Npgsql connection string, for example:

```text
Host=<host>;Database=<database>;Username=<user>;Password=<password>;SSL Mode=VerifyFull
```

This command changes that database. Keep credentials outside committed files.
The initial PostgreSQL migration expects an empty schema; inspect any pre-existing
tables before its first application. Later runs apply only pending migrations.

The running Railway API needs `DatabaseProvider=Postgres` and
`ConnectionStrings__DefaultConnection` configured separately. See
[deployment configuration](architecture.md#deployment-architecture).

## Add a model change

Generate a matching migration for each provider. Replace `DescribeModelChange`
with a descriptive name. The PostgreSQL design connection below is a placeholder
for generation; it does not need a running server.

```powershell
dotnet ef migrations add DescribeModelChange --no-build --project JobTracker.Api --context AppDbContext --output-dir Migrations/Sqlite -- --DatabaseProvider=Sqlite '--ConnectionStrings:DefaultConnection=Data Source=JobTracker.Api/jobtracker.db'
dotnet ef migrations add DescribeModelChange --no-build --project JobTracker.Api --context PostgresAppDbContext --output-dir Migrations/Postgres -- --DatabaseProvider=Postgres '--ConnectionStrings:DefaultConnection=Host=localhost;Database=jobtracker_migration_design;Username=design'
dotnet build JobTracker.sln
dotnet test JobTracker.sln
```

Build the changed model before generating, as described above. Review both
generated migrations and snapshots, then rebuild before applying them.
Do not manually change the production schema or regenerate the existing initial
migrations.

## Existing data and history

SQLite keeps its original migration IDs:

| Migration | Purpose |
| --- | --- |
| `20260916090614_InitialCreate` | Applications table. |
| `20260916123052_ApplicationWorkflow` | Events and known creation/sent-date backfill. |
| `20261002084434_ApplicationContactPreferences` | Method, contact fields and follow-up preference. |

Moving these files into `Migrations/Sqlite` did not reset migration history.
The workflow backfill records only known creation and applied dates; it never
guesses interviews, follow-ups or past status transitions.

PostgreSQL has its own `20261003121154_InitialCreate`, which creates the complete
current schema. It does not import SQLite records or run SQLite's historical
backfill. There is no automatic data copy between providers.

Preserve existing databases and `__EFMigrationsHistory`. Legacy `dev-user`
records retain their owner and remain invisible to signed-in Clerk users.

## What tests verify

The backend suite applies migrations to isolated SQLite databases, checks
historical upgrades and verifies each provider's migration/snapshot selection.
It also checks pending model changes and generates PostgreSQL SQL offline.

These tests do not connect to Neon or prove that migrations were applied to a live
PostgreSQL database. Production verification is a separate check.
