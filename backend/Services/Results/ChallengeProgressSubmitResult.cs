using TeamExamProject.Contracts.Challenges;

namespace TeamExamProject.Services;

/// <summary>
/// Код исхода отправки прогресса выполнения челленджа командой.
/// </summary>
public enum ChallengeProgressSubmitResultType
{
    /// <summary>Прогресс успешно отправлен на проверку.</summary>
    Submitted,

    /// <summary>Пользователь с указанным идентификатором не найден.</summary>
    UserNotFound,

    /// <summary>Пользователь не состоит в команде.</summary>
    UserHasNoTeam,

    /// <summary>Челлендж с указанным идентификатором не найден.</summary>
    ChallengeNotFound,

    /// <summary>Челлендж не активен и не принимает отправки.</summary>
    ChallengeInactive,

    /// <summary>Команда уже отправила прогресс по этому челленджу.</summary>
    AlreadySubmitted
}

/// <summary>
/// Результат операции отправки прогресса челленджа.
/// </summary>
public sealed class ChallengeProgressSubmitResult
{
    /// <summary>Код исхода операции.</summary>
    public required ChallengeProgressSubmitResultType Type { get; init; }

    /// <summary>Отправленный прогресс; заполняется при <see cref="ChallengeProgressSubmitResultType.Submitted"/>.</summary>
    public ChallengeProgressResponse? Progress { get; init; }
}
