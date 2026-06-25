using TeamExamProject.Contracts.CheckIns;

namespace TeamExamProject.Services;

/// <summary>
/// Код исхода создания еженедельного чек-ина команды.
/// </summary>
public enum CheckInCreateResultType
{
    /// <summary>Чек-ин успешно создан.</summary>
    Created,

    /// <summary>Пользователь с указанным идентификатором не найден.</summary>
    UserNotFound,

    /// <summary>Пользователь не состоит ни в одной команде.</summary>
    UserHasNoTeam,

    /// <summary>Чек-ин за текущую неделю уже существует.</summary>
    DuplicateWeek
}

/// <summary>
/// Результат операции создания чек-ина.
/// </summary>
public sealed class CheckInCreateResult
{
    /// <summary>Код исхода операции.</summary>
    public required CheckInCreateResultType Type { get; init; }

    /// <summary>Созданный чек-ин; заполняется при <see cref="CheckInCreateResultType.Created"/>.</summary>
    public CheckInResponse? CheckIn { get; init; }
}
