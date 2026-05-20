using TeamExamProject.Contracts.Ratings;

namespace TeamExamProject.Services;

public interface IRatingsService
{
    Task<IReadOnlyCollection<RatingTeamResponse>> GetTeamsAsync(RatingQuery query, CancellationToken cancellationToken = default);
    Task<RatingTeamResponse?> GetTeamByIdAsync(int teamId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<RatingUserResponse>> GetUsersAsync(RatingQuery query, CancellationToken cancellationToken = default);
    Task<RatingUserResponse?> GetUserByIdAsync(int userId, CancellationToken cancellationToken = default);
}
