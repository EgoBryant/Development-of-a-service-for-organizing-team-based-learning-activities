using TeamExamProject.Contracts.Challenges;

namespace TeamExamProject.Services;

/// <summary>
/// Код исхода проверки прогресса челленджа преподавателем или модератором.
/// </summary>
public enum ChallengeProgressReviewResultType
{
    /// <summary>Прогресс успешно проверен и статус обновлён.</summary>
    Updated,

    /// <summary>Запись прогресса с указанным идентификатором не найдена.</summary>
    NotFound,

    /// <summary>Текущий статус прогресса не допускает запрошенное действие.</summary>
    InvalidStatus
}

/// <summary>
/// Результат операции проверки прогресса челленджа.
/// </summary>
public sealed class ChallengeProgressReviewResult
{
    /// <summary>Код исхода операции.</summary>
    public required ChallengeProgressReviewResultType Type { get; init; }

    /// <summary>Обновлённый прогресс; заполняется при <see cref="ChallengeProgressReviewResultType.Updated"/>.</summary>
    public ChallengeProgressResponse? Progress { get; init; }
}
