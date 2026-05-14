using TeamExamProject.Contracts.Auth;
using TeamExamProject.Contracts.Profile;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

public interface IProfileService
{
    Task<UserProfileResponse?> GetProfileAsync(int userId, CancellationToken cancellationToken = default);
    Task<UserProfileResponse> MapToProfileResponseAsync(User user, CancellationToken cancellationToken = default);
    Task<ProfileUpdateResult> UpdateProfileAsync(int userId, UpdateProfileDto request, CancellationToken cancellationToken = default);
}
