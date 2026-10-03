using System.Text.Json.Serialization;
using JobTracker.Api.Data;
using JobTracker.Api.Authentication;
using JobTracker.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Authentication
builder.Services.AddClerkAuthentication(builder.Configuration);
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<CurrentUser>();

// Controllers + enum serialization
builder.Services.AddControllers().AddJsonOptions(options =>
    options.JsonSerializerOptions.Converters.Add(
        new JsonStringEnumConverter(allowIntegerValues: false)));

// Database
var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "ConnectionStrings:DefaultConnection is not configured.");
}

var databaseProvider =
    builder.Configuration["DatabaseProvider"] ?? "Sqlite";

switch (databaseProvider)
{
    case "Sqlite":
        builder.Services.AddDbContext<AppDbContext>(
            options => options.UseSqlite(connectionString));
        break;

    case "Postgres":
    case "PostgreSQL":
        builder.Services.AddDbContext<AppDbContext, PostgresAppDbContext>(
            options => options.UseNpgsql(connectionString));
        break;

    default:
        throw new InvalidOperationException(
            $"Unknown DatabaseProvider '{databaseProvider}'. " +
            "Supported values: Sqlite, Postgres, PostgreSQL.");
}

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
var frontendUrl =
    builder.Configuration["FrontendUrl"]
    ?? "http://localhost:5173";

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                frontendUrl
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Swagger only in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// IMPORTANT:
// CORS must also run in production.
app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers().RequireAuthorization();

app.Run();

public partial class Program { }