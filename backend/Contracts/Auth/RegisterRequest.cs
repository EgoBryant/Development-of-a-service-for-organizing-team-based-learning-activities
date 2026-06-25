using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Auth;

/// <summary>
/// Тело запроса регистрации нового пользователя для API <c>POST /api/auth/register</c>.
/// </summary>
public class RegisterRequest
{
    /// <summary>Уникальный логин пользователя; от 1 до 100 символов.</summary>
    [Required]
    [MaxLength(100)]
    public string UserName { get; set; } = string.Empty;

    /// <summary>Адрес электронной почты для входа и восстановления доступа.</summary>
    [Required]
    [EmailAddress]
    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    /// <summary>Пароль пользователя; минимум 6 символов.</summary>
    [Required]
    [MinLength(6)]
    [MaxLength(128)]
    public string Password { get; set; } = string.Empty;
}
