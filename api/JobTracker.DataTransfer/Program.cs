using System.Text.Json;
using JobTracker.Api.Data;
using JobTracker.DataTransfer;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Npgsql;

if (args.Length == 0 || args.Contains("--help"))
{
    Console.WriteLine("Usage: dotnet run --project api/JobTracker.DataTransfer -- --source <SQLite file> --user <Clerk ID> [--connection-file <JSON file>] [--apply]");
    Console.WriteLine("Defaults to preview. Set JOBTRACKER_NEON_CONNECTION or supply an ignored JSON file with NeonConnectionString.");
    return 0;
}

try
{
    var options = new Dictionary<string, string>();
    var apply = false;
    for (var index = 0; index < args.Length; index++)
    {
        if (args[index] == "--apply") { apply = true; continue; }
        if (args[index] is not ("--source" or "--user" or "--connection-file") || index + 1 >= args.Length)
            throw new ArgumentException("Invalid arguments. Use --help for usage.");
        options.Add(args[index], args[++index]);
    }
    if (!options.TryGetValue("--source", out var sourcePath) || !File.Exists(sourcePath))
        throw new ArgumentException("--source must point to an existing SQLite database.");
    if (!options.TryGetValue("--user", out var userId) || string.IsNullOrWhiteSpace(userId))
        throw new ArgumentException("--user must specify the Clerk user ID to copy.");

    var connection = Environment.GetEnvironmentVariable("JOBTRACKER_NEON_CONNECTION");
    if (options.TryGetValue("--connection-file", out var connectionFile))
    {
        using var json = JsonDocument.Parse(await File.ReadAllTextAsync(connectionFile));
        connection = json.RootElement.GetProperty("NeonConnectionString").GetString();
    }
    if (string.IsNullOrWhiteSpace(connection))
        throw new ArgumentException("Configure JOBTRACKER_NEON_CONNECTION or --connection-file before running.");
    var postgres = new NpgsqlConnectionStringBuilder(connection);
    if (postgres.SslMode is not (SslMode.Require or SslMode.VerifyCA or SslMode.VerifyFull))
        throw new ArgumentException("The Neon connection must require TLS: use SSL Mode=Require or VerifyFull.");
    postgres.IncludeErrorDetail = false;

    var sqlite = new SqliteConnectionStringBuilder
    {
        DataSource = Path.GetFullPath(sourcePath), Mode = SqliteOpenMode.ReadOnly
    };
    await using var source = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
        .UseSqlite(sqlite.ToString()).Options);
    await using var target = new PostgresAppDbContext(new DbContextOptionsBuilder<PostgresAppDbContext>()
        .UseNpgsql(postgres.ToString()).Options);
    Console.WriteLine($"{(apply ? "IMPORT" : "PREVIEW")}: {userId} -> {postgres.Host}/{postgres.Database}");
    var report = await ApplicationTransfer.RunAsync(source, target, userId, apply);
    Console.WriteLine($"Source: {report.SourceApplications} applications, {report.SourceEvents} events.");
    Console.WriteLine($"New: {report.NewApplications} applications, {report.NewEvents} events. Identical existing records are skipped.");
    foreach (var conflict in report.Conflicts) Console.WriteLine($"CONFLICT: {conflict}");
    Console.WriteLine(report.Conflicts.Count > 0 ? "No changes saved. Resolve conflicts before importing."
        : report.Applied ? "Import committed." : "Preview only. Run again with --apply to import.");
    return report.Conflicts.Count > 0 ? 2 : 0;
}
catch (Exception error)
{
    // Database exception messages can contain connection details or personal data.
    Console.Error.WriteLine($"Transfer failed ({error.GetType().Name}). No import was committed.");
    if (error is ArgumentException) Console.Error.WriteLine(error.Message);
    else Console.Error.WriteLine("Check source schema, connection configuration, network access and target migrations.");
    return 1;
}
