using TeamExamProject.Contracts.Auth;
using TeamExamProject.Contracts.Profile;

namespace TeamExamProject.Services;

public interface IProfileService
{
    Task<UserProfileResponse?> GetProfileAsync(int userId, CancellationToken cancellationToken = default);
    Task<ProfileUpdateResult> UpdateProfileAsync(int userId, UpdateProfileDto request, CancellationToken cancellationToken = default);
}

public enum ProfileUpdateResultType
{
    Updated,
    UserNotFound,
    GroupNotFound,
    StudentTicketAlreadyUsed
}

public sealed class ProfileUpdateResult
{
    public required ProfileUpdateResultType Type { get; init; }
    public UserProfileResponse? Profile { get; init; }
}
