using TeamExamProject.Contracts.Ratings;

namespace TeamExamProject.Services;

/// <summary>
/// Сервис рейтингов: лидерборды команд и пользователей с фильтрацией.
/// </summary>
public interface IRatingsService
{
    /// <summary>Возвращает рейтинг команд с учётом параметров запроса.</summary>
    Task<IReadOnlyCollection<RatingTeamResponse>> GetTeamsAsync(RatingQuery query, CancellationToken cancellationToken = default);

    /// <summary>Возвращает рейтинговую карточку команды по идентификатору.</summary>
    Task<RatingTeamResponse?> GetTeamByIdAsync(int teamId, CancellationToken cancellationToken = default);

    /// <summary>Возвращает рейтинг пользователей с учётом параметров запроса.</summary>
    Task<IReadOnlyCollection<RatingUserResponse>> GetUsersAsync(RatingQuery query, CancellationToken cancellationToken = default);

    /// <summary>Возвращает рейтинговую карточку пользователя по идентификатору.</summary>
    Task<RatingUserResponse?> GetUserByIdAsync(int userId, CancellationToken cancellationToken = default);
}
