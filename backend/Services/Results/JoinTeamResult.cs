using TeamExamProject.Contracts.Teams;

namespace TeamExamProject.Services;

/// <summary>
/// Код исхода вступления пользователя в команду.
/// </summary>
public enum JoinTeamResultType
{
    /// <summary>Пользователь успешно вступил в команду.</summary>
    Joined,

    /// <summary>Пользователь с указанным идентификатором не найден.</summary>
    UserNotFound,

    /// <summary>Пользователь уже состоит в другой команде.</summary>
    AlreadyInTeam,

    /// <summary>Команда с указанным кодом или идентификатором не найдена.</summary>
    TeamNotFound,

    /// <summary>Достигнут лимит участников команды.</summary>
    TeamFull
}

/// <summary>
/// Результат операции вступления в команду.
/// </summary>
public sealed class JoinTeamResult
{
    /// <summary>Код исхода операции.</summary>
    public required JoinTeamResultType Type { get; init; }

    /// <summary>Команда, в которую вступил пользователь; заполняется при <see cref="JoinTeamResultType.Joined"/>.</summary>
    public TeamResponse? Team { get; init; }
}
