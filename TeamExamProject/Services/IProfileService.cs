using TeamExamProject.Contracts.Auth;
using TeamExamProject.Contracts.Profile;

namespace TeamExamProject.Services;

public interface IProfileService
{
    Task<UserProfileResponse?> GetProfileAsync(int userId, CancellationToken cancellationToken = default);
    Task<ProfileUpdateResult> UpdateProfileAsync(int userId, UpdateProfileDto request, CancellationToken cancellationToken = default);
}
