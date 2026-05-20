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

public enum ChallengeProgressSubmitResultType
{
    Submitted,
    UserNotFound,
    UserHasNoTeam,
    ChallengeNotFound,
    ChallengeInactive,
    AlreadySubmitted
}

public sealed class ChallengeProgressSubmitResult
{
    public required ChallengeProgressSubmitResultType Type { get; init; }
    public ChallengeProgressResponse? Progress { get; init; }
}

public enum ChallengeProgressReviewResultType
{
    Updated,
    NotFound,
    InvalidStatus
}

public sealed class ChallengeProgressReviewResult
{
    public required ChallengeProgressReviewResultType Type { get; init; }
    public ChallengeProgressResponse? Progress { get; init; }
}
