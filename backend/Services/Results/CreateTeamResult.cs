using TeamExamProject.Contracts.Teams;

namespace TeamExamProject.Services;

/// <summary>
/// Код исхода создания новой команды.
/// </summary>
public enum CreateTeamResultType
{
    /// <summary>Команда успешно создана, пользователь назначен капитаном.</summary>
    Created,

    /// <summary>Пользователь с указанным идентификатором не найден.</summary>
    UserNotFound,

    /// <summary>Пользователь уже состоит в другой команде.</summary>
    AlreadyInTeam
}

/// <summary>
/// Результат операции создания команды.
/// </summary>
public sealed class CreateTeamResult
{
    /// <summary>Код исхода операции.</summary>
    public required CreateTeamResultType Type { get; init; }

    /// <summary>Созданная команда; заполняется при <see cref="CreateTeamResultType.Created"/>.</summary>
    public TeamResponse? Team { get; init; }
}
