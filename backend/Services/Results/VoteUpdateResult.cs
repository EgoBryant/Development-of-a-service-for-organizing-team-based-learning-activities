using TeamExamProject.Contracts.Votes;

namespace TeamExamProject.Services;

public enum VoteUpdateResultType
{
    Updated,
    UserNotFound,
    UserHasNoTeam,
    TargetUserNotFound,
    DifferentTeams,
    VoteNotFound
}

public sealed class VoteUpdateResult
{
    public required VoteUpdateResultType Type { get; init; }
    public VoteResponse? Vote { get; init; }
}
