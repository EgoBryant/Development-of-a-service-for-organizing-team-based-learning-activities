using TeamExamProject.Contracts.Challenges;

namespace TeamExamProject.Services;

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
