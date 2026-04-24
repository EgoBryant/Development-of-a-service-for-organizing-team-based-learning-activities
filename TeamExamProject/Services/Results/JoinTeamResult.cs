using TeamExamProject.Contracts.Teams;

namespace TeamExamProject.Services;

public enum JoinTeamResultType
{
    Joined,
    UserNotFound,
    AlreadyInTeam,
    TeamNotFound
}

public sealed class JoinTeamResult
{
    public required JoinTeamResultType Type { get; init; }
    public TeamResponse? Team { get; init; }
}
