using TeamExamProject.Contracts.HelpRequests;

namespace TeamExamProject.Services;

/// <summary>
/// Код исхода создания запроса на помощь («спасение») другой команде.
/// </summary>
public enum HelpRequestCreateResultType
{
    /// <summary>Запрос на помощь успешно создан.</summary>
    Created,

    /// <summary>Пользователь с указанным идентификатором не найден.</summary>
    UserNotFound,

    /// <summary>Инициатор не состоит в команде.</summary>
    UserHasNoTeam,

    /// <summary>Создавать запрос может только капитан команды.</summary>
    NotCaptain,

    /// <summary>Целевая команда-помощник не найдена.</summary>
    TargetTeamNotFound,

    /// <summary>Нельзя отправить запрос своей же команде.</summary>
    SameTeam
}

/// <summary>
/// Результат операции создания запроса на помощь.
/// </summary>
public sealed class HelpRequestCreateResult
{
    /// <summary>Код исхода операции.</summary>
    public required HelpRequestCreateResultType Type { get; init; }

    /// <summary>Созданный запрос; заполняется при <see cref="HelpRequestCreateResultType.Created"/>.</summary>
    public HelpRequestResponse? HelpRequest { get; init; }
}
