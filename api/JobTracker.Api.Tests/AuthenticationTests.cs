using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using JobTracker.Api.Data;
using JobTracker.Api.DTOs;
using JobTracker.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace JobTracker.Api.Tests;

public sealed class AuthenticationTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
        { Converters = { new JsonStringEnumConverter() } };

    [Theory]
    [InlineData("GET", "/api/applications")]
    [InlineData("POST", "/api/applications")]
    [InlineData("GET", "/api/applications/11111111-1111-1111-1111-111111111111")]
    [InlineData("PUT", "/api/applications/11111111-1111-1111-1111-111111111111")]
    [InlineData("DELETE", "/api/applications/11111111-1111-1111-1111-111111111111")]
    [InlineData("POST", "/api/applications/11111111-1111-1111-1111-111111111111/events")]
    public async Task Every_data_endpoint_requires_authentication(string method, string path)
    {
        using var factory = new ApplicationsApiFactory();
        using var client = factory.CreateInitializedClient(null);
        using var request = new HttpRequestMessage(new HttpMethod(method), path);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.SendAsync(request)).StatusCode);
    }

    [Fact]
    public async Task Two_users_have_isolated_applications_events_and_reminder_source_dates()
    {
        using var factory = new ApplicationsApiFactory();
        using var userA = factory.CreateInitializedClient("user-a");
        using var userB = factory.CreateInitializedClient("user-b");
        var a = await Create(userA, "A");
        var b = await Create(userB, "B");
        var eventPath = $"/api/applications/{b.Id}/events";
        var activity = new { type = "InterviewScheduled", occurredAt = "2026-09-01T12:00:00Z", dueAt = "2026-09-30T12:00:00Z", note = "Private reminder" };
        var updatedB = await Read(await userB.PostAsJsonAsync(eventPath, activity));
        Assert.Contains(updatedB.Events, item => item.DueAt is not null && item.Note == "Private reminder");
        var aList = await userA.GetFromJsonAsync<JobApplicationResponse[]>("/api/applications", Json);
        var bList = await userB.GetFromJsonAsync<JobApplicationResponse[]>("/api/applications", Json);
        Assert.Equivalent(a, Assert.Single(aList!), strict: true);
        Assert.Equivalent(updatedB, Assert.Single(bList!), strict: true);
        Assert.DoesNotContain(aList!.SelectMany(item => item.Events), item => item.Note == "Private reminder");
        foreach (var (client, other) in new[] { (userA, b), (userB, a) })
        {
            var path = $"/api/applications/{other.Id}";
            Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync(path)).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await client.PutAsJsonAsync(path, new { companyName = "Stolen", jobTitle = "Test" })).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await client.DeleteAsync(path)).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsJsonAsync($"{path}/events", activity)).StatusCode);
        }
        // PUT cannot transfer ownership either.
        await userA.PutAsJsonAsync($"/api/applications/{a.Id}", new { companyName = "A edited", jobTitle = "Test", userId = "user-b" });
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        Assert.Equal("user-a", (await db.JobApplications.SingleAsync(item => item.Id == a.Id)).UserId);
        Assert.Equal("user-b", (await db.JobApplications.SingleAsync(item => item.Id == b.Id)).UserId);
        Assert.Equivalent(updatedB, await Read(await userB.GetAsync($"/api/applications/{b.Id}")), strict: true);
    }

    [Fact]
    public async Task Legacy_records_remain_unassigned_and_inaccessible()
    {
        using var factory = new ApplicationsApiFactory();
        using var client = factory.CreateInitializedClient();
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var legacy = new JobApplication { Id = Guid.NewGuid(), UserId = "dev-user", CompanyName = "Legacy", JobTitle = "Test", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        db.Add(legacy);
        await db.SaveChangesAsync();
        Assert.Empty((await client.GetFromJsonAsync<JobApplicationResponse[]>("/api/applications", Json))!);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/applications/{legacy.Id}")).StatusCode);
        Assert.Equal("dev-user", (await db.JobApplications.SingleAsync()).UserId);
    }

    private static async Task<JobApplicationResponse> Create(HttpClient client, string company) =>
        await Read(await client.PostAsJsonAsync("/api/applications", new { companyName = company, jobTitle = "Test", userId = "forged-owner", deadline = "2026-09-30" }));

    private static async Task<JobApplicationResponse> Read(HttpResponseMessage response)
    {
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<JobApplicationResponse>(Json))!;
    }
}
