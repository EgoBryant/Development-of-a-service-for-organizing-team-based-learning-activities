namespace TeamExamProject.Infrastructure;

/// <summary>Состояние инициализации PostgreSQL при старте приложения.</summary>
public sealed class DatabaseReadiness
{
    private volatile bool _isReady;
    private volatile bool _hasFailed;
    private string? _failureMessage;

    /// <summary>БД готова к обработке запросов (миграции и сид применены).</summary>
    public bool IsReady => _isReady;

    /// <summary>Инициализация завершилась с ошибкой (не связанной с временной недоступностью).</summary>
    public bool HasFailed => _hasFailed;

    /// <summary>Краткое описание ошибки для логов и ответа <c>/health</c>.</summary>
    public string? FailureMessage => _failureMessage;

    /// <summary>Помечает БД как готовую к работе.</summary>
    public void MarkReady()
    {
        _hasFailed = false;
        _failureMessage = null;
        _isReady = true;
    }

    /// <summary>Помечает инициализацию как неуспешную.</summary>
    public void MarkFailed(string message)
    {
        _isReady = false;
        _hasFailed = true;
        _failureMessage = message;
    }
}
