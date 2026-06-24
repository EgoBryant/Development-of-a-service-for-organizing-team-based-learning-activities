using TeamExamProject.Contracts.Teams;

namespace TeamExamProject.Services;

public enum TeamJoinRequestResultType
{
    Created,
    Updated,
    UserNotFound,
    TeamNotFound,
    RequestNotFound,
    AlreadyInTeam,
    AlreadyPending,
    InvalidStatus,
    Forbidden,
    ApplicantAlreadyInTeam,
    TeamFull
}

public sealed class TeamJoinRequestResult
{
    public required TeamJoinRequestResultType Type { get; init; }
    public TeamJoinRequestResponse? Request { get; init; }
    public TeamResponse? Team { get; init; }
}
