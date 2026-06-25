using TeamExamProject.Contracts.Votes;

namespace TeamExamProject.Services;

/// <summary>
/// Код исхода создания голоса за вклад участника команды.
/// </summary>
public enum VoteCreateResultType
{
    /// <summary>Голос успешно создан.</summary>
    Created,

    /// <summary>Голосующий пользователь не найден.</summary>
    UserNotFound,

    /// <summary>Голосующий не состоит в команде.</summary>
    UserHasNoTeam,

    /// <summary>Участник, за которого голосуют, не найден.</summary>
    TargetUserNotFound,

    /// <summary>Голосующий и цель находятся в разных командах.</summary>
    DifferentTeams,

    /// <summary>Нельзя голосовать за самого себя.</summary>
    SelfVote,

    /// <summary>Голос за этого участника уже существует.</summary>
    DuplicateVote
}

/// <summary>
/// Результат операции создания голоса.
/// </summary>
public sealed class VoteCreateResult
{
    /// <summary>Код исхода операции.</summary>
    public required VoteCreateResultType Type { get; init; }

    /// <summary>Созданный голос; заполняется при <see cref="VoteCreateResultType.Created"/>.</summary>
    public VoteResponse? Vote { get; init; }
}
