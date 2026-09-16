using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using JobTracker.Api.Data;
using JobTracker.Api.DTOs;
using JobTracker.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace JobTracker.Api.Tests;

public sealed class ApplicationsTests : IDisposable
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };
    private readonly ApplicationsApiFactory factory = new();
    private readonly HttpClient client;

    public ApplicationsTests()
    {
        client = factory.CreateInitializedClient();
    }

    [Fact]
    public async Task Create_can_be_read_in_list_and_by_id_with_server_owned_fields()
    {
        var before = DateTime.UtcNow;
        var response = await client.PostAsJsonAsync("/api/applications", new
        {
            companyName = " Example ", jobTitle = " Developer ", status = "Applied",
            appliedDate = "2026-09-01", deadline = "2026-09-30",
            jobUrl = "https://example.com/job", location = "Helsinki", source = "Referral",
            salaryRange = "4000-5000", notes = "My notes", jobDescription = "Build APIs",
            userId = "untrusted-user", createdAt = "2000-01-01T00:00:00Z"
        });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await ReadApplication(response);
        Assert.NotEqual(Guid.Empty, created.Id);
        Assert.EndsWith($"/api/applications/{created.Id}", response.Headers.Location!.ToString());
        Assert.Equal("Example", created.CompanyName);
        Assert.Equal("Developer", created.JobTitle);
        Assert.InRange(created.CreatedAt, before, DateTime.UtcNow);
        Assert.Equal(DateTimeKind.Utc, created.CreatedAt.Kind);
        Assert.Equal(created.CreatedAt, created.UpdatedAt);

        var detail = await ReadApplication(await client.GetAsync(response.Headers.Location));
        Assert.Equivalent(created, detail, strict: true);
        Assert.Equal(new DateOnly(2026, 9, 30), detail.Deadline);
        Assert.Equal("My notes", detail.Notes);
        var list = await client.GetFromJsonAsync<JobApplicationResponse[]>("/api/applications", JsonOptions);
        Assert.Equivalent(created, Assert.Single(list!), strict: true);

        using var scope = factory.Services.CreateScope();
        var stored = await scope.ServiceProvider.GetRequiredService<AppDbContext>().JobApplications.SingleAsync();
        Assert.Equal("dev-user", stored.UserId);
    }

    [Theory]
    [InlineData("{}")]
    [InlineData("{\"companyName\":\" \",\"jobTitle\":\"Developer\"}")]
    [InlineData("{\"companyName\":\"Example\",\"jobTitle\":null}")]
    [InlineData("{\"companyName\":\"Example\",\"jobTitle\":\"Developer\",\"status\":\"Unknown\"}")]
    [InlineData("{\"companyName\":\"Example\",\"jobTitle\":\"Developer\",\"status\":99}")]
    [InlineData("{\"companyName\":\"Example\",\"jobTitle\":\"Developer\",\"deadline\":\"not-a-date\"}")]
    public async Task Invalid_create_and_update_return_400_without_changing_saved_data(string body)
    {
        var created = await CreateApplication();
        using var createContent = new StringContent(body, Encoding.UTF8, "application/json");
        using var updateContent = new StringContent(body, Encoding.UTF8, "application/json");
        var create = await client.PostAsync("/api/applications", createContent);
        var update = await client.PutAsync($"/api/applications/{created.Id}", updateContent);
        Assert.Equal(HttpStatusCode.BadRequest, create.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, update.StatusCode);
        using var problem = JsonDocument.Parse(await update.Content.ReadAsStringAsync());
        Assert.True(problem.RootElement.GetProperty("errors").EnumerateObject().Any());
        var list = await client.GetFromJsonAsync<JobApplicationResponse[]>("/api/applications", JsonOptions);
        Assert.Equivalent(created, Assert.Single(list!), strict: true);
    }

    [Fact]
    public async Task Update_replaces_editable_fields_preserves_created_at_and_advances_updated_at()
    {
        var created = await CreateApplication();
        var response = await client.PutAsJsonAsync($"/api/applications/{created.Id}", new
        {
            companyName = "Changed", jobTitle = "Senior Developer", status = "Interviewing",
            appliedDate = "2026-09-02", deadline = "2026-10-01"
        });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await ReadApplication(response);
        Assert.Equal("Changed", updated.CompanyName);
        Assert.Equal("Senior Developer", updated.JobTitle);
        Assert.Equal(ApplicationStatus.Interviewing, updated.Status);
        Assert.Null(updated.Notes);
        Assert.Equal(created.CreatedAt, updated.CreatedAt);
        Assert.True(updated.UpdatedAt > created.UpdatedAt);
        Assert.Equal(DateTimeKind.Utc, updated.UpdatedAt.Kind);
        Assert.Equivalent(updated, await ReadApplication(await client.GetAsync($"/api/applications/{created.Id}")), strict: true);
    }

    [Theory]
    [InlineData("Draft")]
    [InlineData("ToApply")]
    [InlineData("Applied")]
    [InlineData("Interviewing")]
    [InlineData("Assignment")]
    [InlineData("Offer")]
    [InlineData("Rejected")]
    [InlineData("Ghosted")]
    [InlineData("Withdrawn")]
    public async Task Status_round_trips_as_a_string_in_the_API_and_SQLite(string status)
    {
        var created = await CreateApplication(status);
        var response = await client.GetAsync($"/api/applications/{created.Id}");
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal(status, json.RootElement.GetProperty("status").GetString());

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await using var command = db.Database.GetDbConnection().CreateCommand();
        command.CommandText = "SELECT Status FROM JobApplications";
        Assert.Equal(status, await command.ExecuteScalarAsync());
    }

    [Fact]
    public async Task Delete_removes_the_record_and_missing_endpoints_return_404()
    {
        var created = await CreateApplication();
        var path = $"/api/applications/{created.Id}";
        var deleted = await client.DeleteAsync(path);
        Assert.Equal(HttpStatusCode.NoContent, deleted.StatusCode);
        Assert.Empty(await deleted.Content.ReadAsStringAsync());
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync(path)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.DeleteAsync(path)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.PutAsJsonAsync(path,
            new { companyName = "Example", jobTitle = "Developer" })).StatusCode);
        Assert.Empty((await client.GetFromJsonAsync<JobApplicationResponse[]>("/api/applications", JsonOptions))!);
    }

    [Fact]
    public async Task Other_users_records_are_not_listed_read_updated_or_deleted()
    {
        var id = Guid.NewGuid();
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.JobApplications.Add(new JobApplication
            {
                Id = id, UserId = "other-user", CompanyName = "Private", JobTitle = "Developer",
                CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();
        }
        var path = $"/api/applications/{id}";
        Assert.Empty((await client.GetFromJsonAsync<JobApplicationResponse[]>("/api/applications", JsonOptions))!);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync(path)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.PutAsJsonAsync(path,
            new { companyName = "Changed", jobTitle = "Changed" })).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.DeleteAsync(path)).StatusCode);
        using var verifyScope = factory.Services.CreateScope();
        var stored = await verifyScope.ServiceProvider.GetRequiredService<AppDbContext>().JobApplications.SingleAsync();
        Assert.Equal("Private", stored.CompanyName);
    }

    private async Task<JobApplicationResponse> CreateApplication(string status = "Draft")
    {
        var response = await client.PostAsJsonAsync("/api/applications",
            new { companyName = "Example", jobTitle = "Developer", status, notes = "Original notes" });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return await ReadApplication(response);
    }

    private static async Task<JobApplicationResponse> ReadApplication(HttpResponseMessage response)
    {
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<JobApplicationResponse>(JsonOptions))!;
    }

    public void Dispose()
    {
        client.Dispose();
        factory.Dispose();
    }
}
