using JobTracker.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<JobApplication> JobApplications => Set<JobApplication>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var application = modelBuilder.Entity<JobApplication>();

        application.HasKey(item => item.Id);
        application.Property(item => item.UserId).IsRequired();
        application.Property(item => item.CompanyName).IsRequired();
        application.Property(item => item.JobTitle).IsRequired();
        application.Property(item => item.Status).HasConversion<string>().IsRequired();
        application.HasIndex(item => item.UserId);

        // SQLite does not preserve DateTime.Kind; restore UTC when reading timestamps.
        application.Property(item => item.CreatedAt).HasConversion(
            value => value,
            value => DateTime.SpecifyKind(value, DateTimeKind.Utc));
        application.Property(item => item.UpdatedAt).HasConversion(
            value => value,
            value => DateTime.SpecifyKind(value, DateTimeKind.Utc));
    }
}
