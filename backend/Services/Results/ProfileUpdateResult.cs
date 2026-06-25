using TeamExamProject.Contracts.Auth;

namespace TeamExamProject.Services;

/// <summary>
/// Код исхода обновления профиля пользователя.
/// </summary>
public enum ProfileUpdateResultType
{
    /// <summary>Профиль успешно обновлён.</summary>
    Updated,

    /// <summary>Пользователь с указанным идентификатором не найден.</summary>
    UserNotFound,

    /// <summary>Указанная учебная группа не найдена.</summary>
    GroupNotFound,

    /// <summary>Номер студенческого билета уже используется другим пользователем.</summary>
    StudentTicketAlreadyUsed,

    /// <summary>Размер или объём данных аватара превышает допустимый лимит.</summary>
    AvatarPayloadTooLarge
}

/// <summary>
/// Результат операции обновления профиля пользователя.
/// </summary>
public sealed class ProfileUpdateResult
{
    /// <summary>Код исхода операции.</summary>
    public required ProfileUpdateResultType Type { get; init; }

    /// <summary>Обновлённый профиль; заполняется при <see cref="ProfileUpdateResultType.Updated"/>.</summary>
    public UserProfileResponse? Profile { get; init; }
}
