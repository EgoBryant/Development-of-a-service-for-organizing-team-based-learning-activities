namespace TeamExamProject.Services;

/// <summary>
/// Пересчёт командного счёта как суммы персональных баллов участников.
/// </summary>
public interface ITeamScoreService
{
    /// <summary>
    /// Пересчитывает <see cref="Models.Team.Score"/> для команды и при необходимости обновляет КРК.
    /// </summary>
    /// <returns>Новый счёт команды или <c>null</c>, если команда не найдена.</returns>
    Task<int?> RecalculateTeamScoreAsync(int teamId, bool recalculateKrk = true, CancellationToken cancellationToken = default);

    /// <summary>Пересчитывает счёт команды, в которой состоит пользователь.</summary>
    Task RecalculateForUserTeamAsync(int userId, bool recalculateKrk = true, CancellationToken cancellationToken = default);

    /// <summary>Пересчитывает счёт всех команд в системе.</summary>
    Task RecalculateAllTeamScoresAsync(bool recalculateKrk = true, CancellationToken cancellationToken = default);
}
