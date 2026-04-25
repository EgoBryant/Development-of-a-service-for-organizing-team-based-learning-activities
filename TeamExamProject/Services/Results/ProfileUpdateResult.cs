using TeamExamProject.Contracts.Auth;

namespace TeamExamProject.Services;

public enum ProfileUpdateResultType
{
    Updated,
    UserNotFound,
    GroupNotFound,
    StudentTicketAlreadyUsed,
    AvatarPayloadTooLarge
}

public sealed class ProfileUpdateResult
{
    public required ProfileUpdateResultType Type { get; init; }
    public UserProfileResponse? Profile { get; init; }
}
