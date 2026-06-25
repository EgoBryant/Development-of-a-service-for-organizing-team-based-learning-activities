using TeamExamProject.Contracts.Teams;

namespace TeamExamProject.Services;

/// <summary>Код исхода обновления команды капитаном.</summary>
public enum UpdateTeamResultType
{
    Updated,
    UserNotFound,
    NotInTeam,
    NotCaptain,
    InvalidName
}

/// <summary>Результат обновления команды.</summary>
public sealed class UpdateTeamResult
{
    public required UpdateTeamResultType Type { get; init; }

    public TeamResponse? Team { get; init; }
}
