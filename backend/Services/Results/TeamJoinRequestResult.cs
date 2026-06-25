using TeamExamProject.Contracts.Teams;

namespace TeamExamProject.Services;

/// <summary>
/// Код исхода создания или обработки заявки на вступление в команду.
/// </summary>
public enum TeamJoinRequestResultType
{
    /// <summary>Заявка успешно создана.</summary>
    Created,

    /// <summary>Статус заявки успешно обновлён (одобрение или отклонение).</summary>
    Updated,

    /// <summary>Текущий пользователь не найден.</summary>
    UserNotFound,

    /// <summary>Команда не найдена.</summary>
    TeamNotFound,

    /// <summary>Заявка с указанным идентификатором не найдена.</summary>
    RequestNotFound,

    /// <summary>Пользователь уже состоит в команде.</summary>
    AlreadyInTeam,

    /// <summary>У пользователя уже есть активная заявка в эту команду.</summary>
    AlreadyPending,

    /// <summary>Запрошенный статус заявки недопустим.</summary>
    InvalidStatus,

    /// <summary>У пользователя нет прав на обработку этой заявки.</summary>
    Forbidden,

    /// <summary>Заявитель уже состоит в другой команде.</summary>
    ApplicantAlreadyInTeam,

    /// <summary>Команда достигла лимита участников.</summary>
    TeamFull
}

/// <summary>
/// Результат операции с заявкой на вступление в команду.
/// </summary>
public sealed class TeamJoinRequestResult
{
    /// <summary>Код исхода операции.</summary>
    public required TeamJoinRequestResultType Type { get; init; }

    /// <summary>Заявка; заполняется при создании или обновлении.</summary>
    public TeamJoinRequestResponse? Request { get; init; }

    /// <summary>Команда; заполняется при одобрении заявки и вступлении участника.</summary>
    public TeamResponse? Team { get; init; }
}
