using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using JobTracker.Api.Data;
using JobTracker.Api.DTOs;
using JobTracker.Api.Models;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace JobTracker.Api.Tests;

public sealed class WorkflowTests : IDisposable
{
    private readonly ApplicationsApiFactory factory = new();
    private readonly HttpClient client;
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
        { Converters = { new JsonStringEnumConverter() } };

    public WorkflowTests() => client = factory.CreateInitializedClient();

    [Fact]
    public async Task Notes_do_not_change_history_but_status_changes_preserve_it()
    {
        var original = await Create();
        var edited = await Read(await client.PutAsJsonAsync($"/api/applications/{original.Id}", new
        { companyName = "Example", jobTitle = "Developer", status = "Applied", appliedDate = "2026-08-01", notes = "Unrelated edit" }));
        Assert.Equal(original.Events, edited.Events);
        Assert.True(edited.UpdatedAt > original.UpdatedAt);
        var changed = await Read(await client.PutAsJsonAsync($"/api/applications/{original.Id}", new
        { companyName = "Example", jobTitle = "Developer", status = "Interviewing", appliedDate = "2026-08-01" }));
        Assert.All(original.Events, item => Assert.Contains(item, changed.Events));
        Assert.Contains(changed.Events, item => item.Type == ApplicationEventType.StatusChanged
            && item.FromStatus == ApplicationStatus.Applied && item.ToStatus == ApplicationStatus.Interviewing);
        Assert.DoesNotContain(changed.Events, item => item.Type == ApplicationEventType.InterviewScheduled);
    }

    [Theory]
    [InlineData("FollowUpSent", "Applied", null)]
    [InlineData("ContactReceived", "Applied", null)]
    [InlineData("InterviewScheduled", "Interviewing", "2026-09-25T14:00:00+03:00")]
    [InlineData("AssignmentReceived", "Assignment", "2026-09-28T18:00:00Z")]
    [InlineData("OfferReceived", "Offer", "2026-09-30T18:00:00Z")]
    public async Task Events_round_trip_with_real_dates_and_update_current_status(string type, string status, string? dueAt)
    {
        var application = await Create();
        var response = await client.PostAsJsonAsync($"/api/applications/{application.Id}/events",
            new { type, occurredAt = "2026-09-10T10:30:00+03:00", dueAt, note = "Confirmed" });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var updated = await Read(response);
        Assert.Equal(status, updated.Status.ToString());
        var item = Assert.Single(updated.Events, item => item.Type.ToString() == type);
        Assert.Equal(new DateTime(2026, 9, 10, 7, 30, 0, DateTimeKind.Utc), item.OccurredAt);
        Assert.Equal(DateTimeKind.Utc, item.CreatedAt.Kind);
        Assert.Equal(dueAt is null ? (DateTime?)null : DateTimeOffset.Parse(dueAt).UtcDateTime, item.DueAt);
        var loaded = await Read(await client.GetAsync($"/api/applications/{application.Id}"));
        Assert.Equivalent(updated, loaded, strict: true);
        var list = await client.GetFromJsonAsync<JobApplicationResponse[]>("/api/applications", Json);
        Assert.Equivalent(updated, Assert.Single(list!), strict: true);
        if (type == "AssignmentReceived")
        {
            var submitted = await Read(await client.PostAsJsonAsync($"/api/applications/{application.Id}/events",
                new { type = "AssignmentSubmitted", occurredAt = "2026-09-11T12:00:00Z" }));
            Assert.Contains(submitted.Events, item => item.Type == ApplicationEventType.AssignmentSubmitted);
        }
    }

    [Theory]
    [InlineData("ApplicationCreated", "2026-09-01T00:00:00Z", null)]
    [InlineData("StatusChanged", "2026-09-01T00:00:00Z", null)]
    [InlineData("Unknown", "2026-09-01T00:00:00Z", null)]
    [InlineData("FollowUpSent", "2999-01-01T00:00:00Z", null)]
    [InlineData("FollowUpSent", null, null)]
    [InlineData("ContactReceived", null, null)]
    [InlineData("ContactReceived", "2999-01-01T00:00:00Z", null)]
    [InlineData("ContactReceived", "2026-09-01T00:00:00Z", "2026-09-20T00:00:00Z")]
    [InlineData("InterviewScheduled", "2026-09-01T00:00:00Z", null)]
    [InlineData("InterviewScheduled", "2026-09-01T00:00:00Z", "2026-08-01T00:00:00Z")]
    [InlineData("FollowUpSent", "2026-09-01T00:00:00Z", "2026-09-20T00:00:00Z")]
    [InlineData("ApplicationSent", "2026-09-01T00:00:00Z", null)]
    [InlineData("AssignmentSubmitted", "2026-09-01T00:00:00Z", null)]
    public async Task Invalid_events_do_not_change_the_application(string type, string? occurredAt, string? dueAt)
    {
        var original = await Create();
        var response = await client.PostAsJsonAsync($"/api/applications/{original.Id}/events", new { type, occurredAt, dueAt });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equivalent(original, await Read(await client.GetAsync($"/api/applications/{original.Id}")), strict: true);
    }

    [Fact]
    public async Task Sent_event_sets_applied_date_and_date_correction_does_not_duplicate_it()
    {
        var application = await Create("Draft", null);
        var sent = await Read(await client.PostAsJsonAsync($"/api/applications/{application.Id}/events",
            new { type = "ApplicationSent", occurredAt = "2026-08-05T14:00:00Z" }));
        Assert.Equal(new DateOnly(2026, 8, 5), sent.AppliedDate);
        Assert.Equal(ApplicationStatus.Applied, sent.Status);
        var corrected = await Read(await client.PutAsJsonAsync($"/api/applications/{application.Id}", new
        { companyName = "Example", jobTitle = "Developer", status = "Applied", appliedDate = "2026-08-06" }));
        var correctedEvent = Assert.Single(corrected.Events, item => item.Type == ApplicationEventType.ApplicationSent);
        Assert.Equal(new DateTime(2026, 8, 6, 0, 0, 0, DateTimeKind.Utc), correctedEvent.OccurredAt);
        Assert.Equal(sent.Events.Single(item => item.Type == ApplicationEventType.ApplicationSent).Id, correctedEvent.Id);
        var cleared = await Read(await client.PutAsJsonAsync($"/api/applications/{application.Id}", new
        { companyName = "Example", jobTitle = "Developer", status = "Applied" }));
        Assert.DoesNotContain(cleared.Events, item => item.Type == ApplicationEventType.ApplicationSent);
        Assert.Contains(cleared.Events, item => item.Type == ApplicationEventType.ApplicationCreated);
        Assert.Equivalent(cleared, await Read(await client.GetAsync($"/api/applications/{application.Id}")), strict: true);
    }

    [Fact]
    public async Task Events_are_scoped_to_application_owner_and_cascade_on_delete()
    {
        var first = await Create();
        var second = await Create();
        await client.PostAsJsonAsync($"/api/applications/{first.Id}/events", new
        { type = "FollowUpSent", occurredAt = "2026-09-01T12:00:00Z" });
        Assert.DoesNotContain((await Read(await client.GetAsync($"/api/applications/{second.Id}"))).Events,
            item => item.Type == ApplicationEventType.FollowUpSent);
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var other = await db.JobApplications.SingleAsync(item => item.Id == second.Id);
        other.UserId = "other-user";
        await db.SaveChangesAsync();
        foreach (var id in new[] { second.Id, Guid.NewGuid() })
            Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsJsonAsync($"/api/applications/{id}/events", new
            { type = "FollowUpSent", occurredAt = "2026-09-01T12:00:00Z" })).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.DeleteAsync($"/api/applications/{first.Id}")).StatusCode);
        Assert.False(await db.ApplicationEvents.AnyAsync(item => item.ApplicationId == first.Id));
        Assert.True(await db.ApplicationEvents.AnyAsync(item => item.ApplicationId == second.Id));
    }

    [Fact]
    public async Task Migration_only_backfills_known_facts_and_backfilled_events_are_editable()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options);
        await db.GetService<IMigrator>().MigrateAsync("20260916090614_InitialCreate");
        var application = new JobApplication { Id = Guid.NewGuid(), UserId = "dev-user", CompanyName = "Legacy", JobTitle = "Developer",
            Status = ApplicationStatus.Interviewing, AppliedDate = new DateOnly(2026, 8, 1),
            CreatedAt = new DateTime(2026, 7, 30, 12, 0, 0, DateTimeKind.Utc), UpdatedAt = DateTime.UtcNow };
        // Seed the historical schema directly: the current EF model has newer columns.
        await db.Database.ExecuteSqlInterpolatedAsync($"""
            INSERT INTO JobApplications (Id, UserId, CompanyName, JobTitle, Status, AppliedDate, CreatedAt, UpdatedAt)
            VALUES ({application.Id}, {application.UserId}, {application.CompanyName}, {application.JobTitle},
                {application.Status.ToString()}, {application.AppliedDate}, {application.CreatedAt}, {application.UpdatedAt})
            """);
        await db.Database.ExecuteSqlInterpolatedAsync($"""
            INSERT INTO JobApplications (Id, UserId, CompanyName, JobTitle, Status, CreatedAt, UpdatedAt)
            VALUES ({Guid.NewGuid()}, {"dev-user"}, {"Unknown date"}, {"Developer"}, {"Offer"}, {application.CreatedAt}, {application.UpdatedAt})
            """);
        await db.Database.MigrateAsync();
        db.ChangeTracker.Clear();
        var migrated = await db.JobApplications.SingleAsync(item => item.Id == application.Id);
        Assert.Equal(ApplicationMethod.Unknown, migrated.ApplicationMethod);
        Assert.Equal(FollowUpMode.Unknown, migrated.FollowUpMode);
        Assert.Null(migrated.ContactEmail);
        Assert.Null(migrated.ContactPerson);
        Assert.Equal(application.UserId, migrated.UserId);
        Assert.Equal(application.Status, migrated.Status);
        Assert.Equal(application.AppliedDate, migrated.AppliedDate);
        Assert.Equal(application.CreatedAt, migrated.CreatedAt);
        Assert.Equal(application.UpdatedAt, migrated.UpdatedAt);
        var events = await db.ApplicationEvents.ToListAsync();
        Assert.Equal(3, events.Count);
        Assert.Equal(2, events.Count(item => item.Type == ApplicationEventType.ApplicationCreated));
        var sent = Assert.Single(events, item => item.Type == ApplicationEventType.ApplicationSent);
        Assert.Equal(new DateTime(2026, 8, 1, 0, 0, 0, DateTimeKind.Utc), sent.OccurredAt);
        sent.OccurredAt = sent.OccurredAt.AddDays(1);
        await db.SaveChangesAsync();
        await db.Database.MigrateAsync();
        Assert.Equal(3, await db.ApplicationEvents.CountAsync());
    }

    private async Task<JobApplicationResponse> Create(string status = "Applied", string? appliedDate = "2026-08-01") =>
        await Read(await client.PostAsJsonAsync("/api/applications", new { companyName = "Example", jobTitle = "Developer", status, appliedDate }));
    private static async Task<JobApplicationResponse> Read(HttpResponseMessage response)
    {
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<JobApplicationResponse>(Json))!;
    }
    public void Dispose() { client.Dispose(); factory.Dispose(); }
}
