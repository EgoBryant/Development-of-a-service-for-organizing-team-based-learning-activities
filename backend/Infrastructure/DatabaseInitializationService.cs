using Microsoft.EntityFrameworkCore;
using Npgsql;
using TeamExamProject.Data;

namespace TeamExamProject.Infrastructure;

/// <summary>
/// Применяет миграции EF Core, правки схемы и сид при старте.
/// Пересчёт КРК на старте не выполняется — он запускается по событиям и при первом запросе рейтинга.
/// </summary>
public sealed class DatabaseInitializationService
{
    private const int MaxAttempts = 6;
    private static readonly TimeSpan RetryDelay = TimeSpan.FromSeconds(2);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly DatabaseReadiness _readiness;
    private readonly ILogger<DatabaseInitializationService> _logger;
    private readonly IHostEnvironment _environment;
    private readonly string _connectionString;

    public DatabaseInitializationService(
        IServiceScopeFactory scopeFactory,
        DatabaseReadiness readiness,
        ILogger<DatabaseInitializationService> logger,
        IHostEnvironment environment,
        IConfiguration configuration)
    {
        _scopeFactory = scopeFactory;
        _readiness = readiness;
        _logger = logger;
        _environment = environment;
        _connectionString = configuration.GetConnectionString("DefaultConnection")
                            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is missing.");
    }

    /// <summary>Выполняет инициализацию БД с повторными попытками при ошибках подключения.</summary>
    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        for (var attempt = 1; attempt <= MaxAttempts; attempt++)
        {
            try
            {
                await using var scope = _scopeFactory.CreateAsyncScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                await dbContext.Database.MigrateAsync(cancellationToken);
                await DatabaseSchemaRepair.ApplyAsync(
                    dbContext,
                    scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DatabaseSchemaRepair"),
                    cancellationToken);
                await SeedData.InitializeAsync(dbContext);

                var userCount = await dbContext.Users.CountAsync(cancellationToken);
                _logger.LogInformation(
                    "Database migration and seed completed successfully. Users in database: {UserCount}.",
                    userCount);

                _readiness.MarkReady();
                return;
            }
            catch (Exception exception) when (IsDatabaseConnectionError(exception))
            {
                _logger.LogWarning(
                    exception,
                    "Database connection attempt {Attempt}/{MaxAttempts} failed for {ConnectionTarget}.",
                    attempt,
                    MaxAttempts,
                    DescribeConnectionTarget(_connectionString));

                if (attempt == MaxAttempts)
                {
                    var message =
                        $"Could not connect to PostgreSQL at {DescribeConnectionTarget(_connectionString)} after {MaxAttempts} attempts.";

                    if (_environment.IsDevelopment())
                    {
                        _logger.LogError("{Message} The API will continue in degraded mode.", message);
                        _readiness.MarkFailed(message);
                        return;
                    }

                    _readiness.MarkFailed(message);
                    throw new InvalidOperationException(message, exception);
                }

                await Task.Delay(RetryDelay, cancellationToken);
            }
            catch (Exception exception)
            {
                var message = "Database initialization failed.";
                _logger.LogError(exception, "{Message}", message);
                _readiness.MarkFailed(message);
                throw;
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
