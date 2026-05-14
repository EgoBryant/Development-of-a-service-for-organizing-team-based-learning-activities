using TeamExamProject.Contracts.Votes;

namespace TeamExamProject.Services;

public interface IVotesService
{
    Task<IReadOnlyCollection<VoteResponse>> GetForCurrentTeamAsync(int userId, CancellationToken cancellationToken = default);
    Task<VoteCreateResult> CreateAsync(int userId, CreateVoteDto request, CancellationToken cancellationToken = default);
}
