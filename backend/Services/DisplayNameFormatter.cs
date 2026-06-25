using TeamExamProject.Models;

namespace TeamExamProject.Services;

/// <summary>
/// Единый формат отображаемого имени пользователя.
/// Приоритет: «Фамилия И.» → Nickname → UserName. Возвращает строку в верхнем регистре.
/// </summary>
public static class DisplayNameFormatter
{
    /// <summary>
    /// Форматирует отображаемое имя из сущности пользователя.
    /// </summary>
    /// <param name="user">Пользователь платформы.</param>
    /// <returns>Строка для UI в верхнем регистре.</returns>
    public static string Format(User user) =>
        Format(user.FirstName, user.LastName, user.MiddleName, user.Nickname, user.UserName);

    /// <summary>
    /// Форматирует отображаемое имя из отдельных полей профиля.
    /// </summary>
    /// <param name="firstName">Имя.</param>
    /// <param name="lastName">Фамилия.</param>
    /// <param name="middleName">Отчество (зарезервировано для расширения формата).</param>
    /// <param name="nickname">Псевдоним.</param>
    /// <param name="userName">Логин пользователя.</param>
    /// <returns>Строка для UI в верхнем регистре.</returns>
    public static string Format(
        string? firstName,
        string? lastName,
        string? middleName,
        string? nickname,
        string? userName)
    {
        _ = middleName; // зарезервировано для расширения формата
        var last = (lastName ?? string.Empty).Trim();
        var first = (firstName ?? string.Empty).Trim();

        if (last.Length > 0 || first.Length > 0)
        {
            var initial = first.Length > 0 ? $" {first[..1].ToUpperInvariant()}." : string.Empty;
            var baseName = (last + initial).Trim();
            if (baseName.Length > 0)
            {
                return baseName.ToUpperInvariant();
            }
        }

        if (!string.IsNullOrWhiteSpace(nickname))
        {
            return nickname.Trim().ToUpperInvariant();
        }

        return (userName ?? string.Empty).Trim().ToUpperInvariant();
    }
}
