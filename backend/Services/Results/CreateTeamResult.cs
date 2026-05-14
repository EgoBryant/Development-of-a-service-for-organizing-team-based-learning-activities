using TeamExamProject.Contracts.Teams;

namespace TeamExamProject.Services;

public enum CreateTeamResultType
{
    Created,
    UserNotFound,
    AlreadyInTeam
}

public sealed class CreateTeamResult
{
    public required CreateTeamResultType Type { get; init; }
    public TeamResponse? Team { get; init; }
}
