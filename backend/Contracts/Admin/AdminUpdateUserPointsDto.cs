using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Admin;

/// <summary>
/// Тело запроса администратора для обновления личных очков пользователя по идентификатору.
/// </summary>
public class AdminUpdateUserPointsDto
{
    /// <summary>Новое значение личных очков пользователя (от 0 до 1 000 000).</summary>
    [Range(0, 1_000_000)]
    public int UserPoints { get; set; }
}

/// <summary>
/// Тело запроса администратора для обновления личных очков пользователя по адресу электронной почты.
/// </summary>
public class AdminUpdateUserPointsByEmailDto
{
    /// <summary>Адрес электронной почты пользователя, чьи очки нужно обновить.</summary>
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    /// <summary>Новое значение личных очков пользователя (от 0 до 1 000 000).</summary>
    [Range(0, 1_000_000)]
    public int UserPoints { get; set; }
}

/// <summary>
/// Тело запроса администратора для обновления счёта команды.
/// </summary>
public class AdminUpdateTeamScoreDto
{
    /// <summary>Новое значение счёта команды (от 0 до 1 000 000).</summary>
    [Range(0, 1_000_000)]
    public int Score { get; set; }
}

/// <summary>
/// Тело запроса администратора для модерации объявления «Биржи знаний».
/// </summary>
public class AdminModerateKnowledgePostDto
{
    /// <summary>delete | hide. В MVP используется только delete.</summary>
    public string Action { get; set; } = "delete";
}
