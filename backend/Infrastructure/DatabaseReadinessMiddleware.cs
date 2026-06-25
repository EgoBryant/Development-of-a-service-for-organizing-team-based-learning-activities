namespace TeamExamProject.Infrastructure;

/// <summary>Возвращает 503, пока PostgreSQL не прошёл миграции и сид.</summary>
public sealed class DatabaseReadinessMiddleware
{
    private readonly RequestDelegate _next;

    public DatabaseReadinessMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, DatabaseReadiness readiness)
    {
        if (readiness.IsReady || IsBypassPath(context.Request.Path))
        {
            await _next(context);
            return;
        }

        context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
        context.Response.Headers.RetryAfter = "3";
        await context.Response.WriteAsJsonAsync(new
        {
            title = "Service starting",
            detail = readiness.FailureMessage
                       ?? "База данных инициализируется. Повторите запрос через несколько секунд.",
            status = 503
        });
    }

    private static bool IsBypassPath(PathString path) =>
        path.StartsWithSegments("/health", StringComparison.OrdinalIgnoreCase)
        || path.StartsWithSegments("/swagger", StringComparison.OrdinalIgnoreCase)
        || !path.StartsWithSegments("/api", StringComparison.OrdinalIgnoreCase);
}
