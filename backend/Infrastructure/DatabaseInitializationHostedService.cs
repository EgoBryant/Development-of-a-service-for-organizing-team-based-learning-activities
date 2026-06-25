namespace TeamExamProject.Infrastructure;

/// <summary>Запускает инициализацию БД в фоне, чтобы API быстрее начал отвечать на <c>/health</c>.</summary>
public sealed class DatabaseInitializationHostedService : BackgroundService
{
    private readonly DatabaseInitializationService _initializationService;
    private readonly DatabaseReadiness _readiness;
    private readonly ILogger<DatabaseInitializationHostedService> _logger;
    private readonly IHostApplicationLifetime _lifetime;

    public DatabaseInitializationHostedService(
        DatabaseInitializationService initializationService,
        DatabaseReadiness readiness,
        ILogger<DatabaseInitializationHostedService> logger,
        IHostApplicationLifetime lifetime)
    {
        _initializationService = initializationService;
        _readiness = readiness;
        _logger = logger;
        _lifetime = lifetime;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            await _initializationService.InitializeAsync(stoppingToken);
        }
        catch (Exception exception)
        {
            _logger.LogCritical(exception, "Database initialization terminated the application.");
            _lifetime.StopApplication();
        }
    }
}
