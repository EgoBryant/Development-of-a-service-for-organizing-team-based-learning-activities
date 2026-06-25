namespace TeamExamProject.Services;

/// <summary>
/// Код исхода расформирования команды капитаном.
/// </summary>
public enum DisbandTeamResultType
{
    /// <summary>Команда успешно расформирована.</summary>
    Disbanded,

    /// <summary>Пользователь с указанным идентификатором не найден.</summary>
    UserNotFound,

    /// <summary>Пользователь не состоит в команде.</summary>
    NotInTeam,

    /// <summary>Только капитан может расформировать команду.</summary>
    NotCaptain
}

/// <summary>
/// Результат операции расформирования команды.
/// </summary>
public sealed class DisbandTeamResult
{
    /// <summary>Код исхода операции.</summary>
    public required DisbandTeamResultType Type { get; init; }
}
