using TeamExamProject.Contracts.Challenges;

namespace TeamExamProject.Services;

/// <summary>
/// Сервис челленджей: каталог заданий, отправка прогресса командой и проверка преподавателем.
/// </summary>
public interface IChallengesService
{
    /// <summary>Возвращает активные челленджи с учётом команды текущего пользователя.</summary>
    Task<IReadOnlyCollection<ChallengeResponse>> GetActiveAsync(int? currentUserTeamId, CancellationToken cancellationToken = default);

    /// <summary>Создаёт новый челлендж (административная операция).</summary>
    Task<ChallengeResponse> CreateAsync(CreateChallengeDto request, CancellationToken cancellationToken = default);

    /// <summary>Отправляет прогресс выполнения челленджа от имени команды пользователя.</summary>
    Task<ChallengeProgressSubmitResult> SubmitAsync(int userId, int challengeId, SubmitChallengeDto request, CancellationToken cancellationToken = default);

    /// <summary>Проверяет и утверждает или отклоняет отправленный прогресс челленджа.</summary>
    Task<ChallengeProgressReviewResult> ReviewAsync(int progressId, ReviewChallengeProgressDto request, CancellationToken cancellationToken = default);

    /// <summary>Возвращает прогресс команды по всем челленджам.</summary>
    Task<IReadOnlyCollection<ChallengeProgressResponse>> GetTeamProgressAsync(int teamId, CancellationToken cancellationToken = default);
}
