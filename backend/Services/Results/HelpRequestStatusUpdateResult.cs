using TeamExamProject.Contracts.HelpRequests;

namespace TeamExamProject.Services;

/// <summary>
/// Код исхода обновления статуса запроса на помощь.
/// </summary>
public enum HelpRequestStatusUpdateResultType
{
    /// <summary>Статус запроса успешно обновлён.</summary>
    Updated,

    /// <summary>Пользователь с указанным идентификатором не найден.</summary>
    UserNotFound,

    /// <summary>Запрос на помощь с указанным идентификатором не найден.</summary>
    HelpRequestNotFound,

    /// <summary>У пользователя нет прав на изменение этого запроса.</summary>
    Forbidden,

    /// <summary>Запрошенный переход статуса недопустим.</summary>
    InvalidStatus
}

/// <summary>
/// Результат операции обновления статуса запроса на помощь.
/// </summary>
public sealed class HelpRequestStatusUpdateResult
{
    /// <summary>Код исхода операции.</summary>
    public required HelpRequestStatusUpdateResultType Type { get; init; }

    /// <summary>Обновлённый запрос; заполняется при <see cref="HelpRequestStatusUpdateResultType.Updated"/>.</summary>
    public HelpRequestResponse? HelpRequest { get; init; }
}
