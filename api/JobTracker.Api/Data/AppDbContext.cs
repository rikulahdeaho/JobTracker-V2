using JobTracker.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected AppDbContext(DbContextOptions options) : base(options) { }

    public DbSet<JobApplication> JobApplications => Set<JobApplication>();

    public DbSet<ApplicationEvent> ApplicationEvents => Set<ApplicationEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var workflowEvent = modelBuilder.Entity<ApplicationEvent>();
        workflowEvent.HasKey(item => item.Id);
        workflowEvent.Property(item => item.Id).ValueGeneratedNever();
        workflowEvent.Property(item => item.Type).HasConversion<string>();
        workflowEvent.Property(item => item.FromStatus).HasConversion<string>();
        workflowEvent.Property(item => item.ToStatus).HasConversion<string>();
        workflowEvent.Property(item => item.Note).HasMaxLength(4000);
        workflowEvent.HasIndex(item => new { item.ApplicationId, item.OccurredAt });
        workflowEvent.Property(item => item.OccurredAt).HasConversion(
            value => value, value => DateTime.SpecifyKind(value, DateTimeKind.Utc));
        workflowEvent.Property(item => item.CreatedAt).HasConversion(
            value => value, value => DateTime.SpecifyKind(value, DateTimeKind.Utc));
        workflowEvent.Property(item => item.DueAt).HasConversion(
            value => value, value => value.HasValue ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc) : (DateTime?)null);
        modelBuilder.Entity<JobApplication>().HasMany(item => item.Events).WithOne()
            .HasForeignKey(item => item.ApplicationId).OnDelete(DeleteBehavior.Cascade);

        var application = modelBuilder.Entity<JobApplication>();

        application.HasKey(item => item.Id);
        application.Property(item => item.UserId).IsRequired();
        application.Property(item => item.CompanyName).IsRequired();
        application.Property(item => item.JobTitle).IsRequired();
        application.Property(item => item.Status).HasConversion<string>().IsRequired();
        application.Property(item => item.ApplicationMethod).HasConversion<string>().HasDefaultValue(ApplicationMethod.Unknown);
        application.Property(item => item.FollowUpMode).HasConversion<string>().HasDefaultValue(FollowUpMode.Unknown);
        application.Property(item => item.ContactPerson).HasMaxLength(200);
        application.Property(item => item.ContactEmail).HasMaxLength(254);
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
