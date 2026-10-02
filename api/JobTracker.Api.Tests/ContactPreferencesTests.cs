using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using JobTracker.Api.DTOs;
using JobTracker.Api.Models;
using Xunit;

namespace JobTracker.Api.Tests;

public sealed class ContactPreferencesTests : IDisposable
{
    private readonly ApplicationsApiFactory factory = new();
    private readonly HttpClient client;
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
        { Converters = { new JsonStringEnumConverter() } };

    public ContactPreferencesTests() => client = factory.CreateInitializedClient();

    [Theory]
    [InlineData("CompanyPortal", "Unknown")]
    [InlineData("Email", "Possible")]
    [InlineData("RecruiterDirect", "NotAvailable")]
    [InlineData("LinkedInEasyApply", "NotNeeded")]
    [InlineData("Other", "Possible")]
    [InlineData("Unknown", "Unknown")]
    public async Task Contact_fields_round_trip_on_create_update_list_and_detail(string method, string mode)
    {
        var body = new { companyName = "Example", jobTitle = "Developer", applicationMethod = method,
            followUpMode = mode, contactPerson = " Recruiter ", contactEmail = "recruiter@example.com" };
        var created = await Read(await client.PostAsJsonAsync("/api/applications", body));
        var updated = await Read(await client.PutAsJsonAsync($"/api/applications/{created.Id}", body));
        var loaded = await Read(await client.GetAsync($"/api/applications/{created.Id}"));
        var list = await client.GetFromJsonAsync<JobApplicationResponse[]>("/api/applications", Json);
        foreach (var item in new[] { created, updated, loaded, Assert.Single(list!) })
        {
            Assert.Equal(method, item.ApplicationMethod.ToString());
            Assert.Equal(mode, item.FollowUpMode.ToString());
            Assert.Equal("Recruiter", item.ContactPerson);
            Assert.Equal("recruiter@example.com", item.ContactEmail);
        }
        var reset = await Read(await client.PutAsJsonAsync($"/api/applications/{created.Id}", new { companyName = "Example", jobTitle = "Developer" }));
        Assert.Equal(ApplicationMethod.Unknown, reset.ApplicationMethod);
        Assert.Equal(FollowUpMode.Unknown, reset.FollowUpMode);
        Assert.Null(reset.ContactEmail);
        Assert.Null(reset.ContactPerson);
    }

    [Theory]
    [InlineData("applicationMethod", "Invalid")]
    [InlineData("applicationMethod", 1)]
    [InlineData("followUpMode", "Invalid")]
    [InlineData("followUpMode", 1)]
    [InlineData("contactEmail", "not-an-email")]
    [InlineData("contactEmail", "a@b")]
    [InlineData("contactEmail", "a b@example.com")]
    public async Task Invalid_contact_fields_are_rejected_on_post_and_put(string field, object value)
    {
        var original = await Read(await client.PostAsJsonAsync("/api/applications", new { companyName = "Example", jobTitle = "Developer" }));
        var body = new Dictionary<string, object> { ["companyName"] = "Example", ["jobTitle"] = "Developer", [field] = value };
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/applications", body)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync($"/api/applications/{original.Id}", body)).StatusCode);
        Assert.Equivalent(original, await Read(await client.GetAsync($"/api/applications/{original.Id}")), strict: true);
    }

    [Theory]
    [InlineData("contactPerson", 201)]
    [InlineData("contactEmail", 255)]
    public async Task Contact_length_limits_apply_to_both_writes(string field, int length)
    {
        var original = await Read(await client.PostAsJsonAsync("/api/applications", new { companyName = "Example", jobTitle = "Developer" }));
        var value = field == "contactEmail" ? new string('a', length - 12) + "@example.com" : new string('a', length);
        var body = new Dictionary<string, object> { ["companyName"] = "Example", ["jobTitle"] = "Developer", [field] = value };
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/applications", body)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync($"/api/applications/{original.Id}", body)).StatusCode);
    }

    [Fact]
    public async Task Reply_and_contact_data_stay_owned_and_reply_does_not_change_status()
    {
        var original = await Read(await client.PostAsJsonAsync("/api/applications", new
        { companyName = "Example", jobTitle = "Developer", status = "Interviewing", contactEmail = "private@example.com" }));
        using var other = factory.CreateInitializedClient("user-b");
        var reply = new { type = "ContactReceived", occurredAt = "2026-09-20T12:00:00Z" };
        Assert.Equal(HttpStatusCode.NotFound, (await other.GetAsync($"/api/applications/{original.Id}")).StatusCode);
        Assert.Empty((await other.GetFromJsonAsync<JobApplicationResponse[]>("/api/applications", Json))!);
        Assert.Equal(HttpStatusCode.NotFound, (await other.PostAsJsonAsync($"/api/applications/{original.Id}/events", reply)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await other.PutAsJsonAsync($"/api/applications/{original.Id}", new
        { companyName = "Foreign", jobTitle = "Developer", contactEmail = "changed@example.com" })).StatusCode);
        var updated = await Read(await client.PostAsJsonAsync($"/api/applications/{original.Id}/events", reply));
        Assert.Equal(ApplicationStatus.Interviewing, updated.Status);
        Assert.Equal("private@example.com", updated.ContactEmail);
        Assert.Single(updated.Events, item => item.Type == ApplicationEventType.ContactReceived);
        Assert.DoesNotContain(updated.Events, item => item.Type == ApplicationEventType.StatusChanged);
        Assert.Equivalent(updated, await Read(await client.GetAsync($"/api/applications/{original.Id}")), strict: true);
    }

    private static async Task<JobApplicationResponse> Read(HttpResponseMessage response)
    {
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<JobApplicationResponse>(Json))!;
    }

    public void Dispose() { client.Dispose(); factory.Dispose(); }
}
