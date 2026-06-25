using TeamExamProject.Models;

namespace TeamExamProject.Services;

/// <summary>
/// Сервис выпуска JWT-токенов для аутентифицированных пользователей.
/// </summary>
public interface IJwtTokenService
{
    /// <summary>
    /// Формирует JWT-токен с claims пользователя (идентификатор, email, имя, роль).
    /// </summary>
    /// <param name="user">Пользователь, для которого выпускается токен.</param>
    /// <returns>Строка JWT в формате compact serialization.</returns>
    string CreateToken(User user);
}
