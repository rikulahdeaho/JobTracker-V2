using System.Data;
using JobTracker.Api.Data;
using JobTracker.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.DataTransfer;

public sealed record TransferReport(int SourceApplications, int SourceEvents,
    int NewApplications, int NewEvents, IReadOnlyList<string> Conflicts, bool Applied);

public static class ApplicationTransfer
{
    public static async Task<TransferReport> RunAsync(AppDbContext source, AppDbContext target,
        string userId, bool apply, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userId);
        if (userId == "dev-user")
            throw new ArgumentException("Select a real Clerk user; legacy dev-user data is excluded.", nameof(userId));

        // One query captures applications and their events together without modifying SQLite.
        var applications = await source.JobApplications.AsNoTracking().Include(item => item.Events)
            .AsSingleQuery().Where(item => item.UserId == userId).ToListAsync(cancellationToken);
        var events = applications.SelectMany(item => item.Events).ToList();
        foreach (var entity in applications.Cast<object>().Concat(events))
            NormalizeTimestamps(source, entity);

        // Serializable isolation makes a conflict discovered during a concurrent write abort the import.
        await using var transaction = apply
            ? await target.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken)
            : null;
        var applicationIds = applications.Select(item => item.Id).ToArray();
        var eventIds = events.Select(item => item.Id).ToArray();
        var existingApplications = await target.JobApplications.AsNoTracking()
            .Where(item => applicationIds.Contains(item.Id)).ToDictionaryAsync(item => item.Id, cancellationToken);
        var existingEvents = await target.ApplicationEvents.AsNoTracking()
            .Where(item => eventIds.Contains(item.Id)).ToDictionaryAsync(item => item.Id, cancellationToken);
        var conflicts = new List<string>();
        foreach (var item in applications)
            if (existingApplications.TryGetValue(item.Id, out var existing) && !SameValues(target, item, existing))
                conflicts.Add($"Application {item.Id}: existing values or owner differ.");
        foreach (var item in events)
            if (existingEvents.TryGetValue(item.Id, out var existing) && !SameValues(target, item, existing))
                conflicts.Add($"Event {item.Id}: existing values or parent differ.");

        var newApplications = applications.Where(item => !existingApplications.ContainsKey(item.Id)).ToList();
        var newEvents = events.Where(item => !existingEvents.ContainsKey(item.Id)).ToList();
        if (apply && conflicts.Count == 0)
        {
            // Add events separately so existing parent applications are never marked for insertion.
            foreach (var item in newApplications)
                item.Events = [];
            target.JobApplications.AddRange(newApplications);
            target.ApplicationEvents.AddRange(newEvents);
            await target.SaveChangesAsync(cancellationToken);
            await transaction!.CommitAsync(cancellationToken);
        }

        return new TransferReport(applications.Count, events.Count, newApplications.Count,
            newEvents.Count, conflicts, apply && conflicts.Count == 0);
    }

    private static bool SameValues<T>(AppDbContext db, T source, T target) where T : class =>
        db.Model.FindEntityType(typeof(T))!.GetProperties().All(property =>
            Equals(NormalizeValue(property.PropertyInfo!.GetValue(source)),
                NormalizeValue(property.PropertyInfo.GetValue(target))));

    private static void NormalizeTimestamps(AppDbContext db, object entity)
    {
        foreach (var property in db.Model.FindEntityType(entity.GetType())!.GetProperties())
        {
            var info = property.PropertyInfo!;
            if (info.GetValue(entity) is DateTime timestamp)
                info.SetValue(entity, NormalizeValue(timestamp));
        }
    }

    // PostgreSQL timestamps have microsecond precision; preserve UTC and compare at that precision.
    private static object? NormalizeValue(object? value) => value is DateTime timestamp
        ? new DateTime(timestamp.Ticks / 10 * 10, DateTimeKind.Utc)
        : value;
}
