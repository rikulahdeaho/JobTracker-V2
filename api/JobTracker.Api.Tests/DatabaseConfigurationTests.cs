using JobTracker.Api.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Xunit;

namespace JobTracker.Api.Tests;

public sealed class DatabaseConfigurationTests
{
    [Theory]
    [InlineData("Sqlite", "Data Source=:memory:", "Microsoft.EntityFrameworkCore.Sqlite")]
    [InlineData("Postgres", "Host=localhost;Database=configuration_test", "Npgsql.EntityFrameworkCore.PostgreSQL")]
    [InlineData("PostgreSQL", "Host=localhost;Database=configuration_test", "Npgsql.EntityFrameworkCore.PostgreSQL")]
    public void Configured_provider_and_connection_are_used(string? provider, string connectionString, string expectedProvider)
    {
        using var factory = CreateFactory(provider, connectionString);
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        Assert.Equal(expectedProvider, db.Database.ProviderName);
        Assert.Equal(connectionString, db.Database.GetConnectionString());
        Assert.False(db.Database.HasPendingModelChanges());

        var migrations = db.GetService<IMigrationsAssembly>();
        var expectedNamespace = provider == "Sqlite"
            ? "JobTracker.Api.Migrations.Sqlite"
            : "JobTracker.Api.Migrations.Postgres";
        Assert.NotEmpty(migrations.Migrations);
        Assert.All(migrations.Migrations.Values, migration => Assert.Equal(expectedNamespace, migration.Namespace));
        Assert.Equal(expectedNamespace, migrations.ModelSnapshot!.GetType().Namespace);

        if (provider != "Sqlite")
        {
            Assert.IsType<PostgresAppDbContext>(db);
            Assert.Single(migrations.Migrations);
            var script = db.GetService<IMigrator>().GenerateScript(options: MigrationsSqlGenerationOptions.Idempotent);
            Assert.Contains("uuid", script);
            Assert.Contains("timestamp with time zone", script);
            Assert.DoesNotContain("randomblob", script);
            Assert.DoesNotContain("ApplicationWorkflow", script);
        }
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    public void Missing_or_blank_connection_fails_at_startup(string? connectionString)
    {
        using var factory = CreateFactory("Sqlite", connectionString);

        var error = Assert.Throws<InvalidOperationException>(() => factory.CreateClient());

        Assert.Contains("ConnectionStrings:DefaultConnection is not configured", error.Message);
    }

    [Theory]
    [InlineData("Unknown")]
    [InlineData("")]
    public void Unknown_provider_fails_at_startup(string provider)
    {
        using var factory = CreateFactory(provider, "Data Source=:memory:");

        var error = Assert.Throws<InvalidOperationException>(() => factory.CreateClient());

        Assert.Contains($"Unknown DatabaseProvider '{provider}'", error.Message);
        Assert.Contains("Sqlite, Postgres, PostgreSQL", error.Message);
    }

    private static WebApplicationFactory<Program> CreateFactory(string? provider, string? connectionString) =>
        new DatabaseApiFactory(provider, connectionString);

    private sealed class DatabaseApiFactory(string? provider, string? connectionString) : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder) => builder.UseEnvironment("Testing");

        protected override IHost CreateHost(IHostBuilder builder)
        {
            // Supply settings before Program reads configuration during service registration.
            builder.ConfigureHostConfiguration(configuration =>
                configuration.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["DatabaseProvider"] = provider,
                    ["ConnectionStrings:DefaultConnection"] = connectionString,
                    ["Clerk:Authority"] = "https://clerk.test.invalid",
                    ["Clerk:AuthorizedParties:0"] = "http://localhost:5173"
                }));
            return base.CreateHost(builder);
        }
    }
}
