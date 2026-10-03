using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Data;

// A distinct context type gives PostgreSQL its own migrations and model snapshot.
public sealed class PostgresAppDbContext(DbContextOptions<PostgresAppDbContext> options)
    : AppDbContext(options);
