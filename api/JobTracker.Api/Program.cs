using System.Text.Json.Serialization;
using JobTracker.Api.Data;
using JobTracker.Api.Authentication;
using JobTracker.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddClerkAuthentication(builder.Configuration);
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<CurrentUser>();

builder.Services.AddControllers().AddJsonOptions(options =>
    options.JsonSerializerOptions.Converters.Add(
        new JsonStringEnumConverter(allowIntegerValues: false)));
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not configured.");

var databaseProvider = builder.Configuration["DatabaseProvider"] ?? "Sqlite";
switch (databaseProvider)
{
    case "Sqlite":
        builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(connectionString));
        break;
    case "Postgres":
    case "PostgreSQL":
        builder.Services.AddDbContext<AppDbContext, PostgresAppDbContext>(options => options.UseNpgsql(connectionString));
        break;
    default:
        throw new InvalidOperationException(
            $"Unknown DatabaseProvider '{databaseProvider}'. Supported values: Sqlite, Postgres, PostgreSQL.");
}
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options => options.AddPolicy("LocalFrontend", policy =>
    policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173", "https://job-tracker-nine-bay.vercel.app")
        .AllowAnyHeader()
        .AllowAnyMethod()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("LocalFrontend");
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers().RequireAuthorization();
app.Run();

public partial class Program { }
