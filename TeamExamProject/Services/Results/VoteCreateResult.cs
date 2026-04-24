using TeamExamProject.Contracts.Votes;

namespace TeamExamProject.Services;

public enum VoteCreateResultType
{
    Created,
    UserNotFound,
    UserHasNoTeam,
    TargetUserNotFound,
    DifferentTeams,
    SelfVote,
    DuplicateVote
}

public sealed class VoteCreateResult
{
    public required VoteCreateResultType Type { get; init; }
    public VoteResponse? Vote { get; init; }
}
