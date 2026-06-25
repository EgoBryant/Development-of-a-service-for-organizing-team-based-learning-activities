using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Auth;

/// <summary>
/// Тело запроса входа в систему для API <c>POST /api/auth/login</c>.
/// </summary>
public class LoginRequest
{
    /// <summary>Адрес электронной почты, указанный при регистрации.</summary>
    [Required]
    [EmailAddress]
    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    /// <summary>Пароль пользователя.</summary>
    [Required]
    [MaxLength(128)]
    public string Password { get; set; } = string.Empty;
}
