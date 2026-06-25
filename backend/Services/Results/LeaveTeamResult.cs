namespace TeamExamProject.Services;

/// <summary>
/// Код исхода выхода пользователя из команды.
/// </summary>
public enum LeaveTeamResultType
{
    /// <summary>Пользователь успешно покинул команду.</summary>
    Left,

    /// <summary>Пользователь с указанным идентификатором не найден.</summary>
    UserNotFound,

    /// <summary>Пользователь не состоит в команде.</summary>
    NotInTeam,

    /// <summary>Капитан не может выйти из команды без передачи роли или расформирования.</summary>
    IsCaptain
}

/// <summary>
/// Результат операции выхода из команды.
/// </summary>
public sealed class LeaveTeamResult
{
    /// <summary>Код исхода операции.</summary>
    public required LeaveTeamResultType Type { get; init; }
}
