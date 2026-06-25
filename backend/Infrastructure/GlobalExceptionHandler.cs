using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace TeamExamProject.Infrastructure;

/// <summary>
/// В Development возвращает текст исключения в ProblemDetails (удобно для отладки 500).
/// </summary>
public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly IHostEnvironment _environment;
    private readonly ILogger<GlobalExceptionHandler> _logger;

    /// <summary>Создаёт обработчик с доступом к окружению и логгеру.</summary>
    /// <param name="environment">Окружение хоста (Development/Production).</param>
    /// <param name="logger">Логгер необработанных исключений.</param>
    public GlobalExceptionHandler(IHostEnvironment environment, ILogger<GlobalExceptionHandler> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    /// <summary>Обрабатывает необработанное исключение и возвращает ProblemDetails в JSON.</summary>
    /// <param name="httpContext">Текущий HTTP-контекст запроса.</param>
    /// <param name="exception">Пойманное исключение.</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    /// <returns>Всегда <c>true</c> — исключение считается обработанным.</returns>
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "Unhandled exception");

        var problem = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "Server error",
            Detail = _environment.IsDevelopment()
                ? exception.ToString()
                : "An error occurred while processing your request."
        };

        httpContext.Response.StatusCode = problem.Status ?? StatusCodes.Status500InternalServerError;
        httpContext.Response.ContentType = "application/problem+json";
        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken: cancellationToken);
        return true;
    }
}
