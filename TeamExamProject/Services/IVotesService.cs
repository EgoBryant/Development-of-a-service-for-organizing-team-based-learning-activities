using TeamExamProject.Contracts.Votes;

namespace TeamExamProject.Services;

public interface IVotesService
{
    Task<IReadOnlyCollection<VoteResponse>> GetForCurrentTeamAsync(int userId, CancellationToken cancellationToken = default);
    Task<VoteCreateResult> CreateAsync(int userId, CreateVoteDto request, CancellationToken cancellationToken = default);
}

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
