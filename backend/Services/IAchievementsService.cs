using TeamExamProject.Contracts.Achievements;

namespace TeamExamProject.Services;

/// <summary>
/// Сервис достижений: каталог ачивок, прогресс пользователя и выдача наград.
/// </summary>
public interface IAchievementsService
{
    /// <summary>Возвращает полный каталог доступных достижений.</summary>
    Task<IReadOnlyCollection<AchievementResponse>> GetCatalogAsync(CancellationToken cancellationToken = default);

    /// <summary>Возвращает достижения, полученные указанным пользователем.</summary>
    Task<IReadOnlyCollection<UserAchievementResponse>> GetUserAchievementsAsync(int userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Выдаёт достижение пользователю, если оно ещё не получено.
    /// </summary>
    /// <returns><c>true</c>, если достижение было выдано; <c>false</c>, если уже было у пользователя.</returns>
    Task<bool> GrantIfMissingAsync(int userId, string achievementCode, CancellationToken cancellationToken = default);

    /// <summary>
    /// Выдаёт «В игре!», если у пользователя есть баллы за задания, не считая бонусов от других ачивок.
    /// </summary>
    Task TryGrantTop3TeamWhenTaskPointsEarnedAsync(int userId, CancellationToken cancellationToken = default);
}
