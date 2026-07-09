using JobTracker.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<JobApplication> JobApplications => Set<JobApplication>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<JobApplication>()
            .Property(x => x.Status)
            .HasConversion<string>();

        modelBuilder.Entity<JobApplication>()
            .HasIndex(x => x.UserId);

        modelBuilder.Entity<JobApplication>()
            .HasIndex(x => x.Status);
    }
}
