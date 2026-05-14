using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Infrastructure.Extensions;

public static class WebApplicationExtensions
{
    public static async Task InitializeDatabaseAsync(
        this WebApplication app,
        string connectionString)
    {
        await using var scope = app.Services.CreateAsyncScope();

        var logger = scope.ServiceProvider
            .GetRequiredService<ILoggerFactory>()
            .CreateLogger("DatabaseStartup");
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<User>>();

        await InitializeDatabaseCoreAsync(app, dbContext, passwordHasher, logger, connectionString);
    }

    public static WebApplication UseApplicationPipeline(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseExceptionHandler();
        app.UseCors(ServiceCollectionExtensions.GetFrontendCorsPolicyName());
        app.UseAuthentication();
        app.UseAuthorization();

        return app;
    }

    public static WebApplication MapApplicationEndpoints(this WebApplication app)
    {
        app.MapControllers();
        app.MapGet("/health", async (AppDbContext dbContext) =>
        {
            var canConnect = await dbContext.Database.CanConnectAsync();
            return canConnect
                ? Results.Ok(new { status = "ok", database = "up" })
                : Results.Problem(title: "Database is unavailable", statusCode: StatusCodes.Status503ServiceUnavailable);
        });

        return app;
    }

    private static async Task InitializeDatabaseCoreAsync(
        WebApplication app,
        AppDbContext dbContext,
        IPasswordHasher<User> passwordHasher,
        ILogger logger,
        string connectionString)
    {
        const int MaxAttempts = 10;
        var delay = TimeSpan.FromSeconds(3);

        for (var attempt = 1; attempt <= MaxAttempts; attempt++)
        {
            try
            {
                await dbContext.Database.MigrateAsync();
                await SeedData.InitializeAsync(dbContext, passwordHasher);
                logger.LogInformation("Database migration and seed completed successfully.");
                return;
            }
            catch (Exception exception) when (IsDatabaseConnectionError(exception))
            {
                logger.LogWarning(
                    exception,
                    "Database connection attempt {Attempt}/{MaxAttempts} failed for {ConnectionTarget}.",
                    attempt,
                    MaxAttempts,
                    DescribeConnectionTarget(connectionString));

                if (attempt == MaxAttempts)
                {
                    var message =
                        $"Could not connect to PostgreSQL at {DescribeConnectionTarget(connectionString)} after {MaxAttempts} attempts. " +
                        "Start PostgreSQL first, or override ConnectionStrings__DefaultConnection with a reachable host.";

                    if (app.Environment.IsDevelopment())
                    {
                        logger.LogError("{Message} The API will continue to start in degraded mode.", message);
                        return;
                    }

                    throw new InvalidOperationException(message, exception);
                }

                await Task.Delay(delay);
            }
        }
    }

    private static bool IsDatabaseConnectionError(Exception exception)
    {
        if (exception is TimeoutException || exception.InnerException is TimeoutException)
        {
            return true;
        }

        if (exception is PostgresException postgresException)
        {
            return postgresException.SqlState.StartsWith("08", StringComparison.Ordinal);
        }

        if (exception.InnerException is PostgresException innerPostgresException)
        {
            return innerPostgresException.SqlState.StartsWith("08", StringComparison.Ordinal);
        }

        return exception is NpgsqlException
               || exception.InnerException is NpgsqlException;
    }

    private static string DescribeConnectionTarget(string connectionString)
    {
        var builder = new NpgsqlConnectionStringBuilder(connectionString);
        var host = string.IsNullOrWhiteSpace(builder.Host) ? "unknown-host" : builder.Host;
        var port = builder.Port == 0 ? 5432 : builder.Port;
        var database = string.IsNullOrWhiteSpace(builder.Database) ? "unknown-db" : builder.Database;

        return $"{host}:{port}/{database}";
    }
}
