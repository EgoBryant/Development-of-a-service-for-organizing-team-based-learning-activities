using TeamExamProject.Contracts.Challenges;

namespace TeamExamProject.Services;

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
