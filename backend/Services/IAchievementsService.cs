using TeamExamProject.Contracts.Achievements;

namespace TeamExamProject.Services;

public interface IAchievementsService
{
    Task<IReadOnlyCollection<AchievementResponse>> GetCatalogAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<UserAchievementResponse>> GetUserAchievementsAsync(int userId, CancellationToken cancellationToken = default);

    /// <summary>Выдаёт ачивку пользователю, если её ещё нет. Возвращает <c>true</c>, если выдали.</summary>
    Task<bool> GrantIfMissingAsync(int userId, string achievementCode, CancellationToken cancellationToken = default);
}
