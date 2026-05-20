using TeamExamProject.Contracts.Challenges;

namespace TeamExamProject.Services;

public interface IChallengesService
{
    Task<IReadOnlyCollection<ChallengeResponse>> GetActiveAsync(int? currentUserTeamId, CancellationToken cancellationToken = default);
    Task<ChallengeResponse> CreateAsync(CreateChallengeDto request, CancellationToken cancellationToken = default);
    Task<ChallengeProgressSubmitResult> SubmitAsync(int userId, int challengeId, SubmitChallengeDto request, CancellationToken cancellationToken = default);
    Task<ChallengeProgressReviewResult> ReviewAsync(int progressId, ReviewChallengeProgressDto request, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ChallengeProgressResponse>> GetTeamProgressAsync(int teamId, CancellationToken cancellationToken = default);
}
