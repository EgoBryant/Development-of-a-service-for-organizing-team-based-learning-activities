using TeamExamProject.Contracts.Votes;

namespace TeamExamProject.Services;

/// <summary>
/// Код исхода изменения ранее поставленного голоса.
/// </summary>
public enum VoteUpdateResultType
{
    /// <summary>Голос успешно обновлён.</summary>
    Updated,

    /// <summary>Голосующий пользователь не найден.</summary>
    UserNotFound,

    /// <summary>Голосующий не состоит в команде.</summary>
    UserHasNoTeam,

    /// <summary>Участник, за которого голосуют, не найден.</summary>
    TargetUserNotFound,

    /// <summary>Голосующий и цель находятся в разных командах.</summary>
    DifferentTeams,

    /// <summary>Голос для изменения не найден.</summary>
    VoteNotFound
}

/// <summary>
/// Результат операции изменения голоса.
/// </summary>
public sealed class VoteUpdateResult
{
    /// <summary>Код исхода операции.</summary>
    public required VoteUpdateResultType Type { get; init; }

    /// <summary>Обновлённый голос; заполняется при <see cref="VoteUpdateResultType.Updated"/>.</summary>
    public VoteResponse? Vote { get; init; }
}
