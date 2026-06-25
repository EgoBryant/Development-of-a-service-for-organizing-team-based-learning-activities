using Microsoft.EntityFrameworkCore;
using TeamExamProject.Data;
using TeamExamProject.Infrastructure;

namespace TeamExamProject.Infrastructure.Extensions;

/// <summary>Методы расширения для настройки конвейера и инициализации БД при старте приложения.</summary>
public static class WebApplicationExtensions
{
    private const string FrontendCorsPolicyName = "Frontend";

    /// <summary>Регистрирует фоновую инициализацию PostgreSQL.</summary>
    public static IServiceCollection AddDatabaseInitialization(this IServiceCollection services)
    {
        services.AddSingleton<DatabaseReadiness>();
        services.AddSingleton<DatabaseInitializationService>();
        services.AddHostedService<DatabaseInitializationHostedService>();
        return services;
    }

    /// <summary>Применяет middleware готовности БД.</summary>
    public static WebApplication UseDatabaseReadiness(this WebApplication app)
    {
        app.UseMiddleware<DatabaseReadinessMiddleware>();
        return app;
    }

    /// <summary>Применяет миграции EF Core и заполняет начальные данные с повторными попытками подключения.</summary>
    /// <param name="app">Экземпляр веб-приложения.</param>
    /// <param name="connectionString">Строка подключения к PostgreSQL.</param>
    [Obsolete("Use AddDatabaseInitialization and DatabaseInitializationHostedService instead.")]
    public static async Task InitializeDatabaseAsync(
        this WebApplication app,
        string connectionString)
    {
        await using var scope = app.Services.CreateAsyncScope();
        var initializationService = scope.ServiceProvider.GetRequiredService<DatabaseInitializationService>();
        await initializationService.InitializeAsync();
    }

    /// <summary>Регистрирует middleware: Swagger, обработку ошибок, CORS, аутентификацию и авторизацию.</summary>
    /// <param name="app">Экземпляр веб-приложения.</param>
    /// <returns>Тот же экземпляр для цепочки вызовов.</returns>
    public static WebApplication UseApplicationPipeline(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseExceptionHandler();
        app.UseCors(FrontendCorsPolicyName);
        app.UseAuthentication();
        app.UseAuthorization();

        return app;
    }

    /// <summary>Регистрирует контроллеры API и эндпоинт проверки здоровья <c>/health</c>.</summary>
    /// <param name="app">Экземпляр веб-приложения.</param>
    /// <returns>Тот же экземпляр для цепочки вызовов.</returns>
    public static WebApplication MapApplicationEndpoints(this WebApplication app)
    {
        app.MapControllers();
        app.MapGet("/health", async (AppDbContext dbContext, DatabaseReadiness readiness) =>
        {
            if (!readiness.IsReady)
            {
                return Results.Json(
                    new
                    {
                        status = readiness.HasFailed ? "failed" : "starting",
                        database = "initializing"
                    },
                    statusCode: StatusCodes.Status503ServiceUnavailable);
            }

            var canConnect = await dbContext.Database.CanConnectAsync();
            return canConnect
                ? Results.Ok(new { status = "ok", database = "up" })
                : Results.Problem(title: "Database is unavailable", statusCode: StatusCodes.Status503ServiceUnavailable);
        });

        return app;
    }
}
